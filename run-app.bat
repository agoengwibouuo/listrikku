@echo off
title Electricity Tracker PWA

echo ================================
echo   ELECTRICITY TRACKER PWA
echo ================================
echo.

REM Set execution policy if needed
powershell -Command "Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force" 2>nul

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found. Please install Node.js first.
    echo 🌐 Download from: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js found
echo.

REM Install dependencies if needed
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
    echo ✅ Dependencies installed
    echo.
)

REM Check .env.local
if not exist ".env.local" (
    echo ⚠️  .env.local not found. Creating from template...
    copy env.example .env.local >nul 2>&1
    echo ✅ .env.local created
    echo.
    echo 🔧 Please edit .env.local with your database configuration:
    echo    - DB_HOST=localhost
    echo    - DB_USER=root
    echo    - DB_PASSWORD=your_mysql_password
    echo    - DB_NAME=electricity_tracker
    echo.
    pause
)

REM Test database connection
echo 🔍 Testing database connection...
node test-db.js
if errorlevel 1 (
    echo.
    echo ❌ Database test failed. Please check your MySQL setup.
    echo.
    echo 📋 Setup checklist:
    echo 1. MySQL server is running
    echo 2. Database 'electricity_tracker' exists
    echo 3. Import database/schema.sql
    echo 4. Update .env.local with correct credentials
    echo.
    pause
    exit /b 1
)

echo.
echo 🚀 Starting development server...
echo 🌐 Application will be available at: http://localhost:3000
echo 📱 For mobile testing, use your IP address
echo.
echo Press Ctrl+C to stop the server
echo.

call npm run dev
