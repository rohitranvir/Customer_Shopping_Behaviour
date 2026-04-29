@echo off

echo Creating environment files from examples...
if not exist "frontend\.env" copy "frontend\.env.example" "frontend\.env"
if not exist "backend\.env" copy "backend\.env.example" "backend\.env"

echo Starting Frontend on Port 5173...
start cmd /k "title Tea3 Frontend && cd frontend && npm run dev"

echo Setting up and starting Backend on Port 8000...
start cmd /k "title Tea3 Backend && cd backend && python -m venv venv && call venv\Scripts\activate && python -m pip install --upgrade pip setuptools && pip install --no-deps djongo==1.3.6 && pip install -r requirements.txt && python manage.py makemigrations && python manage.py migrate && python manage.py runserver"

echo Tea3 servers are spinning up in new windows!
