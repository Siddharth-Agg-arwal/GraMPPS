import pandas as pd
import psycopg2
from forecast import run_forecast_custom_context

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

def generate_forecast_and_store(csv_path):
    create_forecast_table()
    # Load context from train.csv
    df = pd.read_csv(csv_path, parse_dates=["timestamp"])
    context_df = df[["timestamp", "target:Power"]].rename(columns={"target:Power": "total_load_actual"})
    last_actual_ts = context_df["timestamp"].max()
    print("Last actual timestamp in CSV:", last_actual_ts)

    periods = 288
    freq = "5min"
    start_time = last_actual_ts + pd.Timedelta(minutes=5)

    # Run forecast using the new function
    result = run_forecast_custom_context(context_df, start_time, periods, freq)
    forecast_values = result["forecast"]

    forecast_times = pd.date_range(
        start=start_time,
        periods=periods,
        freq=freq
    )

    # Store in forecast table
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()
    for ts, pred in zip(forecast_times, forecast_values):
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
    print(f"Inserted/updated {len(forecast_times)} forecast rows for the next day.")

if __name__ == "__main__":
    csv_path = "train.csv"
    generate_forecast_and_store(csv_path)