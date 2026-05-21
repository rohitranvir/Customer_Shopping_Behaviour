@echo off
title Chat App - Dev Servers

echo.
echo  ============================================
echo   Chat App - Starting Dev Servers
echo  ============================================
echo   Django Backend  ->  http://localhost:8000
echo   React Frontend  ->  http://localhost:5173
echo  ============================================
echo.

start "Chat Backend :8000" cmd /k "cd /d "%~dp0backend" && call venv\Scripts\activate && python manage.py runserver"

timeout /t 2 /nobreak >nul

start "Chat Frontend :5173" cmd /k "cd /d "%~dp0frontend" && npm run dev"

exit
