import pandas as pd
import psycopg2

# Load CSV and ensure UTC
df = pd.read_csv('train.csv', parse_dates=['timestamp'])
df['timestamp'] = pd.to_datetime(df['timestamp'], utc=True)  # Force UTC

# Connect to PostgreSQL
conn = psycopg2.connect(
    dbname="postgres",
    user="postgres",
    password="@Sid2003",
    host="localhost",
    port="5432"
)
cur = conn.cursor()

cur.execute("DROP TABLE IF EXISTS timeseries_data;")
conn.commit()
cur.execute("""
    CREATE TABLE timeseries_data (
        id SERIAL PRIMARY KEY,
        timestamp TIMESTAMPTZ,
        target_power FLOAT,
        exog_is_holiday BOOLEAN,
        exog_hour INTEGER,
        exog_day_of_week INTEGER,
        exog_sim_occupancy FLOAT,
        exog_outdoor_temp FLOAT,
        exog_temp_diff FLOAT
    );
""")
conn.commit()

# Insert data
for _, row in df.iterrows():
    cur.execute(
        """
        INSERT INTO timeseries_data (
            timestamp, target_power, exog_is_holiday, exog_hour, exog_day_of_week,
            exog_sim_occupancy, exog_outdoor_temp, exog_temp_diff
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """,
        (
            row['timestamp'],
            row['target:Power'],
            bool(row['exog:IsHoliday']),
            float(row['exog:Hour']),
            float(row['exog:DayOfWeek']),
            float(row['exog:SimOccupancy']),
            float(row['exog:OutdoorTemp']),
            float(row['exog:TempDiff'])
        )
    )
conn.commit()

cur.close()
conn.close()
print("Database populated!")

def print_all_timeseries_data():
    conn = psycopg2.connect(
        dbname="postgres",
        user="postgres",
        password="@Sid2003",
        host="localhost",
        port="5432"
    )
    df = pd.read_sql("SELECT * FROM timeseries_data ORDER BY timestamp ASC", conn)
    conn.close()
    print(df.to_string(index=False))

if __name__ == "__main__":
    print_all_timeseries_data()