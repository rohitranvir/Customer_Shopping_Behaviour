import pandas as pd
import os
import sys
import datetime

# Add project root to path
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(PROJECT_ROOT)

from config.config_loader import load_config
from utils.logger import get_logger

logger = get_logger("performance_summary")
config = load_config()

DATA_DIR = os.path.join(PROJECT_ROOT, config['data_dir'])
HISTORY_PATH = os.path.join(DATA_DIR, 'model_metrics_history.csv')
SUMMARY_PATH = os.path.join(DATA_DIR, 'performance_summary.csv')

def generate_summary():
    logger.info("Generating performance summary...")
    
    if not os.path.exists(HISTORY_PATH):
        logger.warning(f"History file not found at {HISTORY_PATH}")
        return

    try:
        df = pd.read_csv(HISTORY_PATH)
        df['date'] = pd.to_datetime(df['date'])
        
        # Filter last 30 days
        cutoff_date = datetime.datetime.now() - datetime.timedelta(days=30)
        df_recent = df[df['date'] >= cutoff_date]
        
        if df_recent.empty:
            logger.warning("No data in the last 30 days.")
            return

        summary_list = []
        
        for item, item_df in df_recent.groupby('item'):
            item_df = item_df.sort_values('date')
            
            avg_rmse = item_df['rmse'].mean()
            avg_mae = item_df['mae'].mean()
            
            # Trend: Simple comparison of first and last RMSE in the period
            if len(item_df) >= 2:
                first_rmse = item_df.iloc[0]['rmse']
                last_rmse = item_df.iloc[-1]['rmse']
                
                if last_rmse < first_rmse * 0.95:
                    trend = "Improving"
                elif last_rmse > first_rmse * 1.05:
                    trend = "Degrading"
                else:
                    trend = "Stable"
            else:
                trend = "Insufficient Data"
                
            summary_list.append({
                'item': item,
                'avg_rmse_30d': avg_rmse,
                'avg_mae_30d': avg_mae,
                'trend': trend,
                'last_updated': datetime.datetime.now().strftime("%Y-%m-%d")
            })
            
        summary_df = pd.DataFrame(summary_list)
        summary_df.to_csv(SUMMARY_PATH, index=False)
        logger.info(f"Performance summary saved to {SUMMARY_PATH}")
        logger.info(f"Summary Preview:\n{summary_df.head()}")
        
    except Exception as e:
        logger.error(f"Error generating summary: {e}")

if __name__ == "__main__":
    generate_summary()
