@echo off
echo ============================================
echo        EquiBridge - Starting All Services
echo ============================================
echo.

REM Step 1: Create MongoDB data directory if it doesn't exist
if not exist "C:\data\db" (
    echo Creating MongoDB data directory...
    mkdir "C:\data\db"
)

REM Step 2: Start MongoDB (local)
echo [1/3] Starting MongoDB on port 27017...
start "MongoDB" cmd /k "mongod --dbpath C:\data\db"
timeout /t 3 /nobreak >nul

REM Step 3: Start FastAPI Backend
echo [2/3] Starting FastAPI Backend on port 8000...
start "EquiBridge Backend" cmd /k "cd /d %~dp0backend && uvicorn main:app --reload --port 8000"
timeout /t 4 /nobreak >nul

REM Step 4: Start Vite Frontend
echo [3/3] Starting Vite Frontend on port 5173...
start "EquiBridge Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"
timeout /t 4 /nobreak >nul

echo.
echo ============================================
echo  All services started!
echo.
echo  MongoDB:   mongodb://localhost:27017
echo  Backend:   http://localhost:8000
echo  Frontend:  http://localhost:5173
echo  API Docs:  http://localhost:8000/docs
echo  Compass:   Connect to mongodb://localhost:27017
echo ============================================
echo.

start http://localhost:5173
pause
