from datetime import datetime
from pydantic import BaseModel
from typing import Any, Dict, List, Union, Optional

class AnalyzeRequest(BaseModel):
    query: str
    profile: str = "dev"

class AnalyzeResponse(BaseModel):
    query: str
    plan: Union[List[Any], Dict[str, Any]]
    execution_time_ms: Optional[float] = None
    total_cost: Optional[float] = None

class HistoryItem(BaseModel):
    id: int
    profile: str
    query_text: str
    execution_time_ms: Optional[float]
    total_cost: Optional[float]
    timestamp: datetime

    class Config:
        orm_mode = True

class IndexRecommendation(BaseModel):
    query_id: int
    query_text: str
    recommendations: List[str]
