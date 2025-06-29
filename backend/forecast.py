import pandas as pd
import psycopg2
from datetime import timedelta
# import torch
from fastapi import APIRouter, BackgroundTasks
from tsfm_public import TinyTimeMixerForPrediction, TimeSeriesForecastingPipeline


# --- CONFIGURATION ---
DB_CONFIG = dict(
    dbname="postgres",
    user="postgres",
    password="@Sid2003",
    host="localhost",
    port="5432"
)
COST_PER_KWH = 8.0  
CARBON_PER_KWH = 0.82
HORIZON = 24  # or 24*7 for a week

# --- FASTAPI ROUTER ---
router = APIRouter()

def fetch_last_96_hours():
    conn = psycopg2.connect(**DB_CONFIG)
    latest = pd.read_sql("SELECT MAX(timestamp) as max_ts FROM timeseries_data", conn)
    latest_ts = latest['max_ts'][0]
    since_ts = pd.to_datetime(latest_ts) - pd.Timedelta(hours=96)
    query = f"""
        SELECT timestamp, target_power
        FROM timeseries_data
        WHERE timestamp > '{since_ts}'
        ORDER BY timestamp
    """
    df = pd.read_sql(query, conn)
    conn.close()
    df = df.rename(columns={"target_power": "total_load_actual"})
    return df

def prepare_input_df(context_df, horizon=HORIZON):
    future_index = pd.date_range(
        start=context_df["timestamp"].iloc[-1] + pd.Timedelta(hours=1),
        periods=horizon,
        freq="H"
    )
    future_df = pd.DataFrame({
        "timestamp": future_index,
        "total_load_actual": pd.NA
    })
    input_df = pd.concat([
        context_df[["timestamp", "total_load_actual"]],
        future_df
    ]).reset_index(drop=True)
    return input_df

def run_forecast_and_estimate():
    print("Starting model load...")
    # 1. Fetch last 96 hours
    df = fetch_last_96_hours()
    context_df = df.sort_values("timestamp").iloc[-96:].copy()
    input_df = prepare_input_df(context_df)

    # 2. Load model and pipeline
    # device = "cpu"
    model = TinyTimeMixerForPrediction.from_pretrained(
        "ibm-granite/granite-timeseries-ttm-r2",
        num_input_channels=1,
    )
    print("Model loaded.")
    print("Starting pipeline...")
    pipeline = TimeSeriesForecastingPipeline(
        model=model,
        timestamp_column="timestamp",
        id_columns=[],
        target_columns=["total_load_actual"],
        explode_forecasts=True,
        freq="h",
        # device=device
    )
    print("Pipeline created.")
    print("Running forecast...")
    # 3. Run forecast
    forecast_df = pipeline(input_df)
    print("Forecast complete.")
    # print("Forecast columns:", forecast_df.columns)
    # print(forecast_df.head()) #debug to see the forecast dataset 

    # 4. Estimation
    def estimate_cost(values): return sum(values) * COST_PER_KWH
    def estimate_carbon(values): return sum(values) * CARBON_PER_KWH
    values = forecast_df["total_load_actual"].tolist()
    # print(values) #debug print to see all the predicted values
    result = {
        "cost": estimate_cost(values),  
        "carbon": estimate_carbon(values),
        "forecast": values
    }
    print("Inserting into DB...")
    # for ts, pred in ...
    print("DB insert complete.")
    return result

# --- FASTAPI ENDPOINT ---
@router.get("/run-forecast")
def run_forecast_endpoint():
    result = run_forecast_and_estimate()
    # print("Forecasting result:", result)
    return result

# --- SCHEDULER SETUP ---
import asyncio

async def periodic_forecast_task():
    while True:
        run_forecast_and_estimate()
        await asyncio.sleep(300)  # 5 minutes

def start_periodic_task():
    import threading
    loop = asyncio.new_event_loop()
    threading.Thread(target=loop.run_until_complete, args=(periodic_forecast_task(),), daemon=True).start()

def run_forecast_custom_context(context_df, start_time, periods, freq):
    """
    context_df: DataFrame with columns ['timestamp', 'total_load_actual']
    start_time: pd.Timestamp, start of forecast window (exclusive)
    periods: int, number of forecast steps
    freq: str, pandas offset alias (e.g. '5min')
    """
    # Prepare input DataFrame
    future_index = pd.date_range(
        start=start_time,
        periods=periods,
        freq=freq
    )
    future_df = pd.DataFrame({
        "timestamp": future_index,
        "total_load_actual": pd.NA
    })
    input_df = pd.concat([
        context_df[["timestamp", "total_load_actual"]],
        future_df
    ]).reset_index(drop=True)

    # Load model and pipeline
    model = TinyTimeMixerForPrediction.from_pretrained(
        "ibm-granite/granite-timeseries-ttm-r2",
        num_input_channels=1,
    )
    pipeline = TimeSeriesForecastingPipeline(
        model=model,
        timestamp_column="timestamp",
        id_columns=[],
        target_columns=["total_load_actual"],
        explode_forecasts=True,
        freq=freq,
    )

    # Run forecast
    forecast_df = pipeline(input_df)
    forecast_values = forecast_df["total_load_actual"].iloc[-periods:].tolist()
    return {
        "forecast": forecast_values
    }
