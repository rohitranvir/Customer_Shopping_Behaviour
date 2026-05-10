import pandas as pd
import numpy as np
import joblib
import os
import datetime
import sys
import re

# Add project root to path
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(PROJECT_ROOT)

from config.config_loader import load_config
from utils.logger import get_logger
from database.db import fetch_all_data
from processing.feature_engineering import create_features

# Initialize Logger
logger = get_logger("predict")
config = load_config()

# Paths from Config
MODELS_DIR = os.path.join(PROJECT_ROOT, config['models_dir'])
DATA_DIR = os.path.join(PROJECT_ROOT, config['data_dir'])
PREDICTIONS_PATH = os.path.join(DATA_DIR, 'predictions.csv')
PREDICTIONS_DETAILED_PATH = os.path.join(DATA_DIR, 'predictions_detailed.csv')

def predict_future():
    logger.info("Loading data...")
    df = fetch_all_data()
    
    if df.empty:
        logger.warning("No data found!")
        return

    df['date'] = pd.to_datetime(df['date'])
    # Map 'price' to 'total_cost' for feature compatibility
    if 'total_cost' not in df.columns and 'price' in df.columns:
        df['total_cost'] = df['price']
    
    items = df['item_name'].unique()
    logger.info(f"Found items: {items}")
    
    all_predictions = []
    
    # 7-day forecast horizon from config
    days_to_predict = config.get('forecast_horizon_days', 7)
    future_dates = [datetime.date.today() + datetime.timedelta(days=i) for i in range(1, days_to_predict + 1)]

    for item in items:
        safe_name = re.sub(r'[^a-zA-Z0-9]', '_', item)
        model_path = os.path.join(MODELS_DIR, f'model_{safe_name}.pkl')
        
        if not os.path.exists(model_path):
            logger.warning(f"Model for {item} not found at {model_path}. Skipping.")
            continue
            
        logger.info(f"Predicting for {item}...")
        model = joblib.load(model_path)
        
        # Get item specific data
        item_df = df[df['item_name'] == item].copy()
        item_df = item_df.sort_values('date')
        
        # Recursive prediction for 7 days
        current_df = item_df.copy()
        
        for future_date in future_dates:
            # Re-generate features with latest data (including previous predictions)
            # We need to construct a row for 'future_date'
            # Strategy: Append a dummy row for the future date, calculate features (lags will come from past), drop dummy target logic.
            
            future_date_ts = pd.Timestamp(future_date)
            new_row = pd.DataFrame([{
                'date': future_date_ts,
                'item_name': item,
                'total_cost': 0, # Dummy, not used for feature creation of *this* row? 
                                 # wait, lag_1 of this row is total_cost of previous row.
                                 # rolling_mean_7 of this row uses previous 7 rows.
                                 # So we just need previous rows to be correct.
                'price': 0,
                'website': 'Predicted'
            }])
            
            temp_df = pd.concat([current_df, new_row], ignore_index=True)
            temp_features = create_features(temp_df)
            
            # The last row is our target to predict
            target_features = temp_features.iloc[[-1]] 
            
            features_list = ['day_of_week', 'day_of_year', 'month', 'is_weekend', 'date_ordinal', 'lag_1', 'lag_7', 'rolling_mean_7']
            X_pred = target_features[features_list]
            
            # Predict
            predicted_price = model.predict(X_pred)[0]
            
            # Update the 'new_row' with predicted price and append to current_df so next iteration uses it
            new_row['total_cost'] = predicted_price
            new_row['price'] = predicted_price
            current_df = pd.concat([current_df, new_row], ignore_index=True)
            
            all_predictions.append({
                'date': future_date,
                'item_name': item,
                'predicted_cost': predicted_price
            })
            
    if not all_predictions:
        logger.warning("No predictions generated.")
        return

    pred_df = pd.DataFrame(all_predictions)
    
    # Save detailed predictions
    pred_df.to_csv(PREDICTIONS_DETAILED_PATH, index=False)
    logger.info(f"Detailed predictions saved to {PREDICTIONS_DETAILED_PATH}")

    # Aggregate for total basket cost
    total_pred = pred_df.groupby('date')['predicted_cost'].sum().reset_index()
    total_pred.to_csv(PREDICTIONS_PATH, index=False)
    logger.info(f"Aggregated predictions saved to {PREDICTIONS_PATH}")
    
    logger.info(f"Prediction preview:\n{total_pred.head()}")

if __name__ == "__main__":
    predict_future()
