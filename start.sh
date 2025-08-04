#!/bin/bash

echo "🚀 Starting JuliaOS Arbitrage Swarm Bot..."

# Start backend server
echo "📡 Starting backend server on port 3001..."
cd server && npm start &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "🌐 Starting frontend on port 3000..."
cd ../frontend && npm start &
FRONTEND_PID=$!

echo "✅ Both servers are starting..."
echo "📊 Backend API: http://localhost:3001"
echo "🌐 Frontend UI: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID 