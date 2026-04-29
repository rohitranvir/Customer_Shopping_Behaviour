
import os
import sys
import datetime
import json
import pandas as pd

# Setup paths
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(PROJECT_ROOT)

# Import functional modules
from config.config_loader import load_config
from utils.logger import get_logger
from scraper.scrape_prices import main as run_scraper
from processing.data_quality import check_data_quality
from ml.train_model import train as run_training, fetch_data
from ml.predict import predict_future as run_prediction

# Initialize Logger
logger = get_logger("pipeline")

def check_startup_health(config):
    """
    Validates environment before running pipeline.
    """
    try:
        data_dir = os.path.join(PROJECT_ROOT, config['data_dir'])
        if not os.path.exists(data_dir):
             # Should be created by config loader, but double check
             logger.error(f"Startup validation failed: Data directory {data_dir} missing.")
             return False
             
        # Check DB connectivity
        # We could add a quick DB check here but fetch_data() does it later.
        
        # Check if model directory exists
        models_dir = os.path.join(PROJECT_ROOT, config['models_dir'])
        if not os.path.exists(models_dir):
             logger.error(f"Startup validation failed: Models directory {models_dir} missing.")
             return False

        return True
    except Exception as e:
        logger.error(f"Startup validation failed: {e}")
        return False

def check_retraining_needed(config):
    """
    Determines if retraining is required based on time since last training.
    """
    logger.info("Checking retraining conditions...")
    
    data_dir = os.path.join(PROJECT_ROOT, config['data_dir'])
    metadata_path = os.path.join(data_dir, 'model_metadata.json')
    
    if os.path.exists(metadata_path):
        try:
            with open(metadata_path, 'r') as f:
                metadata = json.load(f)
            last_train_date = datetime.datetime.strptime(metadata.get('last_train_date', '2000-01-01'), "%Y-%m-%d")
            days_diff = (datetime.datetime.now() - last_train_date).days
            
            interval = config.get('retraining_interval_days', 7)
            
            if days_diff >= interval:
                logger.info(f"Retraining needed: Last training was {days_diff} days ago (Interval: {interval}).")
                return True
            else:
                logger.info(f"Time condition not met: Only {days_diff} days since last training.")
        except Exception as e:
            logger.error(f"Error reading metadata: {e}")
            return True # Fallback to retrain if metadata corrupt
    else:
         logger.info("Retraining needed: No metadata found (first run?).")
         return True
    
    return False

def run_pipeline():
    try:
        # Load Config
        config = load_config()
        
        # Startup Check
        if not check_startup_health(config):
            sys.exit(1)

        logger.info("Pipeline started.")
        
        # 1. Scrape
        try:
            logger.info("Step 1: Running Scraper...")
            run_scraper()
            logger.info("Scraper completed.")
        except Exception as e:
            logger.error(f"Scraper failed: {e}")
            logger.error("Stopping pipeline due to Scraper failure.")
            raise e

        # 2. Data Quality
        try:
            logger.info("Step 2: Checking Data Quality...")
            df = fetch_data() # fetch_data creates its own connection, fine.
            if df.empty:
                logger.warning("No data found in database.")
                # We stop if no data, as training/pred is impossible
                return 
            
            report = check_data_quality(df)
            low_variance_items = report[report['status'] != 'OK']['item'].tolist()
            if low_variance_items:
                logger.warning(f"Data Quality Warning: Low variance/issues for {low_variance_items}")
            
            logger.info("Data Quality Check completed.")
        except Exception as e:
            logger.error(f"Data Quality Check failed: {e}")
            raise e

        # 3. Retraining Decision & Training
        try:
            if check_retraining_needed(config):
                logger.info("Step 3: Running Model Training...")
                run_training()
                logger.info("Model training completed.")
            else:
                logger.info("Step 3: Skipping Training (No significant new data or drift).")
        except Exception as e:
            logger.error(f"Training failed: {e}")
            raise e

        # 4. Prediction
        try:
            logger.info("Step 4: Running Prediction...")
            run_prediction()
            logger.info("Prediction completed.")
        except Exception as e:
            logger.error(f"Prediction failed: {e}")
            raise e

        logger.info("Pipeline finished successfully.")

    except Exception as e:
        # Critical Error Handler
        logs_dir = "logs" # Fallback if config failed
        try:
            config = load_config()
            logs_dir = config['logs_dir']
        except: 
            pass
            
        if not os.path.isabs(logs_dir):
             logs_dir = os.path.join(PROJECT_ROOT, logs_dir)
             
        critical_log = os.path.join(logs_dir, "critical_errors.log")
        timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        with open(critical_log, "a") as f:
            f.write(f"{timestamp} - ERROR - PIPELINE - {str(e)}\n")
        
        print(f"CRITICAL PIPELINE FAILURE. See {critical_log}")
        sys.exit(1)

if __name__ == "__main__":
    run_pipeline()
