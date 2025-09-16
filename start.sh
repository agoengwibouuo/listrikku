#!/bin/bash

echo "Starting Electricity Tracker PWA..."
echo

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "Error installing dependencies. Please check your Node.js installation."
        exit 1
    fi
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "Creating .env.local file..."
    cp env.example .env.local
    echo "Please edit .env.local with your database configuration."
    read -p "Press Enter to continue..."
fi

echo "Starting development server..."
echo "Application will be available at: http://localhost:3000"
echo
npm run dev
