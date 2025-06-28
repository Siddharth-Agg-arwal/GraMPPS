import psycopg2

conn = psycopg2.connect(
    dbname="postgres",
    user="postgres",
    password="@Sid2003",
    host="localhost",
    port="5432"
)
cur = conn.cursor()
cur.execute("SELECT * FROM timeseries_data ORDER BY id LIMIT 10;")
rows = cur.fetchall()
for row in rows:
    print(row)
cur.close()
conn.close()