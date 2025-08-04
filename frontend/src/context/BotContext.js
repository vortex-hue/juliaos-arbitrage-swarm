import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';

const BotContext = createContext();

const initialState = {
  botStatus: 'offline',
  isRunning: false,
  performance: {
    totalOpportunities: 0,
    successfulTrades: 0,
    successRate: 0,
    totalProfit: 0,
    opportunitiesPerHour: 0,
    uptime: '0h 0m 0s'
  },
  agents: [],
  swarm: {
    totalAgents: 0,
    activeAgents: 0,
    coordinationStrategy: 'consensus',
    consensusThreshold: 0.7
  },
  opportunities: [],
  logs: [],
  configuration: null,
  realTimeData: {
    currentOpportunities: 0,
    lastProfit: 0,
    activeChains: [],
    activeExchanges: []
  }
};

const botReducer = (state, action) => {
  switch (action.type) {
    case 'SET_BOT_STATUS':
      return { ...state, botStatus: action.payload };
    case 'SET_RUNNING':
      return { ...state, isRunning: action.payload };
    case 'UPDATE_PERFORMANCE':
      return { ...state, performance: { ...state.performance, ...action.payload } };
    case 'UPDATE_AGENTS':
      return { ...state, agents: action.payload };
    case 'UPDATE_SWARM':
      return { ...state, swarm: { ...state.swarm, ...action.payload } };
    case 'ADD_OPPORTUNITY':
      return { 
        ...state, 
        opportunities: [action.payload, ...state.opportunities.slice(0, 99)]
      };
    case 'ADD_LOG':
      return { 
        ...state, 
        logs: [action.payload, ...state.logs.slice(0, 999)]
      };
    case 'UPDATE_CONFIGURATION':
      return { ...state, configuration: action.payload };
    case 'UPDATE_REAL_TIME_DATA':
      return { ...state, realTimeData: { ...state.realTimeData, ...action.payload } };
    default:
      return state;
  }
};

export const BotProvider = ({ children }) => {
  const [state, dispatch] = useReducer(botReducer, initialState);

  useEffect(() => {
    // Initialize WebSocket connection
    const socket = io('http://localhost:3001');
    
    socket.on('connect', () => {
      console.log('Connected to bot server');
      dispatch({ type: 'SET_BOT_STATUS', payload: 'connected' });
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from bot server');
      dispatch({ type: 'SET_BOT_STATUS', payload: 'disconnected' });
    });

    socket.on('bot_status', (data) => {
      dispatch({ type: 'SET_RUNNING', payload: data.isRunning });
      dispatch({ type: 'UPDATE_PERFORMANCE', payload: data.performance });
    });

    socket.on('opportunity_detected', (opportunity) => {
      dispatch({ type: 'ADD_OPPORTUNITY', payload: opportunity });
    });

    socket.on('log_entry', (log) => {
      dispatch({ type: 'ADD_LOG', payload: log });
    });

    socket.on('real_time_update', (data) => {
      dispatch({ type: 'UPDATE_REAL_TIME_DATA', payload: data });
    });

    // Load initial data
    loadInitialData();

    return () => {
      socket.disconnect();
    };
  }, []);

  const loadInitialData = async () => {
    try {
      const [configRes, statusRes] = await Promise.all([
        axios.get('/api/config'),
        axios.get('/api/status')
      ]);

      dispatch({ type: 'UPDATE_CONFIGURATION', payload: configRes.data });
      dispatch({ type: 'UPDATE_PERFORMANCE', payload: statusRes.data.performance });
      dispatch({ type: 'SET_RUNNING', payload: statusRes.data.isRunning });
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  };

  const startBot = async () => {
    try {
      const response = await axios.post('/api/bot/start');
      dispatch({ type: 'SET_RUNNING', payload: true });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const stopBot = async () => {
    try {
      const response = await axios.post('/api/bot/stop');
      dispatch({ type: 'SET_RUNNING', payload: false });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const updateConfiguration = async (config) => {
    try {
      const response = await axios.put('/api/config', config);
      dispatch({ type: 'UPDATE_CONFIGURATION', payload: response.data });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const value = {
    ...state,
    startBot,
    stopBot,
    updateConfiguration
  };

  return (
    <BotContext.Provider value={value}>
      {children}
    </BotContext.Provider>
  );
};

export const useBot = () => {
  const context = useContext(BotContext);
  if (!context) {
    throw new Error('useBot must be used within a BotProvider');
  }
  return context;
}; 