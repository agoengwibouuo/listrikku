@echo off
echo Starting Electricity Tracker PWA...
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    if errorlevel 1 (
        echo Error installing dependencies. Please check your Node.js installation.
        pause
        exit /b 1
    )
)

REM Check if .env.local exists
if not exist ".env.local" (
    echo Creating .env.local file...
    copy env.example .env.local
    echo Please edit .env.local with your database configuration.
    pause
)

echo Starting development server...
echo Application will be available at: http://localhost:3000
echo.
npm run dev
