import pandas as pd
import psycopg2

# Load CSV
df = pd.read_csv('train.csv')

# Connect to PostgreSQL
conn = psycopg2.connect(
    dbname="postgres",
    user="postgres",
    password="@Sid2003",
    host="localhost",
    port="5432"
)
cur = conn.cursor()

# Create table with columns matching your CSV
cur.execute("""
    CREATE TABLE IF NOT EXISTS timeseries_data (
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