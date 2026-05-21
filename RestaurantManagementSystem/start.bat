@echo off
title Restaurant Management System

echo.
echo  ============================================
echo   Restaurant Management System
echo  ============================================
echo   Starting application...
echo  ============================================
echo.

start "Restaurant App" cmd /k "cd /d "%~dp0BASE" && pip install -r ..\requirements.txt && python app.py"

exit
