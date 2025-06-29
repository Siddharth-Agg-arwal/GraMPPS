import pandas as pd
import psycopg2
import time
import json
import os

DB_CONFIG = dict(
    dbname="postgres",
    user="postgres",
    password="@Sid2003",
    host="localhost",
    port="5432"
)

JSON_FILE = "dummy_input.json"  # Path to your input JSON file
STATE_FILE = "ingest_state.json"  # To keep track of last inserted index

def append_one_row():
    # Load new rows from JSON file
    with open(JSON_FILE, "r") as f:
        new_rows = json.load(f)  # Should be a list of dicts

    # Load state (last inserted index)
    if os.path.exists(STATE_FILE):
        with open(STATE_FILE, "r") as f:
            state = json.load(f)
        last_idx = state.get("last_idx", -1)
    else:
        last_idx = -1

    next_idx = last_idx + 1
    if next_idx >= len(new_rows):
        print("All rows have been inserted.")
        return

    row = new_rows[next_idx]

    # Connect to DB
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()
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
            int(row['exog:Hour']),
            int(row['exog:DayOfWeek']),
            float(row['exog:SimOccupancy']),
            float(row['exog:OutdoorTemp']),
            float(row['exog:TempDiff'])
        )
    )
    conn.commit()
    cur.close()
    conn.close()
    print(f"Appended row {next_idx+1}/{len(new_rows)}.")

    # Save state
    with open(STATE_FILE, "w") as f:
        json.dump({"last_idx": next_idx}, f)

if __name__ == "__main__":
    while True:
        append_one_row()
        time.sleep(5)  # 5 minutes