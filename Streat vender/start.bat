@echo off
title VendorConnect India

echo.
echo  ============================================
echo   VendorConnect India - Starting Dev Servers
echo  ============================================
echo   Django backend  ->  http://localhost:8000
echo   React frontend  ->  http://localhost:5173
echo  ============================================
echo.

start "Django Backend :8000" cmd /k "cd /d ""%~dp0vendorconnect_backend"" && call venv\Scripts\activate && python manage.py runserver"

timeout /t 2 /nobreak >nul

start "React Frontend :5173" cmd /k "cd /d ""%~dp0street-vendor-digital-shop-builder\frontend"" && npm run dev"

exit
