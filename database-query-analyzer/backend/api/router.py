from fastapi import APIRouter, HTTPException
from sqlalchemy import text
from backend.core.database import get_session
from backend.core.models import QueryHistory
from backend.api.schemas import AnalyzeRequest, AnalyzeResponse

router = APIRouter()

@router.post("/analyze", response_model=AnalyzeResponse)
def analyze_query(request: AnalyzeRequest):
    try:
        session = get_session(request.profile)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    if not request.query or not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty. Please enter a SQL query.")
    
    try:
        # We execute EXPLAIN ANALYZE and request JSON format for easy parsing
        explain_query = f"EXPLAIN (ANALYZE, COSTS, VERBOSE, BUFFERS, FORMAT JSON) {request.query.strip()}"
        result = session.execute(text(explain_query))
        plan = result.scalar()  # The JSON result is scalar in SQLAlchemy
        
        # Calculate time and cost from the root plan node
        execution_time_ms = plan[0].get("Plan", {}).get("Actual Total Time") if plan else None
        total_cost = plan[0].get("Plan", {}).get("Total Cost") if plan else None
        
        # Save History
        history_item = QueryHistory(
            profile=request.profile,
            query_text=request.query,
            execution_time_ms=execution_time_ms,
            total_cost=total_cost,
            plan_json=plan
        )
        session.add(history_item)
        session.commit()
        
        return AnalyzeResponse(
            query=request.query, 
            plan=plan, 
            execution_time_ms=execution_time_ms, 
            total_cost=total_cost
        )
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=400, detail=f"Query Execution Error: {str(e)}")
    finally:
        session.close()

from backend.api.schemas import HistoryItem, IndexRecommendation
from backend.optimization.index_advisor import suggest_indexes
from typing import List

@router.get("/history", response_model=List[HistoryItem])
def get_query_history(profile: str = "dev", limit: int = 50):
    try:
        session = get_session(profile)
        history = session.query(QueryHistory).filter(QueryHistory.profile == profile).order_by(QueryHistory.timestamp.desc()).limit(limit).all()
        return history
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        if 'session' in locals():
            session.close()

@router.get("/index_advisor", response_model=List[IndexRecommendation])
def get_index_recommendations(profile: str = "dev", limit: int = 10):
    """
    Get index recommendations based on historically slow queries.
    """
    try:
        session = get_session(profile)
        # Fetch up to `limit` recent queries
        history = session.query(QueryHistory).filter(QueryHistory.profile == profile).order_by(QueryHistory.execution_time_ms.desc().nullslast()).limit(limit).all()
        
        results = []
        for h in history:
            if h.plan_json:
                recs = suggest_indexes(h.plan_json)
                if recs:
                    results.append(IndexRecommendation(
                        query_id=h.id,
                        query_text=h.query_text,
                        recommendations=recs
                    ))
        return results
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        if 'session' in locals():
            session.close()
