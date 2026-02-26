import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
import folium
from streamlit_folium import st_folium
from datetime import datetime, timedelta
import sys
import os

# Add src to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from src.forecasting import generate_forecast, get_recent_data
from src.data_loader import fetch_openaq_data, generate_synthetic_data

st.set_page_config(page_title="Hyperlocal Air Quality", layout="wide")

st.title("Hyperlocal Air Quality Forecasting System")

# Sidebar
st.sidebar.header("Settings")
city = st.sidebar.text_input("City", "Delhi")
lat = st.sidebar.number_input("Latitude", 28.61)
lon = st.sidebar.number_input("Longitude", 77.23)

if st.sidebar.button("Refresh Data"):
    st.rerun()

# 1. Overview Section
st.header("1. Current Air Quality")

# Caching functions
@st.cache_data(ttl=300) # Cache data for 5 minutes
def get_cached_recent_data(city):
    return get_recent_data(city)

@st.cache_data(ttl=300)
def get_cached_forecast(city, recent_data):
    return generate_forecast(city, recent_data)

@st.cache_data(ttl=300)
def generate_map(lat, lon, city, current_pm25, color):
    m = folium.Map(location=[lat, lon], zoom_start=11)
    
    # Add marker for current location
    folium.Marker(
        [lat, lon], 
        popup=f"{city}: {current_pm25:.2f} µg/m³", 
        icon=folium.Icon(color=color, icon='info-sign')
    ).add_to(m)
    
    # Demo: Add some random nearby points to simulate hyperlocal network
    # Using a fixed seed inside function or just caching the result makes it stable
    np.random.seed(42) # Ensure determinism if cache misses
    for i in range(5):
        r_lat = lat + np.random.uniform(-0.05, 0.05)
        r_lon = lon + np.random.uniform(-0.05, 0.05)
        r_val = current_pm25 + np.random.uniform(-10, 10)
        
        folium.CircleMarker(
            location=[r_lat, r_lon],
            radius=10,
            popup=f"Sensor {i}: {r_val:.2f}",
            color="red" if r_val > 55 else "green",
            fill=True,
            fill_color="red" if r_val > 55 else "green"
        ).add_to(m)
    return m

# Fetch recent data (simulated/real) with caching
data_df = get_cached_recent_data(city)

if not data_df.empty:
    current_pm25 = data_df['pm25'].iloc[-1]
    last_update = data_df['date'].iloc[-1]
    
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.metric("Current PM2.5", f"{current_pm25:.2f} µg/m³")
    
    with col2:
        # Determine risk level
        if current_pm25 <= 12:
            risk = "Good"
            color = "green"
        elif current_pm25 <= 35.4:
            risk = "Moderate"
            color = "yellow"
        elif current_pm25 <= 55.4:
            risk = "Unhealthy for Sensitive Groups"
            color = "orange"
        elif current_pm25 <= 150.4:
            risk = "Unhealthy"
            color = "red"
        elif current_pm25 <= 250.4:
            risk = "Very Unhealthy"
            color = "purple"
        else:
            risk = "Hazardous"
            color = "maroon"
            
        st.metric("Risk Level", risk)
        st.markdown(f"<div style='background-color:{color};height:10px;width:100%;border-radius:5px;'></div>", unsafe_allow_html=True)
        
    with col3:
        st.text(f"Last Updated: {last_update}")

    # 2. Historical Trends
    st.header("2. Historical Trends (Last 24h)")
    fig_hist = px.line(data_df.tail(24), x='date', y='pm25', title='PM2.5 Levels (Last 24 Hours)')
    st.plotly_chart(fig_hist, use_container_width=True)
    
    # 3. Forecast
    st.header("3. 24-Hour Forecast")
    
    forecast_df = generate_forecast(city)
    
    if forecast_df is not None:
        fig_forecast = go.Figure()
        
        # Historical Trace
        fig_forecast.add_trace(go.Scatter(x=data_df.tail(24)['date'], y=data_df.tail(24)['pm25'], mode='lines', name='Historical'))
        
        # Forecast Trace
        fig_forecast.add_trace(go.Scatter(x=forecast_df['time'], y=forecast_df['pm25_forecast'], mode='lines+markers', name='Forecast', line=dict(dash='dash')))
        
        fig_forecast.update_layout(title="PM2.5 Forecast", xaxis_title="Time", yaxis_title="PM2.5 (µg/m³)")
        st.plotly_chart(fig_forecast, use_container_width=True)
        
        # Display forecast table
        with st.expander("View Forecast Data"):
            st.dataframe(forecast_df)
    else:
        st.warning("Could not generate forecast. Check if model is trained.")

    # 4. Geospatial Analysis
    st.header("4. Geospatial Heatmap")
    
    m = generate_map(lat, lon, city, current_pm25, color)
    st_folium(m, width=700, height=500)

else:
    st.error("No data available. Please check data sources.")

st.markdown("---")
st.markdown("Hyperlocal Air Quality Forecasting System | Powered by XGBoost/LSTM & OpenAQ")
