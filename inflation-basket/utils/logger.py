import logging
import os
import sys
from config.config_loader import load_config

_initialized = False

def get_logger(name):
    global _initialized
    
    config = load_config()
    log_level_str = config.get("log_level", "INFO").upper()
    log_level = getattr(logging, log_level_str, logging.INFO)
    
    # Resolve logs directory
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    logs_dir = config["logs_dir"]
    if not os.path.isabs(logs_dir):
        logs_dir = os.path.join(project_root, logs_dir)
        
    log_file = os.path.join(logs_dir, "pipeline.log")

    logger = logging.getLogger(name)
    logger.setLevel(log_level)

    # Clean up existing handlers to avoid duplicates if get_logger called multiple times
    if logger.hasHandlers():
        logger.handlers.clear()

    formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(module)s - %(message)s', datefmt='%Y-%m-%d %H:%M:%S')

    # File Handler
    file_handler = logging.FileHandler(log_file)
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)

    # Console Handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)
    
    # Prevent propagation to root logger to avoid potential double logging if root is configured elsewhere
    logger.propagate = False

    return logger
