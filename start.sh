#!/bin/bash

echo "🚀 Starting JuliaOS Arbitrage Swarm Bot..."

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Check if directories exist
if [ ! -d "$SCRIPT_DIR/server" ]; then
    echo "❌ Error: server directory not found!"
    exit 1
fi

if [ ! -d "$SCRIPT_DIR/frontend" ]; then
    echo "❌ Error: frontend directory not found!"
    exit 1
fi

# Kill any existing processes on ports 3000 and 3001
echo "🔧 Checking for existing processes..."
pkill -f "node.*server.js" 2>/dev/null || true
pkill -f "react-scripts.*start" 2>/dev/null || true

# Start backend server
echo "📡 Starting backend server on port 3001..."
cd "$SCRIPT_DIR/server" && npm start &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 5

# Start frontend
echo "🌐 Starting frontend on port 3000..."
cd "$SCRIPT_DIR/frontend" && npm start &
FRONTEND_PID=$!

echo "✅ Both servers are starting..."
echo "📊 Backend API: http://localhost:3001"
echo "🌐 Frontend UI: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID 