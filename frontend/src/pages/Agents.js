import React from 'react';
import { motion } from 'framer-motion';
import { useBot } from '../context/BotContext';
import {
  CubeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const Agents = () => {
  const { agents } = useBot();

  const mockAgents = [
    { id: 'arbitrage-1', type: 'Arbitrage', status: 'active', load: 0.8, performance: 0.95 },
    { id: 'market-1', type: 'Market Analysis', status: 'active', load: 0.6, performance: 0.88 },
    { id: 'risk-1', type: 'Risk Assessment', status: 'active', load: 0.7, performance: 0.92 },
    { id: 'execution-1', type: 'Execution', status: 'active', load: 0.9, performance: 0.98 },
    { id: 'portfolio-1', type: 'Portfolio Manager', status: 'active', load: 0.5, performance: 0.85 }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="w-5 h-5 text-green-400" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400" />;
      case 'error':
        return <XCircleIcon className="w-5 h-5 text-red-400" />;
      default:
        return <CubeIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-green-400';
      case 'warning':
        return 'text-yellow-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">AI Agents</h1>
        <p className="text-gray-400 mt-1">Monitor individual agent performance and status</p>
      </div>

      {/* Agent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockAgents.map((agent, index) => (
          <motion.div
            key={agent.id}
            className="card p-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <CubeIcon className="w-6 h-6 text-blue-400" />
                <div>
                  <h3 className="text-lg font-semibold text-white">{agent.type}</h3>
                  <p className="text-sm text-gray-400">{agent.id}</p>
                </div>
              </div>
              {getStatusIcon(agent.status)}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Status</span>
                <span className={`text-sm font-medium ${getStatusColor(agent.status)}`}>
                  {agent.status}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Load</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${agent.load * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-white">{Math.round(agent.load * 100)}%</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Performance</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${agent.performance * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-white">{Math.round(agent.performance * 100)}%</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Agent Statistics */}
      <motion.div
        className="card p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <h3 className="text-lg font-semibold text-white mb-4">Agent Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-400">5</p>
            <p className="text-sm text-gray-400">Active Agents</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-400">92%</p>
            <p className="text-sm text-gray-400">Average Performance</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-400">70%</p>
            <p className="text-sm text-gray-400">Average Load</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-400">0</p>
            <p className="text-sm text-gray-400">Failed Agents</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Agents; 