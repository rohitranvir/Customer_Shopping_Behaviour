from fastapi import FastAPI

app = FastAPI(
    title="Database Query Performance Analyzer API",
    description="Backend API for real-time monitoring, ML predictions, and query optimization.",
    version="0.1.0"
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Database Query Performance Analyzer API"}

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "Backend API"}
