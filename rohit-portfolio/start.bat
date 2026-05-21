@echo off
title Rohit Portfolio - Dev Server

echo.
echo  ============================================
echo   Rohit Portfolio - Starting Dev Server
echo  ============================================
echo   React Frontend  ->  http://localhost:5173
echo  ============================================
echo.

start "Portfolio Frontend :5173" cmd /k "cd /d "%~dp0" && npm run dev"

exit
