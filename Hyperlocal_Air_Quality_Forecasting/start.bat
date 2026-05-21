@echo off
title Hyperlocal Air Quality Forecasting

echo.
echo  ============================================
echo   Air Quality Forecasting - Starting App
echo  ============================================
echo   App  ->  http://localhost:8501
echo  ============================================
echo.

start "Air Quality App" cmd /k "cd /d "%~dp0" && python app.py"

exit
