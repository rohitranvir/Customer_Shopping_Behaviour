import pandas as pd
import numpy as np

def check_data_quality(df):
    """
    Checks data quality for each item in the dataframe.
    Calculates variance, missing dates, and reliability status.
    
    Args:
        df: DataFrame containing 'date', 'item_name', 'price' columns.
        
    Returns:
        pd.DataFrame: Quality report with metrics per item.
    """
    report_data = []
    
    # Ensure date is datetime
    if not np.issubdtype(df['date'].dtype, np.datetime64):
        df = df.copy()
        df['date'] = pd.to_datetime(df['date'])

    for item, item_df in df.groupby('item_name'):
        # Sort by date
        item_df = item_df.sort_values('date')
        
        # Calculate basic stats
        prices = item_df['price']
        count = len(prices)
        mean_price = prices.mean()
        std_dev = prices.std()
        min_price = prices.min()
        max_price = prices.max()
        
        # Coefficient of Variation
        cv = std_dev / mean_price if mean_price > 0 else 0
        
        # Missing dates check
        min_date = item_df['date'].min()
        max_date = item_df['date'].max()
        full_range = pd.date_range(start=min_date, end=max_date)
        missing_count = len(full_range) - len(item_df['date'].unique())
        
        # Status Logic
        status = "OK"
        warnings = []
        
        if std_dev < 1.0 or cv < 0.01:
            warnings.append("Low Variance")
            
        if missing_count > 0:
            warnings.append(f"Missing {missing_count} dates")
            
        if warnings:
            status = "; ".join(warnings)
            print(f"Warning: {item} - {status}. Model predictions may be unreliable.")

        report_data.append({
            'item': item,
            'count': count,
            'mean': mean_price,
            'std': std_dev,
            'cv': cv,
            'min': min_price,
            'max': max_price,
            'missing_dates': missing_count,
            'status': status
        })
        
    return pd.DataFrame(report_data)
