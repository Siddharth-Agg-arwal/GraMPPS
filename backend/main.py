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
        return 1000
    elif 6 <= hour < 8:
        return 1500
    elif 8 <= hour < 12:
        return 2000
    elif 12 <= hour < 14:
        return 3000
    elif 14 <= hour < 18:
        return 5000
    elif 18 <= hour < 21:
        return 4000
    elif 21 <= hour < 24:
        return 2500
    else:
        return 1000

router = APIRouter()

@router.get("/api/power-comparison")
def get_power_comparison():
    print("DEBUG: /api/power-comparison called")
    conn = psycopg2.connect(**DB_CONFIG)
    # For production, use this:
    # now = datetime.utcnow()
    # since = now - timedelta(days=1)
    # print(f"DEBUG: Filtering data since {since} (UTC now: {now})")

    # For current dataset, use fixed reference timestamp
    reference = pd.to_datetime("2017-10-31 23:00:00+00:00")
    since = reference - timedelta(days=1)
    print(f"DEBUG: Filtering data since {since} (reference: {reference})")

    actuals = pd.read_sql(
        "SELECT timestamp, target_power FROM timeseries_data WHERE timestamp >= %s AND timestamp <= %s ORDER BY timestamp ASC",
        conn,
        params=[since, reference]
    )
    print(f"DEBUG: Retrieved {len(actuals)} actual rows")
    forecasts = pd.read_sql(
        "SELECT timestamp, predicted_value FROM forecast WHERE timestamp >= %s AND timestamp <= %s",
        conn,
        params=[since, reference]
    )
    print(f"DEBUG: Retrieved {len(forecasts)} forecast rows")
    conn.close()
    forecasts = forecasts.set_index("timestamp")
    result = []
    for _, row in actuals.iterrows():
        ts = row["timestamp"]
        actual = row["target_power"]
        forecast = forecasts["predicted_value"].get(ts, None)
        hour = pd.to_datetime(ts).hour
        threshold = get_threshold_base(hour)
        result.append({
            "timestamp": str(ts),  # Ensure string for JSON serialization
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