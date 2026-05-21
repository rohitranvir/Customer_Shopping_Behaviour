@echo off
title Job Agent

echo.
echo  ============================================
echo   Job Agent - Starting Services
echo  ============================================
echo   Dashboard  ->  http://localhost:8501
echo  ============================================
echo.

echo [1] Run Agent (agent.py)
echo [2] Run Dashboard (dashboard.py)
echo [3] Run Both
echo.
set /p choice=Choose option [1/2/3]: 

if "%choice%"=="1" (
    start "Job Agent" cmd /k "cd /d "%~dp0" && python agent.py"
)
if "%choice%"=="2" (
    start "Job Dashboard" cmd /k "cd /d "%~dp0" && python -m streamlit run dashboard.py"
)
if "%choice%"=="3" (
    start "Job Agent" cmd /k "cd /d "%~dp0" && python agent.py"
    timeout /t 2 /nobreak >nul
    start "Job Dashboard" cmd /k "cd /d "%~dp0" && python -m streamlit run dashboard.py"
)

exit
