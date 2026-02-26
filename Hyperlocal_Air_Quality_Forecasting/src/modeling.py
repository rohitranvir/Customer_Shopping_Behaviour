import pandas as pd
import numpy as np
import joblib
import os
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from xgboost import XGBRegressor
from sklearn.multioutput import MultiOutputRegressor
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout

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
    
    # We need to ensure we have enough future data for Y
    # Shift target backwards to create Y columns
    y_cols = []
    for i in range(1, forecast_horizon + 1):
        col_name = f'target_t+{i}'
        data[col_name] = data[target_col].shift(-i)
        y_cols.append(col_name)
        
    # Drop rows with NaNs (the last 24 rows)
    data = data.dropna()
    
    # Drop date column and original target if needed, generally we keep features
    # Excluding target columns from X
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
    
    # Ensure numpy arrays to avoid shape mismatch issues with MultiOutputRegressor
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
    # Manual Multi-Output to guarantee correct shape
    # Training 24 separate models
    y_pred_xgb_list = []
    xgb_models = []
    
    # y_train_np shape is (samples, 24)
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
    
    # We can't save a list of models easily in the 'results' dict structure expected later for saving 'best_model'
    # So we'll wrap it in a custom class or just save the first one for now as a placeholder if it wins, 
    # but for this exercise let's just use the first model object or a dummy container.
    # Actually, let's wrap it in a simple class to comply with the interface.
    
    class MultiXGB:
        def __init__(self, models):
            self.models = models
        def predict(self, X):
            preds = [m.predict(X) for m in self.models]
            return np.column_stack(preds)
            
    xgb_wrapper = MultiXGB(xgb_models)
    
    results['XGBoost'] = {'model': xgb_wrapper, 'mae': evaluate_model(y_test_np, y_pred_xgb, "XGBoost")}
    
    return results

def train_lstm_model(X_train, y_train, X_test, y_test):
    print("\nTraining LSTM...")
    
    # Ensure numpy arrays and float32
    X_train_np = X_train.values.astype(np.float32)
    y_train_np = y_train.values.astype(np.float32)
    X_test_np = X_test.values.astype(np.float32)
    y_test_np = y_test.values.astype(np.float32)
    
    print(f"X_train_np shape: {X_train_np.shape}")
    print(f"y_train_np shape: {y_train_np.shape}")

    # Reshape for LSTM: [samples, time steps, features]
    # Here we treat input features as one time step for simplicity unless we built sequence X
    # X_train is (samples, features). We reshape to (samples, 1, features)
    X_train_reshaped = X_train_np.reshape((X_train_np.shape[0], 1, X_train_np.shape[1]))
    X_test_reshaped = X_test_np.reshape((X_test_np.shape[0], 1, X_test_np.shape[1]))
    
    print(f"X_train_reshaped shape: {X_train_reshaped.shape}")
    
    model = Sequential()
    # Input shape: (time_steps=1, features)
    model.add(LSTM(64, activation='relu', input_shape=(1, X_train.shape[1])))
    model.add(Dropout(0.2))
    model.add(Dense(32, activation='relu'))
    model.add(Dense(y_train.shape[1])) # Output shape: (batch, 24)
    
    model.compile(optimizer='adam', loss='mse', metrics=['mae'])
    
    # Early stopping
    callback = tf.keras.callbacks.EarlyStopping(monitor='val_loss', patience=5, restore_best_weights=True)
    
    model.fit(X_train_reshaped, y_train_np, epochs=20, batch_size=32, validation_split=0.2, verbose=1, callbacks=[callback])
    
    y_pred = model.predict(X_test_reshaped)
    mae = evaluate_model(y_test, y_pred, "LSTM")
    
    return {'model': model, 'mae': mae}

def main():
    print("Loading data...")
    df = load_processed_data()
    if df.empty:
        print("No data found.")
        return

    # Prepare data
    X, y = create_sequences(df)
    
    # Time-based split (No shuffling)
    # Train: 80%, Test: 20%
    split_idx = int(len(X) * 0.8)
    X_train, X_test = X.iloc[:split_idx], X.iloc[split_idx:]
    y_train, y_test = y.iloc[:split_idx], y.iloc[split_idx:]
    
    print(f"Train shape: {X_train.shape}, Test shape: {X_test.shape}")
    
    # Train Baselines
    baseline_results = train_baseline_models(X_train, y_train, X_test, y_test)
    
    # Train LSTM
    lstm_result = train_lstm_model(X_train, y_train, X_test, y_test)
    
    # Compare and Save Best
    best_model_name = "LSTM"
    best_mae = lstm_result['mae']
    best_model = lstm_result['model']
    
    for name, res in baseline_results.items():
        if res['mae'] < best_mae:
            best_mae = res['mae']
            best_model_name = name
            best_model = res['model']
            
    print(f"\nBest Model: {best_model_name} with MAE: {best_mae:.4f}")
    
    # Save Model
    # Save Model
    if best_model_name == "LSTM":
        best_model.save("models/saved_models/best_model.keras")
    else:
        joblib.dump(best_model, "models/saved_models/best_model.pkl")
    
    # Save column names for inference
    joblib.dump(X.columns.tolist(), "models/saved_models/feature_columns.pkl")
    
    print("Model and feature columns saved.")

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        import traceback
        with open("error_log.txt", "w") as f:
            f.write(traceback.format_exc())
        print("Error occurred. Check error_log.txt")
