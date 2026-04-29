import os
import sys
import datetime

# Add project root to path
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(PROJECT_ROOT)

from config.config_loader import load_config
from utils.logger import get_logger

logger = get_logger("health_check")
config = load_config()

DATA_DIR = os.path.join(PROJECT_ROOT, config['data_dir'])
LOGS_DIR = os.path.join(PROJECT_ROOT, config['logs_dir'])
REPORT_PATH = os.path.join(LOGS_DIR, 'health_report.txt')

def run_health_check():
    logger.info("Running system health check...")
    
    issues = []
    
    # 1. Data Freshness
    # we can check db modification time or query it. 
    # For simplicity, checking DB file modification time.
    db_path = os.path.join(DATA_DIR, 'prices.db')
    if os.path.exists(db_path):
        mtime = os.path.getmtime(db_path)
        last_modified = datetime.datetime.fromtimestamp(mtime)
        days_since_update = (datetime.datetime.now() - last_modified).days
        
        if days_since_update > 3:
            issues.append(f"WARNING: Database not updated in {days_since_update} days.")
    else:
        issues.append("CRITICAL: Database file missing.")

    # 2. Model Freshness (from metadata)
    metadata_path = os.path.join(DATA_DIR, 'model_metadata.json')
    if os.path.exists(metadata_path):
        try:
            import json
            with open(metadata_path, 'r') as f:
                metadata = json.load(f)
            last_train = datetime.datetime.strptime(metadata.get('last_train_date', '2000-01-01'), "%Y-%m-%d")
            days_since_train = (datetime.datetime.now() - last_train).days
            
            if days_since_train > 14:
                 issues.append(f"WARNING: Models not retrained in {days_since_train} days.")
        except:
            issues.append("ERROR: Could not read model metadata.")
    else:
        issues.append("WARNING: Model metadata missing.")

    # 3. Prediction Freshness
    pred_path = os.path.join(DATA_DIR, 'predictions.csv')
    if os.path.exists(pred_path):
        mtime = os.path.getmtime(pred_path)
        last_pred = datetime.datetime.fromtimestamp(mtime)
        hours_since_pred = (datetime.datetime.now() - last_pred).total_seconds() / 3600
        
        if hours_since_pred > 24:
            issues.append(f"WARNING: Predictions older than 24 hours ({hours_since_pred:.1f} hours).")
    else:
        issues.append("WARNING: Predictions file missing.")

    # Generate Report
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    status = "HEALTHY" if not issues else "ISSUES FOUND"
    
    report_content = [
        f"Health Check Report - {timestamp}",
        f"Status: {status}",
        "-" * 30
    ]
    if issues:
        report_content.extend(issues)
    else:
        report_content.append("All systems operational.")
        
    with open(REPORT_PATH, 'w') as f:
        f.write("\n".join(report_content))
    
    logger.info(f"Health check complete. Status: {status}. Report saved to {REPORT_PATH}")
    
    # Also log issues to main log
    for issue in issues:
        logger.warning(issue)

if __name__ == "__main__":
    run_health_check()
