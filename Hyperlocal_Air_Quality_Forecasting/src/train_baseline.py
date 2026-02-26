import pandas as pd
import numpy as np
import joblib
import os
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from xgboost import XGBRegressor
from sklearn.multioutput import MultiOutputRegressor

def load_processed_data(filepath="data/processed/train_data.csv"):
    df = pd.read_csv(filepath)
    return df

def create_sequences(df, target_col='pm25', match_columns=None, forecast_horizon=24):
    """
    Creates (X, y) for multi-step forecasting.
    X: Current features
    y: Next 24 hours of PM2.5
    """
    data = df.copy()
    y_cols = []
    for i in range(1, forecast_horizon + 1):
        col_name = f'target_t+{i}'
        data[col_name] = data[target_col].shift(-i)
        y_cols.append(col_name)
    data = data.dropna()
    feature_cols = [c for c in data.columns if c not in y_cols and c != 'date']
    X = data[feature_cols]
    y = data[y_cols]
    return X, y

def evaluate_model(y_true, y_pred, model_name="Model"):
    mae = mean_absolute_error(y_true, y_pred)
    rmse = np.sqrt(mean_squared_error(y_true, y_pred))
    r2 = r2_score(y_true, y_pred)
    print(f"\n[{model_name}] Performance:")
    print(f"MAE: {mae:.4f}")
    print(f"RMSE: {rmse:.4f}")
    print(f"R2 Score: {r2:.4f}")
    return mae

def train_baseline_models(X_train, y_train, X_test, y_test):
    results = {}
    
    # Ensure numpy arrays
    X_train_np = X_train.values
    y_train_np = y_train.values
    X_test_np = X_test.values
    y_test_np = y_test.values

    # Linear Regression
    print("\nTraining Linear Regression...")
    lr = MultiOutputRegressor(LinearRegression())
    lr.fit(X_train_np, y_train_np)
    y_pred_lr = lr.predict(X_test_np)
    print(f"Linear Regression Output Shape: {y_pred_lr.shape}")
    results['LinearRegression'] = {'model': lr, 'mae': evaluate_model(y_test_np, y_pred_lr, "Linear Regression")}
    
    # XGBoost
    print("\nTraining XGBoost...")
    # Manual Multi-Output loop
    y_pred_xgb_list = []
    xgb_models = []
    n_targets = y_train_np.shape[1]
    
    print(f"Training {n_targets} XGBoost models manually...")
    for i in range(n_targets):
        model = XGBRegressor(n_estimators=100, learning_rate=0.1, n_jobs=1)
        model.fit(X_train_np, y_train_np[:, i])
        y_pred_i = model.predict(X_test_np)
        y_pred_xgb_list.append(y_pred_i)
        xgb_models.append(model)
        
    y_pred_xgb = np.column_stack(y_pred_xgb_list)
    print(f"XGBoost Output Shape: {y_pred_xgb.shape}")
    
    class MultiXGB:
        def __init__(self, models):
            self.models = models
        def predict(self, X):
            preds = [m.predict(X) for m in self.models]
            return np.column_stack(preds)
            
    xgb_wrapper = MultiXGB(xgb_models)
    results['XGBoost'] = {'model': xgb_wrapper, 'mae': evaluate_model(y_test_np, y_pred_xgb, "XGBoost")}
    
    return results

def main():
    print("Loading data for Baseline Models...")
    df = load_processed_data()
    if df.empty:
        print("No data found.")
        return

    X, y = create_sequences(df)
    
    split_idx = int(len(X) * 0.8)
    X_train, X_test = X.iloc[:split_idx], X.iloc[split_idx:]
    y_train, y_test = y.iloc[:split_idx], y.iloc[split_idx:]
    
    print(f"Train shape: {X_train.shape}, Test shape: {X_test.shape}")
    
    baseline_results = train_baseline_models(X_train, y_train, X_test, y_test)
    
    # Save Best Baseline
    best_mae = float('inf')
    best_model = None
    best_name = ""
    
    for name, res in baseline_results.items():
        if res['mae'] < best_mae:
            best_mae = res['mae']
            best_model = res['model']
            best_name = name
            
    print(f"\nBest Baseline Model: {best_name} with MAE: {best_mae:.4f}")
    
    joblib.dump(best_model, "models/saved_models/best_baseline_model.pkl")
    joblib.dump(X.columns.tolist(), "models/saved_models/feature_columns.pkl")
    print("Baseline model saved.")

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        import traceback
        with open("error_log_baseline.txt", "w") as f:
            f.write(traceback.format_exc())
        print("Error in baseline training. Check error_log_baseline.txt")
