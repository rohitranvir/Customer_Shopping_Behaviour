from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from backend.core.config import settings
from backend.core.models import Base
import logging

logger = logging.getLogger(__name__)

engines = {}

def get_engine(profile: str):
    if profile not in engines:
        prof_config = settings.profiles.get(profile)
        if not prof_config:
            raise ValueError(f"Database profile '{profile}' not found.")
        
        logger.info(f"Creating engine for profile '{profile}'")
        engines[profile] = create_engine(
            prof_config.url,
            pool_pre_ping=True
        )
        
        # Ensure tracking tables exist in this target profile's database
        try:
            Base.metadata.create_all(bind=engines[profile])
            logger.info(f"Initialized tracking tables for profile '{profile}'")
        except Exception as e:
            logger.warning(f"Could not create tracking tables for '{profile}': {e}")
            
    return engines[profile]

def get_session(profile: str) -> Session:
    engine = get_engine(profile)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    return SessionLocal()
