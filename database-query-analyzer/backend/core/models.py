from sqlalchemy import Column, Integer, String, Float, DateTime, JSON
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class QueryHistory(Base):
    __tablename__ = "query_history"

    id = Column(Integer, primary_key=True, index=True)
    profile = Column(String, index=True)
    query_text = Column(String)
    execution_time_ms = Column(Float)
    total_cost = Column(Float)
    plan_json = Column(JSON)
    timestamp = Column(DateTime, default=datetime.utcnow)
