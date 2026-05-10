
import pandas as pd
import sqlite3
import os
import sys

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database.db import DB_PATH

def load_data():
    """Reads price data from SQLite database into a Pandas DataFrame."""
    conn = sqlite3.connect(DB_PATH)
    query = "SELECT * FROM price_data"
    df = pd.read_sql(query, conn)
    conn.close()    
    if df.empty:
        return pd.DataFrame()
    
    df['date'] = pd.to_datetime(df['date'])
    return df

def calculate_basket_metrics(df):
    """
    Calculates total basket cost per day and daily inflation.
    
    Returns:
        pd.DataFrame: Daily metrics with columns [date, total_cost, inflation_rate]
    """
    if df.empty:
        return pd.DataFrame()

    # Pivot to get price per item per day
    # Assuming one price per item per day. If multiple, take mean.
    pivot_df = df.pivot_table(index='date', columns='item_name', values='price', aggfunc='mean')
    
    # Calculate Total Basket Cost
    pivot_df['total_cost'] = pivot_df.sum(axis=1)
    
    # Calculate Inflation Rate ((today - yesterday) / yesterday) * 100
    pivot_df['inflation_rate'] = pivot_df['total_cost'].pct_change() * 100
    
    return pivot_df[['total_cost', 'inflation_rate']]

if __name__ == "__main__":
    df = load_data()
    if not df.empty:
        metrics = calculate_basket_metrics(df)
        print("Daily Basket Metrics:")
        print(metrics)
    else:
        print("No data found in database.")
