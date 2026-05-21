@echo off
title RealTimeCodeReview - Dev Servers

echo.
echo  =====================================================
echo   RealTimeCodeReview - Starting Dev Servers
echo  =====================================================
echo   Django Backend  ->  http://localhost:8000
echo   FastAPI WS      ->  http://localhost:8001
echo   React Frontend  ->  http://localhost:5173
echo  =====================================================
echo.

start "Django Backend :8000" cmd /k "cd /d "%~dp0backend" && call venv\Scripts\activate && python manage.py runserver"

timeout /t 2 /nobreak >nul

start "FastAPI WS :8001" cmd /k "cd /d "%~dp0backend" && call venv\Scripts\activate && uvicorn fastapi_ws.main:app --reload --port 8001"

timeout /t 2 /nobreak >nul

start "React Frontend :5173" cmd /k "cd /d "%~dp0frontend" && npm run dev"

exit
