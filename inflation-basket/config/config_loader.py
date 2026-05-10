import yaml
import os
import sys

def load_config(config_path=None):
    if config_path is None:
        # Default to config.yaml in the same directory as this script
        base_dir = os.path.dirname(os.path.abspath(__file__))
        config_path = os.path.join(base_dir, "config.yaml")

    if not os.path.exists(config_path):
        raise FileNotFoundError(f"Configuration file not found at {config_path}")

    with open(config_path, "r") as f:
        config = yaml.safe_load(f)

    required_keys = [
        "data_dir",
        "models_dir",
        "logs_dir",
        "retraining_interval_days",
        "forecast_horizon_days",
        "log_level"
    ]

    for key in required_keys:
        if key not in config:
            raise ValueError(f"Missing configuration key: {key}")

    # Auto-create directories relative to project root (parent of config folder)
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    for dir_key in ["data_dir", "models_dir", "logs_dir"]:
        # Allow absolute paths, or resolve relative to project root
        path = config[dir_key]
        if not os.path.isabs(path):
            path = os.path.join(project_root, path)
        
        if not os.path.exists(path):
            os.makedirs(path)
            print(f"Created directory: {path}") # Use print here as logger might not be ready

    return config
