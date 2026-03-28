import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

try:
    conn = psycopg2.connect(dbname='postgres', user='postgres', password='admin123', host='127.0.0.1')
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cursor = conn.cursor()
    cursor.execute("CREATE DATABASE chatapp_db;")
    cursor.close()
    conn.close()
    print("chatapp_db created successfully")
except Exception as e:
    print("Error:", e)
