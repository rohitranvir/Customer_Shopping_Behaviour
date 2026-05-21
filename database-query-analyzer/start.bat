@echo off
title Database Query Analyzer - Dev Servers

echo.
echo  =====================================================
echo   Database Query Analyzer - Starting Dev Servers
echo  =====================================================
echo   Python Backend  ->  http://localhost:8000
echo   Frontend App    ->  http://localhost:5173
echo  =====================================================
echo.

start "DB Analyzer Backend" cmd /k "cd /d "%~dp0" && call venv\Scripts\activate && python backend\api\main.py"

timeout /t 2 /nobreak >nul

start "DB Analyzer Frontend" cmd /k "cd /d "%~dp0frontend" && python -m streamlit run app.py"

exit
