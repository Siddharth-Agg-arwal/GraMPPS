from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from forecast import router as forecast_router, start_periodic_task
import psycopg2
import pandas as pd

app = FastAPI()
app.include_router(forecast_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

router = APIRouter()

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
    # Return in ascending order
    df = df.sort_values("timestamp")
    # print("hmm", df)
    return [{"timestamp": row["timestamp"], "value": row["target_power"]} for _, row in df.iterrows()]

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