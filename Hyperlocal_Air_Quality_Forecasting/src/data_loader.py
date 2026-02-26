import requests
import pandas as pd
import numpy as np
import openmeteo_requests
import requests_cache
from retry_requests import retry
from datetime import datetime, timedelta

def fetch_openaq_data(city="Delhi", parameter="pm25", limit=1000):
    """
    Fetches air quality data from OpenAQ API.
    Note: Public OpenAQ API has limits and structure changes. 
    We will use a simplified approach or fallback if needed.
    """
    print(f"Fetching {parameter} data for {city} from OpenAQ...")
    # OpenAQ v2 API endpoint
    url = "https://u50g7n0cbj.execute-api.us-east-1.amazonaws.com/v2/measurements"
    
    # Calculate date range for the last 90 days to get some historical data
    date_to = datetime.now()
    date_from = date_to - timedelta(days=90)
    
    params = {
        "city": city,
        "parameter": parameter,
        "date_from": date_from.strftime("%Y-%m-%dT%H:%M:%S"),
        "date_to": date_to.strftime("%Y-%m-%dT%H:%M:%S"),
        "limit": limit,
        "order_by": "date",
        "sort": "asc"
    }
    
    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        data = response.json()
        
        if 'results' in data and len(data['results']) > 0:
            df = pd.DataFrame(data['results'])
            # Extract relevant columns
            df['date'] = pd.to_datetime(df['date'].apply(lambda x: x['utc']))
            df = df[['date', 'value', 'unit', 'location', 'coordinates']]
            df.rename(columns={'value': 'pm25', 'date': 'date'}, inplace=True)
            
            # Normalize coordinates if available
            # Note: coordinates usually come as a dictionary
            # df['latitude'] = df['coordinates'].apply(lambda x: x['latitude'] if x else None)
            # df['longitude'] = df['coordinates'].apply(lambda x: x['longitude'] if x else None)
            
            # Filter for a specific location if multiple are returned to keep timeseries consistent
            # For simplicity, let's group by date and take the mean if multiple sensors exist
            df = df.groupby('date')['pm25'].mean().reset_index()
            
            print(f"fetched {len(df)} records from OpenAQ.")
            return df
        else:
            print("No results found from OpenAQ.")
            return pd.DataFrame()
            
    except Exception as e:
        print(f"Error fetching OpenAQ data: {e}")
        return pd.DataFrame()

def fetch_weather_data(latitude, longitude, start_date, end_date):
    """
    Fetches historical weather data from Open-Meteo.
    """
    print(f"Fetching weather data for {latitude}, {longitude}...")
    
    # Setup the Open-Meteo API client with cache and retry on error
    cache_session = requests_cache.CachedSession('.cache', expire_after = 3600)
    retry_session = retry(cache_session, retries = 5, backoff_factor = 0.2)
    openmeteo = openmeteo_requests.Client(session = retry_session)

    url = "https://archive-api.open-meteo.com/v1/archive"
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "start_date": start_date,
        "end_date": end_date,
        "hourly": ["temperature_2m", "relative_humidity_2m", "rain", "surface_pressure", "wind_speed_10m"]
    }
    
    try:
        responses = openmeteo.weather_api(url, params=params)
        response = responses[0]
        
        # Process hourly data
        hourly = response.Hourly()
        hourly_temperature_2m = hourly.Variables(0).ValuesAsNumpy()
        hourly_relative_humidity_2m = hourly.Variables(1).ValuesAsNumpy()
        hourly_rain = hourly.Variables(2).ValuesAsNumpy()
        hourly_surface_pressure = hourly.Variables(3).ValuesAsNumpy()
        hourly_wind_speed_10m = hourly.Variables(4).ValuesAsNumpy()

        hourly_data = {"date": pd.date_range(
            start = pd.to_datetime(hourly.Time(), unit = "s", utc = True),
            end = pd.to_datetime(hourly.TimeEnd(), unit = "s", utc = True),
            freq = pd.Timedelta(seconds = hourly.Interval()),
            inclusive = "left"
        )}
        hourly_data["temperature"] = hourly_temperature_2m
        hourly_data["humidity"] = hourly_relative_humidity_2m
        hourly_data["rain"] = hourly_rain
        hourly_data["pressure"] = hourly_surface_pressure
        hourly_data["wind_speed"] = hourly_wind_speed_10m

        weather_df = pd.DataFrame(data = hourly_data)
        print(f"Fetched {len(weather_df)} weather records.")
        return weather_df
        
    except Exception as e:
        print(f"Error fetching weather data: {e}")
        return pd.DataFrame()

def generate_synthetic_data(start_date, end_date):
    """Generates synthetic PM2.5 and Weather data for demonstration."""
    print("Generating synthetic data...")
    dates = pd.date_range(start=start_date, end=end_date, freq='H')
    df = pd.DataFrame({'date': dates})
    
    # Synthetic Weather
    # Temp: sinusoidal 
    df['temperature'] = 25 + 10 * np.sin(np.linspace(0, 3.14 * 2 * len(df) / 24, len(df))) # Daily cycle
    # Humidity: Inverse to temp roughly
    df['humidity'] = 60 + 20 * np.cos(np.linspace(0, 3.14 * 2 * len(df) / 24, len(df)))
    # Wind: Random walk
    df['wind_speed'] = np.random.normal(10, 3, len(df)).clip(0, 50)
    # Rain: Sparse
    df['rain'] = np.random.choice([0, 1], p=[0.95, 0.05], size=len(df))
    df['pressure'] = 1013 + np.random.normal(0, 5, len(df))
    
    # Synthetic PM2.5 (Function of weather + seasonality + noise)
    # Higher in winter (months 11, 12, 1, 2)
    # Lower with wind and rain
    seasonality = 50 + 30 * np.cos(2 * np.pi * (df['date'].dt.dayofyear) / 365)
    daily_trend = 10 * np.sin(2 * np.pi * (df['date'].dt.hour) / 24)
    weather_effect = -1.5 * df['wind_speed'] - 5 * df['rain']
    noise = np.random.normal(0, 10, len(df))
    
    df['pm25'] = seasonality + daily_trend + weather_effect + 100 + noise
    df['pm25'] = df['pm25'].clip(0, 500)
    
    return df

def load_and_merge_data(city="Delhi", lat=28.61, lon=77.23):
    """
    Main function to load AQI and Weather data and merge them.
    """
    # 1. Fetch AQI
    aqi_df = fetch_openaq_data(city=city)
    
    if aqi_df.empty:
        print("Warning: No AQI data found. Using synthetic data for demonstration.")
        # Fallback to synthetic data
        end_date = datetime.now()
        start_date = end_date - timedelta(days=90)
        merged_df = generate_synthetic_data(start_date, end_date)
        print(f"Generated {len(merged_df)} synthetic records.")
        return merged_df

    # 2. Fetch Weather
    # Get date range from AQI data
    start_date = aqi_df['date'].min().strftime("%Y-%m-%d")
    end_date = aqi_df['date'].max().strftime("%Y-%m-%d")
    
    weather_df = fetch_weather_data(lat, lon, start_date, end_date)
    
    if weather_df.empty:
        print("Warning: No Weather data found.")
        # If we have AQI but no weather, we could generate synthetic weather, 
        # but for now let's just return what we have or generate full synthetic.
        print("Falling back to full synthetic data due to missing weather.")
        end_date = datetime.now()
        start_date = end_date - timedelta(days=90)
        merged_df = generate_synthetic_data(start_date, end_date)
        return merged_df
        
    # 3. Merge
    # Ensure both are datetime64[ns, UTC] or None
    aqi_df['date'] = pd.to_datetime(aqi_df['date']).dt.tz_convert(None)
    weather_df['date'] = pd.to_datetime(weather_df['date']).dt.tz_convert(None)
    
    # Merge on nearest hour
    aqi_df['date'] = aqi_df['date'].dt.round('H')
    weather_df['date'] = weather_df['date'].dt.round('H')
    
    # Group by date to handle duplicates from rounding
    aqi_df = aqi_df.groupby('date')['pm25'].mean().reset_index()
    
    merged_df = pd.merge(aqi_df, weather_df, on='date', how='inner')
    
    print(f"Merged data shape: {merged_df.shape}")
    return merged_df

if __name__ == "__main__":
    # Test the loader
    df = load_and_merge_data(city="Delhi", lat=28.61, lon=77.23)
    if not df.empty:
        df.to_csv("data/raw/merged_data.csv", index=False)
        print("Data saved to data/raw/merged_data.csv")
        print(df.head())
    else:
        print("Failed to load merged data.")
