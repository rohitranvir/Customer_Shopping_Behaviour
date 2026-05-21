@echo off
title Inflation Basket Tracker

echo.
echo  ============================================
echo   Inflation Basket Tracker
echo  ============================================
echo   Running dashboard / pipeline...
echo  ============================================
echo.

start "Inflation Dashboard" cmd /k "cd /d "%~dp0" && call .venv\Scripts\activate && python -m streamlit run dashboard\app.py"

exit
