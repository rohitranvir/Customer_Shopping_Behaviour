@echo off
title Rohit Portfolio Backend - Dev Server

echo.
echo  ============================================
echo   Portfolio Backend - Starting Dev Server
echo  ============================================
echo   Django Backend  ->  http://localhost:8000
echo  ============================================
echo.

start "Portfolio Backend :8000" cmd /k "cd /d "%~dp0" && call venv\Scripts\activate && python manage.py runserver"

exit
