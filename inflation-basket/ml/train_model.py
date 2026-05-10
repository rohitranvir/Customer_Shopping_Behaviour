import pandas as pd
import numpy as np
import os
import sys
import json
import datetime
import joblib
import re

# Add project root to path
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(PROJECT_ROOT)

from config.config_loader import load_config
from utils.logger import get_logger
from database.db import DB_PATH
from processing.feature_engineering import create_features
from processing.data_quality import check_data_quality

# ML Libraries
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.model_selection import TimeSeriesSplit, cross_val_score
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

# Initialize Logger
logger = get_logger("train_model")
config = load_config()

# Paths from Config
MODELS_DIR = os.path.join(PROJECT_ROOT, config['models_dir'])
DATA_DIR = os.path.join(PROJECT_ROOT, config['data_dir'])
METRICS_PATH = os.path.join(DATA_DIR, 'model_metrics.csv')
IMPORTANCE_PATH = os.path.join(DATA_DIR, 'feature_importance.csv')
QUALITY_REPORT_PATH = os.path.join(DATA_DIR, 'data_quality_report.csv')

def fetch_data():
    import sqlite3
    conn = sqlite3.connect(DB_PATH)
    try:
        df = pd.read_sql("SELECT * FROM price_data", conn)
    except Exception as e:
        logger.error(f"Error fetching data: {e}")
        df = pd.DataFrame()
    finally:
        conn.close()
    return df

def train():
    logger.info("Loading data...")
    df = fetch_data()

    if df.empty:
        logger.warning("No data to train on.")
        return

    # Run Data Quality Check
    logger.info("Running Data Quality Checks...")
    quality_report = check_data_quality(df)
    quality_report.to_csv(QUALITY_REPORT_PATH, index=False)
    logger.info(f"Data quality report saved to {QUALITY_REPORT_PATH}")

    df['date'] = pd.to_datetime(df['date'])
    
    # Per-item processing happens in create_features now
    # We pass the raw dataframe (with duplicates allowed, handled inside)
    # But we need to ensure 'total_cost' logic is applied if we want to predict price per item
    # Wait, previous logic was predicting "total_cost" of the basket.
    # New logic is "Per-Item Model". So we predict 'price' of the item.
    # We need to rename 'price' to 'total_cost' temporarily to reuse feature engineering 
    # OR better, update feature engineering to work on 'price' or generic column.
    # Looking at feature_engineering.py, it uses 'total_cost'.
    # Let's map 'price' -> 'total_cost' for consistency with the feature function
    
    # Map price to total_cost for feature engineering compatibility if needed
    if 'total_cost' not in df.columns and 'price' in df.columns:
        df['total_cost'] = df['price'] 
    
    # Create features (groups by item internally)
    df_features = create_features(df)
    
    if df_features.empty:
        logger.warning("No features generated.")
        return

    # Drop NaNs
    df_features = df_features.dropna()
    
    features_list = ['day_of_week', 'day_of_year', 'month', 'is_weekend', 'date_ordinal', 'lag_1', 'lag_7', 'rolling_mean_7']
    
    metrics_list = []
    importance_list = []

    logger.info(f"Training models for {df_features['item_name'].nunique()} items...")

    for item_name, item_df in df_features.groupby('item_name'):
        logger.info(f"Training for: {item_name}")
        
        X = item_df[features_list]
        y = item_df['total_cost']
        
        if len(X) < 10:
            logger.warning(f"Skipping {item_name}: Not enough data after cleaning ({len(X)} rows).")
            continue

        # Split for evaluation
        tscv = TimeSeriesSplit(n_splits=3)
        model = GradientBoostingRegressor(n_estimators=100, learning_rate=0.1, max_depth=3, random_state=42)
        
        # Cross-validation
        cv_mae = -cross_val_score(model, X, y, cv=tscv, scoring='neg_mean_absolute_error').mean()
        cv_rmse = np.sqrt(-cross_val_score(model, X, y, cv=tscv, scoring='neg_mean_squared_error').mean())
        
        # Train final model
        model.fit(X, y)
        y_pred = model.predict(X)
        r2 = r2_score(y, y_pred)
        
        # Baseline Comparison (Naive Forecast: Tomorrow = Today)
        # Shift(1) is 'lag_1' which we already have. 
        # Naive forecast is simply predicting lag_1 value.
        y_naive = item_df['lag_1']
        baseline_rmse = np.sqrt(mean_squared_error(y, y_naive))
        
        logger.info(f"  MAE: {cv_mae:.4f} | RMSE: {cv_rmse:.4f} | Baseline RMSE: {baseline_rmse:.4f} | R2: {r2:.4f}")
        
        metrics_list.append({
            'item': item_name,
            'mae': cv_mae,
            'rmse': cv_rmse,
            'baseline_rmse': baseline_rmse,
            'r2': r2,
            'model_better': cv_rmse < baseline_rmse
        })

        # Feature Importance
        for name, imp in zip(features_list, model.feature_importances_):
            importance_list.append({'item': item_name, 'feature': name, 'importance': imp})

        # Save Model
        safe_name = re.sub(r'[^a-zA-Z0-9]', '_', item_name)
        model_path = os.path.join(MODELS_DIR, f'model_{safe_name}.pkl')
        joblib.dump(model, model_path)
        logger.info(f"  Saved to {model_path}")

    # ... (training loop) ...
    
    # Comparison with previous run
    if os.path.exists(METRICS_PATH):
        try:
            old_metrics_df = pd.read_csv(METRICS_PATH)
            # Merge on item to compare
            comparison = pd.merge(pd.DataFrame(metrics_list), old_metrics_df[['item', 'rmse']], on='item', suffixes=('_new', '_old'))
            for _, row in comparison.iterrows():
                if row['rmse_new'] > 1.2 * row['rmse_old']:
                    logger.warning(f"Model performance degraded for {row['item']} (RMSE: {row['rmse_old']:.4f} -> {row['rmse_new']:.4f})")
        except Exception as e:
            logger.error(f"Error comparing metrics: {e}")

    # Save metrics
    new_metrics_df = pd.DataFrame(metrics_list)
    new_metrics_df.to_csv(METRICS_PATH, index=False)
    logger.info(f"Metrics saved to {METRICS_PATH}")

    # Save importance
    pd.DataFrame(importance_list).to_csv(IMPORTANCE_PATH, index=False)
    logger.info(f"Feature importance saved to {IMPORTANCE_PATH}")

    # Save History and Metadata
    today_str = datetime.datetime.now().strftime("%Y-%m-%d")
    
    # History
    history_path = os.path.join(DATA_DIR, 'model_metrics_history.csv')
    history_df = new_metrics_df.copy()
    history_df['date'] = today_str
    
    if os.path.exists(history_path):
        history_df.to_csv(history_path, mode='a', header=False, index=False)
    else:
        history_df.to_csv(history_path, index=False)
    logger.info(f"History appended to {history_path}")

    # Metadata
    metadata = {
        "last_train_date": today_str,
        "items_trained": list(df_features['item_name'].unique())
    }
    metadata_path = os.path.join(DATA_DIR, 'model_metadata.json')
    with open(metadata_path, 'w') as f:
        json.dump(metadata, f, indent=4)
    logger.info(f"Metadata saved to {metadata_path}")

if __name__ == "__main__":
    train()
