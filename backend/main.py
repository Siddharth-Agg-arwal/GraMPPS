from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from forecast import router as forecast_router, start_periodic_task
import psycopg2
import pandas as pd
from datetime import datetime, timedelta

app = FastAPI()
app.include_router(forecast_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_CONFIG = dict(
    dbname="postgres",
    user="postgres",
    password="@Sid2003",
    host="localhost",
    port="5432"
)

def get_threshold_base(hour: int) -> float:
    if 0 <= hour < 6:
        return 4000
    elif 6 <= hour < 8:
        return 5500
    elif 8 <= hour < 12:
        return 5000
    elif 12 <= hour < 14:
        return 6000
    elif 14 <= hour < 18:
        return 8000
    elif 18 <= hour < 21:
        return 7000
    elif 21 <= hour < 24:
        return 5500
    else:
        return 4000

router = APIRouter()

@router.get("/api/power-comparison")
def get_power_comparison():
    print("DEBUG: /api/power-comparison called")
    conn = psycopg2.connect(**DB_CONFIG)

    # Get all actuals and forecasts
    actuals = pd.read_sql(
        "SELECT timestamp, target_power FROM timeseries_data ORDER BY timestamp ASC",
        conn
    )
    forecasts = pd.read_sql(
        "SELECT timestamp, predicted_value FROM forecast ORDER BY timestamp ASC",
        conn
    )
    conn.close()
    actuals = actuals.set_index("timestamp")
    forecasts = forecasts.set_index("timestamp")

    # Only keep timestamps present in BOTH tables
    common_timestamps = actuals.index.intersection(forecasts.index)

    result = []
    for ts in common_timestamps:
        actual = actuals.at[ts, "target_power"]
        forecast = forecasts.at[ts, "predicted_value"]
        hour = pd.to_datetime(ts).hour
        threshold = get_threshold_base(hour)
        result.append({
            "timestamp": str(ts),
            "actual": actual,
            "forecast": forecast,
            "threshold": threshold
        })
    print(f"DEBUG: Returning {len(result)} rows to frontend")
    if len(result) > 0:
        print("DEBUG: First row sample:", result[0])
    return result

@router.get("/api/actuals")
def get_actuals(limit: int = 24):
    conn = psycopg2.connect(
        dbname="postgres",
        user="postgres",
        password="@Sid2003",
        host="localhost",
        port="5432"
    )
    df = pd.read_sql(
        f"SELECT timestamp, target_power FROM timeseries_data ORDER BY timestamp DESC LIMIT {limit}",
        conn
    )
    conn.close()
    df = df.sort_values("timestamp")
    return [{"timestamp": str(row["timestamp"]), "value": row["target_power"]} for _, row in df.iterrows()]

@router.get("/api/current-reading")
def get_current_reading():
    conn = psycopg2.connect(
        dbname="postgres",
        user="postgres",
        password="@Sid2003",
        host="localhost",
        port="5432"
    )
    df = pd.read_sql(
        "SELECT timestamp, target_power FROM timeseries_data ORDER BY timestamp DESC LIMIT 1",
        conn
    )
    conn.close()
    if not df.empty:
        return {"timestamp": str(df.iloc[0]["timestamp"]), "value": df.iloc[0]["target_power"]}
    else:
        return {"timestamp": None, "value": None}

@router.get("/api/forecast-table")
def get_forecast_table():
    conn = psycopg2.connect(
        dbname="postgres",
        user="postgres",
        password="@Sid2003",
        host="localhost",
        port="5432"
    )
    df = pd.read_sql(
        "SELECT timestamp, predicted_value FROM forecast ORDER BY timestamp ASC",
        conn
    )
    conn.close()
    return [
        {"timestamp": str(row["timestamp"]), "value": row["predicted_value"]}
        for _, row in df.iterrows()
    ]

@app.get("/")
def read_root():
    return {"message": "FastAPI backend is running!"}

@app.get("/stats/patients")
def get_total_patients():
    return {"total_patients": 44}

@app.on_event("startup")
async def startup_event():
    start_periodic_task()

app.include_router(router)