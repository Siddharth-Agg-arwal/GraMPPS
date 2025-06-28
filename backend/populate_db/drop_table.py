import psycopg2

DB_CONFIG = dict(
    dbname="postgres",
    user="postgres",
    password="@Sid2003",
    host="localhost",
    port="5432"
)

def drop_timeseries_table():
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()
    cur.execute("DROP TABLE IF EXISTS timeseries_data;")
    conn.commit()
    cur.close()
    conn.close()
    print("Table 'timeseries_data' dropped.")

if __name__ == "__main__":
    drop_timeseries_table()