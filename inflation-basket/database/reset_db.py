
import sqlite3
import os

DB_PATH = 'data/prices.db'

def reset_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Drop table
    cursor.execute("DROP TABLE IF EXISTS price_data")
    
    # Recreate with exact schema
    cursor.execute('''
        CREATE TABLE price_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            item_name TEXT NOT NULL,
            price REAL,
            website TEXT
        )
    ''')
    
    conn.commit()
    conn.close()
    print("Database reset complete.")

if __name__ == "__main__":
    reset_db()
