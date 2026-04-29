import pandas as pd
import numpy as np

def create_features(df):
    """
    Creates time-series features for the forecasting model.
    
    Args:
        df (pd.DataFrame): DataFrame with 'date' and 'total_cost' columns.
        
    Returns:
        pd.DataFrame: DataFrame with added features.
    """
    df = df.copy()
    
    # Ensure date is datetime
    if not np.issubdtype(df['date'].dtype, np.datetime64):
        df['date'] = pd.to_datetime(df['date'])
    
    # Remove duplicates
    df = df.drop_duplicates(subset=['date', 'item_name'])

    # Sort
    df = df.sort_values(['item_name', 'date'])

    # Features list to store results
    result_dfs = []

    for item, item_df in df.groupby('item_name'):
        item_df = item_df.copy()
        
        # Validation: Check minimum data points
        if len(item_df) < 30:
            print(f"Warning: Not enough data for {item} (Found {len(item_df)} rows). Model might be unreliable.")
        
        # Handle missing dates (reindex)
        min_date = item_df['date'].min()
        max_date = item_df['date'].max()
        idx = pd.date_range(min_date, max_date)
        item_df = item_df.set_index('date').reindex(idx).rename_axis('date').reset_index()
        
        # Forward fill price for missing dates
        item_df['total_cost'] = item_df['total_cost'].ffill()
        item_df['item_name'] = item # Restore item name
        
        # Timestamp ordinal
        item_df['date_ordinal'] = item_df['date'].map(pd.Timestamp.toordinal)

        # Lag features
        item_df['lag_1'] = item_df['total_cost'].shift(1)
        item_df['lag_7'] = item_df['total_cost'].shift(7)

        # Rolling mean
        item_df['rolling_mean_7'] = item_df['total_cost'].shift(1).rolling(window=7).mean()
        
        # Date features
        item_df['day_of_week'] = item_df['date'].dt.dayofweek
        item_df['day_of_year'] = item_df['date'].dt.dayofyear
        item_df['month'] = item_df['date'].dt.month
        item_df['is_weekend'] = item_df['day_of_week'].isin([5, 6]).astype(int)

        result_dfs.append(item_df)

    if not result_dfs:
        return pd.DataFrame()
        
    return pd.concat(result_dfs, ignore_index=True)
