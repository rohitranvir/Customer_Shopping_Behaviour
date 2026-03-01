from dataclasses import dataclass, field
from typing import Dict
import os
from dotenv import load_dotenv

load_dotenv()

DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "postgres")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "postgres")

@dataclass
class DatabaseProfile:
    url: str
    pool_size: int = 5
    max_overflow: int = 10

@dataclass
class Settings:
    profiles: Dict[str, DatabaseProfile] = field(default_factory=lambda: {
        "dev": DatabaseProfile(url=f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"),
        "staging": DatabaseProfile(url=f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/staging_db"),
        "prod": DatabaseProfile(url=f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/prod_db"),
    })

settings = Settings()
