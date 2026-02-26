import pandas as pd
import numpy as np
import joblib

def load_data(filepath="data/raw/merged_data.csv"):
    """Loads the merged dataset."""
    try:
        df = pd.read_csv(filepath)
        df['date'] = pd.to_datetime(df['date'])
        return df
    except FileNotFoundError:
        print(f"Error: {filepath} not found.")
        return pd.DataFrame()

def handle_missing_values(df):
    """Handles missing values using interpolation."""
    # Sort by date to ensure interpolation makes sense
    df = df.sort_values('date')
    
    # Linear interpolation for continuous weather/pollution variables
    # Limit direction both to handle gaps in middle
    df = df.interpolate(method='linear', limit_direction='both')
    
    # Drop any remaining NaNs (e.g. at the start if interpolation didn't catch them)
    df = df.dropna()
    return df

def feature_engineering(df):
    """Generates time, lag, rolling, and interaction features."""
    df = df.copy()
    
    # Time Features
    df['hour'] = df['date'].dt.hour
    df['day_of_week'] = df['date'].dt.dayofweek
    df['month'] = df['date'].dt.month
    
    # Season (Northern Hemisphere)
    # Winter: 12, 1, 2 | Spring: 3, 4, 5 | Summer: 6, 7, 8 | Fall: 9, 10, 11
    df['season'] = df['month'].apply(lambda x: 
                                     1 if x in [12, 1, 2] else 
                                     2 if x in [3, 4, 5] else 
                                     3 if x in [6, 7, 8] else 4)
    
    # Lag Features (PM2.5)
    # Ensure data is hourly continuous before shifting, or just shift by row if we assume hourly
    # Ideally we should reindex to full hourly range if there are gaps, but `handle_missing_values` interpolated.
    # We set frequency to 'H' to be sure
    df.set_index('date', inplace=True)
    df = df.asfreq('H')
    df = df.interpolate(method='linear', limit_direction='both') # Fill gaps introduced by asfreq
    
    for lag in [1, 3, 6, 12, 24]:
        df[f'pm25_lag_{lag}'] = df['pm25'].shift(lag)
        
    # Rolling Statistics
    for window in [6, 12, 24]:
        df[f'pm25_rolling_mean_{window}'] = df['pm25'].rolling(window=window).mean()
        df[f'pm25_rolling_std_{window}'] = df['pm25'].rolling(window=window).std()
        
    # Weather Interactions
    # High humidity + Low Temp often leads to smog (in winter)
    df['temp_humidity_interaction'] = df['temperature'] * df['humidity']
    
    # Drop NaNs created by lagging/rolling
    df = df.dropna()
    
    return df

def preprocess_pipeline(input_path="data/raw/merged_data.csv", output_path="data/processed/train_data.csv"):
    print("Starting preprocessing...")
    df = load_data(input_path)
    
    if df.empty:
        print("Dataframe is empty, skipping preprocessing.")
        return
        
    print(f"Initial shape: {df.shape}")
    
    df = handle_missing_values(df)
    print(f"Shape after missing value handling: {df.shape}")
    
    df = feature_engineering(df)
    print(f"Shape after feature engineering: {df.shape}")
    
    # Reset index to make 'date' a column again
    df.reset_index(inplace=True)
    
    df.to_csv(output_path, index=False)
    print(f"Processed data saved to {output_path}")
    return df

if __name__ == "__main__":
    preprocess_pipeline()
