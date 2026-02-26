import pandas as pd
import numpy as np
import joblib
import os
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout

def load_processed_data(filepath="data/processed/train_data.csv"):
    df = pd.read_csv(filepath)
    return df

def create_sequences(df, target_col='pm25', match_columns=None, forecast_horizon=24):
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
    mae = evaluate_model(y_test_np, y_pred, "LSTM")
    
    return {'model': model, 'mae': mae}

def main():
    print("Loading data for LSTM Model...")
    df = load_processed_data()
    if df.empty:
        print("No data found.")
        return

    X, y = create_sequences(df)
    
    split_idx = int(len(X) * 0.8)
    X_train, X_test = X.iloc[:split_idx], X.iloc[split_idx:]
    y_train, y_test = y.iloc[:split_idx], y.iloc[split_idx:]
    
    print(f"Train shape: {X_train.shape}, Test shape: {X_test.shape}")
    
    lstm_result = train_lstm_model(X_train, y_train, X_test, y_test)
    
    print(f"\nLSTM MAE: {lstm_result['mae']:.4f}")
    
    lstm_result['model'].save("models/saved_models/best_lstm_model.keras")
    print("LSTM model saved.")

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        import traceback
        with open("error_log_lstm.txt", "w") as f:
            f.write(traceback.format_exc())
        print("Error in LSTM training. Check error_log_lstm.txt")
