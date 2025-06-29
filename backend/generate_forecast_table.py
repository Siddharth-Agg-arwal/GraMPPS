import pandas as pd
import psycopg2
from tsfm_public import TinyTimeMixerForPrediction, TimeSeriesForecastingPipeline
import torch

DB_CONFIG = dict(
    dbname="postgres",
    user="postgres",
    password="@Sid2003",
    host="localhost",
    port="5432"
)

FORECAST_TABLE = "forecast"

def create_forecast_table():
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()
    # Drop the pre-existing forecast table if it exists
    cur.execute(f"DROP TABLE IF EXISTS {FORECAST_TABLE};")
    conn.commit()
    # Create the forecast table
    cur.execute(f"""
        CREATE TABLE IF NOT EXISTS {FORECAST_TABLE} (
            timestamp TIMESTAMPTZ PRIMARY KEY,
            predicted_value DOUBLE PRECISION NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
    """)
    conn.commit()
    cur.close()
    conn.close()

def predict_2day_5min_continuous(csv_file, model, device, output_csv="two_day_5min.csv"):
    # 1) Load & rename
    df = pd.read_csv(csv_file, parse_dates=["timestamp"])
    df.rename(columns={"target:Power": "total_load_actual"}, inplace=True)
    df = df.sort_values("timestamp").reset_index(drop=True)

    # 2) Compute sizes
    freq = "5min"
    delta = pd.Timedelta(freq)
    total_days = 2
    total_periods = int(pd.Timedelta(days=total_days) / delta)  # 576
    chunk_size = 96                                            # model max
    chunks = (total_periods + chunk_size - 1) // chunk_size   # =6

    # 3) Extract & normalize context (last 96h = 1152 points)
    context_points = int(pd.Timedelta(hours=96) / delta)
    context_df = df.iloc[-context_points:].copy()
    μ, σ = context_df["total_load_actual"].mean(), context_df["total_load_actual"].std()
    context_df["total_load_actual"] = (context_df["total_load_actual"] - μ) / σ

    all_preds = []
    last_ts = context_df["timestamp"].iloc[-1]

    for c in range(chunks):
        # how many to forecast this chunk
        remain = total_periods - c * chunk_size
        h = min(chunk_size, remain)

        # build pipeline for this chunk
        pipe = TimeSeriesForecastingPipeline(
            model=model,
            timestamp_column="timestamp",
            id_columns=[],
            target_columns=["total_load_actual"],
            explode_forecasts=False,
            freq=freq,
            device=device,
            prediction_length=h,
        )

        # build future placeholders
        future_idx = pd.date_range(
            start=last_ts + delta,
            periods=h,
            freq=freq,
            tz=last_ts.tz if hasattr(last_ts, 'tz') else None
        )
        future_df = pd.DataFrame({
            "timestamp": future_idx,
            "total_load_actual": pd.NA
        })

        # one‐shot forecast for h steps
        inp = pd.concat([
            context_df[["timestamp","total_load_actual"]],
            future_df
        ], ignore_index=True)
        res = pipe(inp)

        # extract, denormalize, store
        preds = res["total_load_actual_prediction"].iloc[-1]  # list of len h
        series = pd.Series(preds, index=future_idx)
        series = series * σ + μ
        all_preds.append(series)

        # extend context_df with normalized predictions for next chunk
        new_context = series.to_frame(name="total_load_actual")
        new_context["total_load_actual"] = (new_context["total_load_actual"] - μ) / σ
        new_context = new_context.reset_index().rename(columns={"index":"timestamp"})
        context_df = pd.concat([context_df, new_context], ignore_index=True)

        last_ts = future_idx[-1]

        print(f"⏳ Completed chunk {c+1}/{chunks} ({h} steps)")

    # 4) Combine all predictions
    full = pd.concat(all_preds)
    forecast_df = full.rename("forecasted_power").reset_index()
    forecast_df.columns = ["timestamp","forecasted_power"]

    # 5) Save
    forecast_df.to_csv(output_csv, index=False)
    print(f"✅ Saved forecast to {output_csv}")

    return forecast_df

def populate_forecast_from_csv(csv_path):
    create_forecast_table()
    df = pd.read_csv(csv_path, parse_dates=["timestamp"])
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()
    for _, row in df.iterrows():
        ts = row["timestamp"]
        pred = row["forecasted_power"]
        print(f"Inserting: {ts}, {pred}")
        try:
            cur.execute(f"""
                INSERT INTO {FORECAST_TABLE} (timestamp, predicted_value)
                VALUES (%s, %s)
                ON CONFLICT (timestamp) DO UPDATE SET predicted_value = EXCLUDED.predicted_value
            """, (ts, float(pred)))
        except Exception as e:
            print("DB insert error:", e)
    conn.commit()
    cur.close()
    conn.close()
    print(f"Inserted/updated {len(df)} forecast rows.")

def print_forecast_table():
    conn = psycopg2.connect(**DB_CONFIG)
    df = pd.read_sql(
        f"SELECT timestamp, predicted_value FROM {FORECAST_TABLE} ORDER BY timestamp ASC",
        conn
    )
    conn.close()
    print("All rows in forecast table:")
    print(df.to_string(index=False))

if __name__ == "__main__":
    # Commented out all other logic for running prediction using SQL data
    device = "cpu"
    model = TinyTimeMixerForPrediction.from_pretrained(
        "ibm-granite/granite-timeseries-ttm-r2",
        num_input_channels=1,
    )

    # Run the forecast and save to CSV, then populate the table
    predict_2day_5min_continuous(
        csv_file="train_wo_24_hr.csv",
        model=model,
        device=device,
        output_csv="two_day_5min.csv"
    )

    populate_forecast_from_csv("two_day_5min.csv")
    print_forecast_table()