# Hyperlocal Air Quality Forecasting System

This project implements an end-to-end system for forecasting PM2.5 air pollution levels using historical data and machine learning.

## Features
- **Data Acquisition**: Fetches historical data from OpenAQ and Open-Meteo.
- **Preprocessing**: Handles missing values, generates lag/rolling features.
- **Modeling**: 
    - **Baseline**: XGBoost and Linear Regression (Multi-Output).
    - **Advanced**: LSTM (Deep Learning) - *Note: LSTM training requires specific environment setup; system currently defaults to best baseline model.*
- **Forecasting**: Generates 24-hour future PM2.5 predictions.
- **Dashboard**: Interactive Streamlit app with geospatial heatmap and charts.

## Setup

1. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Run Data Pipeline (Optional if data already present)**
   ```bash
   python src/data_loader.py
   python src/preprocessing.py
   ```

3. **Train Models**
   ```bash
   # Train Baseline Models (XGBoost/Linear Regression)
   python src/train_baseline.py
   
   # Train LSTM (Optional)
   python src/train_lstm.py
   ```

4. **Run Dashboard**
   ```bash
   streamlit run app.py
   ```

## Directory Structure
- `data/`: Raw and processed datasets.
- `models/`: Saved models and feature columns.
- `src/`: Source code for data loading, processing, modeling, and forecasting.
- `app.py`: Streamlit dashboard entry point.

## Notes
- If OpenAQ API limits are hit, the system falls back to synthetic data generation for demonstration purposes.
