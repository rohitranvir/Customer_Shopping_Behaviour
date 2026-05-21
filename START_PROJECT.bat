@echo off
:MENU
cls
color 0A
echo.
echo  ########################################################
echo  ##                                                    ##
echo  ##         ROHIT'S PROJECT LAUNCHER v1.0             ##
echo  ##                                                    ##
echo  ########################################################
echo.
echo  ---- Full Stack Projects --------------------------------
echo   [1]  Streat Vender       (Django + React)
echo   [2]  PDFscrapper         (FastAPI + React)
echo   [3]  Chat App            (Django + React)
echo   [4]  BedR                (Django + React)
echo   [5]  RealTimeCodeReview  (Django + FastAPI WS + React)
echo   [6]  Database Query Analyzer (Python + Streamlit)
echo.
echo  ---- Frontend Only Projects -----------------------------
echo   [7]  Rohit Portfolio     (Vite React)
echo   [8]  Artisan Espresso    (Static HTML - open in browser)
echo   [9]  Tea3                (Static HTML - open in browser)
echo.
echo  ---- Backend / API Only Projects -----------------------
echo   [10] Rohit Portfolio Backend (Django)
echo   [11] KidTutor               (Django)
echo.
echo  ---- Python / AI / Data Projects -----------------------
echo   [12] Inflation Basket Tracker  (Streamlit Dashboard)
echo   [13] Air Quality Forecasting   (Python app.py)
echo   [14] Restaurant Mgmt System    (Python)
echo   [15] Job Agent                 (Python Agent + Dashboard)
echo.
echo  ---- Mobile App Projects --------------------------------
echo   [16] Khata App          (Expo React Native)
echo.
echo  ---------------------------------------------------------
echo   [0]  EXIT
echo  ---------------------------------------------------------
echo.
set /p choice=  Enter project number: 

if "%choice%"=="1"  goto STREAT_VENDER
if "%choice%"=="2"  goto PDF_SCRAPPER
if "%choice%"=="3"  goto CHAT_APP
if "%choice%"=="4"  goto BEDR
if "%choice%"=="5"  goto REALTIMECODEREVIEW
if "%choice%"=="6"  goto DB_QUERY_ANALYZER
if "%choice%"=="7"  goto PORTFOLIO
if "%choice%"=="8"  goto ARTISAN
if "%choice%"=="9"  goto TEA3
if "%choice%"=="10" goto PORTFOLIO_BACKEND
if "%choice%"=="11" goto KIDTUTOR
if "%choice%"=="12" goto INFLATION
if "%choice%"=="13" goto AIR_QUALITY
if "%choice%"=="14" goto RESTAURANT
if "%choice%"=="15" goto JOB_AGENT
if "%choice%"=="16" goto KHATA_APP
if "%choice%"=="0"  goto EXIT
echo.
echo  [!] Invalid choice. Please try again.
timeout /t 2 /nobreak >nul
goto MENU


:: ============================================================
:STREAT_VENDER
cls
echo.
echo  [>>] Launching Streat Vender (Django + React)...
echo       Backend  -> http://localhost:8000
echo       Frontend -> http://localhost:5173
echo.
start "Streat Vender - Django :8000" cmd /k "cd /d ""%~dp0Streat vender\vendorconnect_backend"" && call venv\Scripts\activate && python manage.py runserver"
timeout /t 2 /nobreak >nul
start "Streat Vender - React :5173"  cmd /k "cd /d ""%~dp0Streat vender\street-vendor-digital-shop-builder\frontend"" && npm run dev"
goto BACK


:: ============================================================
:PDF_SCRAPPER
cls
echo.
echo  [>>] Launching PDFscrapper (FastAPI + React)...
echo       Backend  -> http://localhost:8000/docs
echo       Frontend -> http://localhost:5173
echo.
start "PDFscrapper - FastAPI :8000"  cmd /k "cd /d ""%~dp0PDFscrapper\backend"" && call .venv\Scripts\activate && uvicorn main:app --reload --host 0.0.0.0 --port 8000"
timeout /t 2 /nobreak >nul
start "PDFscrapper - React :5173"    cmd /k "cd /d ""%~dp0PDFscrapper\frontend"" && npm run dev"
goto BACK


:: ============================================================
:CHAT_APP
cls
echo.
echo  [>>] Launching Chat App (Django + React)...
echo       Backend  -> http://localhost:8000
echo       Frontend -> http://localhost:5173
echo.
start "Chat App - Django :8000"  cmd /k "cd /d ""%~dp0chat-app\backend"" && call venv\Scripts\activate && python manage.py runserver"
timeout /t 2 /nobreak >nul
start "Chat App - React :5173"   cmd /k "cd /d ""%~dp0chat-app\frontend"" && npm run dev"
goto BACK


:: ============================================================
:BEDR
cls
echo.
echo  [>>] Launching BedR (Django + React)...
echo       Backend  -> http://localhost:8000
echo       Frontend -> http://localhost:5173
echo.
start "BedR - Django :8000"  cmd /k "cd /d ""%~dp0BedR\backend"" && call venv\Scripts\activate && python manage.py runserver"
timeout /t 2 /nobreak >nul
start "BedR - React :5173"   cmd /k "cd /d ""%~dp0BedR\frontend"" && npm run dev"
goto BACK


:: ============================================================
:REALTIMECODEREVIEW
cls
echo.
echo  [>>] Launching RealTimeCodeReview (Django + FastAPI WS + React)...
echo       Django   -> http://localhost:8000
echo       FastAPI  -> http://localhost:8001
echo       Frontend -> http://localhost:5173
echo.
start "CodeReview - Django :8000"   cmd /k "cd /d ""%~dp0RealTimeCodeReview\backend"" && call venv\Scripts\activate && python manage.py runserver"
timeout /t 2 /nobreak >nul
start "CodeReview - FastAPI WS :8001" cmd /k "cd /d ""%~dp0RealTimeCodeReview\backend"" && call venv\Scripts\activate && uvicorn fastapi_ws.main:app --reload --port 8001"
timeout /t 2 /nobreak >nul
start "CodeReview - React :5173"    cmd /k "cd /d ""%~dp0RealTimeCodeReview\frontend"" && npm run dev"
goto BACK


:: ============================================================
:DB_QUERY_ANALYZER
cls
echo.
echo  [>>] Launching Database Query Analyzer...
echo       Backend  -> http://localhost:8000
echo       Frontend -> http://localhost:8501
echo.
start "DB Analyzer Backend"   cmd /k "cd /d ""%~dp0database-query-analyzer"" && call venv\Scripts\activate && python backend\api\main.py"
timeout /t 2 /nobreak >nul
start "DB Analyzer Frontend"  cmd /k "cd /d ""%~dp0database-query-analyzer\frontend"" && python -m streamlit run app.py"
goto BACK


:: ============================================================
:PORTFOLIO
cls
echo.
echo  [>>] Launching Rohit Portfolio (Vite React)...
echo       Frontend -> http://localhost:5173
echo.
start "Portfolio - Vite :5173"  cmd /k "cd /d ""%~dp0rohit-portfolio"" && npm run dev"
goto BACK


:: ============================================================
:ARTISAN
cls
echo.
echo  [>>] Opening Artisan Espresso (Static Site)...
start "" "d:\Project\artisan-espresso\index.html"
goto BACK


:: ============================================================
:TEA3
cls
echo.
echo  [>>] Opening Tea3 (Static Site)...
start "" "d:\Project\tea3\menu.html"
goto BACK


:: ============================================================
:PORTFOLIO_BACKEND
cls
echo.
echo  [>>] Launching Portfolio Backend (Django)...
echo       Backend  -> http://localhost:8000
echo.
start "Portfolio Backend :8000"  cmd /k "cd /d ""%~dp0rohit-portfolio-backend"" && call venv\Scripts\activate && python manage.py runserver"
goto BACK


:: ============================================================
:KIDTUTOR
cls
echo.
echo  [>>] Launching KidTutor (Django)...
echo       Backend  -> http://localhost:8000
echo.
start "KidTutor :8000"  cmd /k "cd /d ""%~dp0KidTutor"" && call venv\Scripts\activate && python manage.py runserver"
goto BACK


:: ============================================================
:INFLATION
cls
echo.
echo  [>>] Launching Inflation Basket Tracker (Streamlit)...
echo       Dashboard -> http://localhost:8501
echo.
start "Inflation Dashboard"  cmd /k "cd /d ""%~dp0inflation-basket"" && call .venv\Scripts\activate && python -m streamlit run dashboard\app.py"
goto BACK


:: ============================================================
:AIR_QUALITY
cls
echo.
echo  [>>] Launching Hyperlocal Air Quality Forecasting...
echo       App -> http://localhost:8501
echo.
start "Air Quality App"  cmd /k "cd /d ""%~dp0Hyperlocal_Air_Quality_Forecasting"" && python app.py"
goto BACK


:: ============================================================
:RESTAURANT
cls
echo.
echo  [>>] Launching Restaurant Management System...
echo.
start "Restaurant App"  cmd /k "cd /d ""%~dp0RestaurantManagementSystem\BASE"" && python app.py"
goto BACK


:: ============================================================
:JOB_AGENT
cls
echo.
echo  [>>] Launching Job Agent...
echo.
echo   [1] Run Agent only (agent.py)
echo   [2] Run Dashboard only (dashboard.py)
echo   [3] Run Both
echo.
set /p ja=  Choose [1/2/3]: 
if "%ja%"=="1" start "Job Agent" cmd /k "cd /d ""%~dp0job-agent"" && python agent.py"
if "%ja%"=="2" start "Job Dashboard" cmd /k "cd /d ""%~dp0job-agent"" && python -m streamlit run dashboard.py"
if "%ja%"=="3" (
    start "Job Agent" cmd /k "cd /d ""%~dp0job-agent"" && python agent.py"
    timeout /t 2 /nobreak >nul
    start "Job Dashboard" cmd /k "cd /d ""%~dp0job-agent"" && python -m streamlit run dashboard.py"
)
goto BACK


:: ============================================================
:KHATA_APP
cls
echo.
echo  [>>] Launching Khata App (Expo React Native)...
echo       Metro Bundler -> http://localhost:8081
echo.
start "Khata App - Expo"  cmd /k "cd /d ""%~dp0khata-app"" && npx expo start"
goto BACK


:: ============================================================
:BACK
echo.
echo  [*] Servers launched! Press any key to return to menu...
pause >nul
goto MENU


:: ============================================================
:EXIT
cls
echo.
echo  Goodbye! Happy Coding, Rohit!
echo.
timeout /t 2 /nobreak >nul
exit
