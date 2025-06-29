import pandas as pd
import psycopg2

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
    # generate_forecast_and_store("train.csv")
    populate_forecast_from_csv("two_day_5min.csv")
    print_forecast_table()