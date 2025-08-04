const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Bot state management
let botState = {
  isRunning: false,
  performance: {
    totalOpportunities: 100,
    successfulTrades: 85,
    successRate: 0.85,
    totalProfit: 1500.0,
    opportunitiesPerHour: 45.5,
    uptime: '2h 15m 30s'
  },
  agents: [
    { id: 'arbitrage-1', type: 'Arbitrage', status: 'active', load: 0.8 },
    { id: 'market-1', type: 'Market Analysis', status: 'active', load: 0.6 },
    { id: 'risk-1', type: 'Risk Assessment', status: 'active', load: 0.7 },
    { id: 'execution-1', type: 'Execution', status: 'active', load: 0.9 },
    { id: 'portfolio-1', type: 'Portfolio Manager', status: 'active', load: 0.5 }
  ],
  swarm: {
    totalAgents: 10,
    activeAgents: 5,
    coordinationStrategy: 'consensus',
    consensusThreshold: 0.7
  },
  opportunities: [],
  logs: []
};

// Load configuration
let config = {};
try {
  config = JSON.parse(fs.readFileSync(path.join(__dirname, '../config.json'), 'utf8'));
} catch (error) {
  console.log('No config file found, using defaults');
  config = {
    arbitrage_agent: {
      exchanges: ['uniswap', 'sushiswap'],
      chains: ['ethereum', 'bsc'],
      min_profit_threshold: 0.5,
      max_risk_score: 70.0,
      monitoring_interval: 30
    },
    agent_swarm: {
      max_agents: 10,
      coordination_strategy: 'consensus',
      consensus_threshold: 0.7
    },
    cross_chain_bridge: {
      gas_optimization: true,
      slippage_tolerance: 1.0,
      max_retries: 3
    }
  };
}

// API Routes
app.get('/api/status', (req, res) => {
  res.json({
    isRunning: botState.isRunning,
    performance: botState.performance,
    swarm: botState.swarm
  });
});

app.get('/api/config', (req, res) => {
  res.json(config);
});

app.put('/api/config', (req, res) => {
  try {
    config = { ...config, ...req.body };
    fs.writeFileSync(path.join(__dirname, '../config.json'), JSON.stringify(config, null, 2));
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save configuration' });
  }
});

app.post('/api/bot/start', (req, res) => {
  botState.isRunning = true;
  botState.performance.uptime = '0h 0m 0s';
  
  // Emit to all connected clients
  io.emit('bot_status', {
    isRunning: true,
    performance: botState.performance
  });
  
  res.json({ success: true, message: 'Bot started successfully' });
});

app.post('/api/bot/stop', (req, res) => {
  botState.isRunning = false;
  
  // Emit to all connected clients
  io.emit('bot_status', {
    isRunning: false,
    performance: botState.performance
  });
  
  res.json({ success: true, message: 'Bot stopped successfully' });
});

app.get('/api/agents', (req, res) => {
  res.json(botState.agents);
});

app.get('/api/opportunities', (req, res) => {
  res.json(botState.opportunities);
});

app.get('/api/logs', (req, res) => {
  const limit = parseInt(req.query.limit) || 100;
  res.json(botState.logs.slice(0, limit));
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Send initial state
  socket.emit('bot_status', {
    isRunning: botState.isRunning,
    performance: botState.performance
  });
  
  // Simulate real-time updates
  const updateInterval = setInterval(() => {
    if (botState.isRunning) {
      // Simulate new opportunities
      if (Math.random() > 0.7) {
        const opportunity = {
          id: Date.now(),
          token: ['USDC', 'ETH', 'BTC', 'DAI'][Math.floor(Math.random() * 4)],
          source_exchange: ['uniswap', 'sushiswap', 'pancakeswap'][Math.floor(Math.random() * 3)],
          target_exchange: ['sushiswap', 'uniswap', 'curve'][Math.floor(Math.random() * 3)],
          source_chain: ['ethereum', 'bsc', 'polygon'][Math.floor(Math.random() * 3)],
          target_chain: ['bsc', 'ethereum', 'arbitrum'][Math.floor(Math.random() * 3)],
          source_price: 1.0 + Math.random() * 0.1,
          target_price: 1.0 + Math.random() * 0.1,
          profit_percentage: Math.random() * 5,
          estimated_profit: Math.random() * 100,
          risk_score: Math.random() * 50,
          timestamp: new Date().toISOString()
        };
        
        botState.opportunities.unshift(opportunity);
        botState.performance.totalOpportunities++;
        
        socket.emit('opportunity_detected', opportunity);
      }
      
      // Simulate log entries
      if (Math.random() > 0.8) {
        const logEntry = {
          id: Date.now(),
          level: ['INFO', 'WARNING', 'ERROR'][Math.floor(Math.random() * 3)],
          message: [
            'Detected arbitrage opportunity',
            'Executed trade successfully',
            'Bridge transfer completed',
            'Agent performance updated',
            'Swarm consensus reached'
          ][Math.floor(Math.random() * 5)],
          timestamp: new Date().toISOString()
        };
        
        botState.logs.unshift(logEntry);
        socket.emit('log_entry', logEntry);
      }
      
      // Update performance metrics
      botState.performance.totalProfit += Math.random() * 10;
      botState.performance.successfulTrades += Math.random() > 0.8 ? 1 : 0;
      botState.performance.successRate = botState.performance.successfulTrades / botState.performance.totalOpportunities;
      
      socket.emit('real_time_update', {
        currentOpportunities: botState.opportunities.length,
        lastProfit: botState.performance.totalProfit,
        activeChains: ['ethereum', 'bsc', 'polygon'],
        activeExchanges: ['uniswap', 'sushiswap', 'pancakeswap']
      });
    }
  }, 2000);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    clearInterval(updateInterval);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 JuliaOS Arbitrage Swarm Bot Server running on port ${PORT}`);
  console.log(`📊 API available at http://localhost:${PORT}/api`);
  console.log(`🔌 WebSocket server ready for connections`);
});

module.exports = { app, server, io }; 