import pandas as pd
import numpy as np
import joblib
from datetime import timedelta
from src.data_loader import fetch_weather_data, generate_synthetic_data

def load_model(model_path="models/saved_models/best_baseline_model.pkl"):
    try:
        model = joblib.load(model_path)
        return model
    except FileNotFoundError:
        print("Model file not found.")
        return None

def load_features(features_path="models/saved_models/feature_columns.pkl"):
    try:
        cols = joblib.load(features_path)
        return cols
    except:
        return None

def get_recent_data(city="Delhi"):
    # In a real scenario, this would fetch the latest data from DB or API
    # Here we will generate synthetic recent data or use the end of our training data
    # For demo, let's generate "current" data
    try:
        # Fetch real weather for "future" or "now"
        # Using OpenMeteo forecast endpoint (different from archive)
        # But for consistency with training, we'll assume we have "current" state
        # generating 1 row of current features is complex due to lags.
        # We need the last 24h of data to build features.
        
        # Simulating fetching last 24h data
        end_date = pd.Timestamp.now()
        start_date = end_date - timedelta(hours=48)
        
        # Use synthetic generation for simplicity in this demo
        recent_df = generate_synthetic_data(start_date, end_date)
        return recent_df
    except Exception as e:
        print(f"Error fetching recent data: {e}")
        return pd.DataFrame()

def prepare_input_for_model(recent_df, feature_cols):
    """
    Prepares the single row of input features for prediction.
    We need to compute lags and rolling stats from recent_df.
    """
    # Recalculate features on recent_df
    # We reuse the logic from preprocessing but need to be careful with window sizes
    
    # Sort
    recent_df = recent_df.sort_values('date')
    
    # Features
    recent_df['hour'] = recent_df['date'].dt.hour
    recent_df['day_of_week'] = recent_df['date'].dt.dayofweek
    recent_df['month'] = recent_df['date'].dt.month
    recent_df['season'] = recent_df['month'].apply(lambda x: 1 if x in [12, 1, 2] else 2 if x in [3, 4, 5] else 3 if x in [6, 7, 8] else 4)
    
    # Lags
    for lag in [1, 3, 6, 12, 24]:
        recent_df[f'pm25_lag_{lag}'] = recent_df['pm25'].shift(lag)
        
    # Rolling
    for window in [6, 12, 24]:
        recent_df[f'pm25_rolling_mean_{window}'] = recent_df['pm25'].rolling(window=window).mean()
        recent_df[f'pm25_rolling_std_{window}'] = recent_df['pm25'].rolling(window=window).std()
        
    recent_df['temp_humidity_interaction'] = recent_df['temperature'] * recent_df['humidity']
    
    # Take the last row as our "current" state to predict forward
    last_row = recent_df.iloc[[-1]].copy()
    
    # Ensure columns match training
    # Add missing columns with 0 if any (robustness)
    for col in feature_cols:
        if col not in last_row.columns:
            last_row[col] = 0
            
    # Select only feature columns
    X_input = last_row[feature_cols]
    
    return X_input, last_row['date'].iloc[0]

def generate_forecast(city="Delhi", recent_data=None):
    model = load_model()
    feature_cols = load_features()
    
    if model is None or feature_cols is None:
        return None
        
    if recent_data is None:
        recent_df = get_recent_data(city)
    else:
        recent_df = recent_data

    if recent_df.empty:
        return None
        
    X_input, current_time = prepare_input_for_model(recent_df, feature_cols)
    
    # Predict
    # MultiOutput model outputs 24 values
    forecast_values = model.predict(X_input)
    
    # If using MultiOutputRegressor, output is (1, 24)
    if forecast_values.ndim == 2:
        forecast_values = forecast_values[0]
        
    # Create forecast dataframe
    forecast_dates = [current_time + timedelta(hours=i) for i in range(1, 25)]
    
    forecast_df = pd.DataFrame({
        'time': forecast_dates,
        'pm25_forecast': forecast_values
    })
    
    return forecast_df

if __name__ == "__main__":
    forecast = generate_forecast()
    if forecast is not None:
        print(forecast)
