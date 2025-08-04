import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useBot } from '../context/BotContext';
import {
  PlayIcon,
  StopIcon,
  ChartBarIcon,
  ClockIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const Monitoring = () => {
  const { isRunning, realTimeData, opportunities, logs } = useBot();
  const [timeData, setTimeData] = useState([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1h');

  useEffect(() => {
    // Generate mock time series data
    const generateTimeData = () => {
      const data = [];
      const now = new Date();
      for (let i = 59; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60000);
        data.push({
          time: time.toLocaleTimeString(),
          profit: Math.random() * 100 + 1400,
          opportunities: Math.floor(Math.random() * 10) + 1,
          volume: Math.random() * 1000 + 500
        });
      }
      return data;
    };

    setTimeData(generateTimeData());
  }, []);

  const timeframes = [
    { label: '1 Hour', value: '1h' },
    { label: '6 Hours', value: '6h' },
    { label: '24 Hours', value: '24h' },
    { label: '7 Days', value: '7d' }
  ];

  const recentLogs = logs.slice(0, 10);

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Real-Time Monitoring</h1>
          <p className="text-gray-400 mt-1">Live performance tracking and analytics</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isRunning ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className="text-sm text-gray-300">
              {isRunning ? 'Live' : 'Paused'}
            </span>
          </div>
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
          >
            {timeframes.map(tf => (
              <option key={tf.value} value={tf.value}>{tf.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          className="card p-6 bg-green-500/10"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Current Profit</p>
              <p className="text-2xl font-bold text-green-400">
                ${realTimeData.lastProfit?.toFixed(2) || '0.00'}
              </p>
            </div>
            <CurrencyDollarIcon className="w-8 h-8 text-green-400" />
          </div>
        </motion.div>

        <motion.div
          className="card p-6 bg-blue-500/10"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Active Opportunities</p>
              <p className="text-2xl font-bold text-blue-400">
                {realTimeData.currentOpportunities || 0}
              </p>
            </div>
            <ChartBarIcon className="w-8 h-8 text-blue-400" />
          </div>
        </motion.div>

        <motion.div
          className="card p-6 bg-purple-500/10"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Active Chains</p>
              <p className="text-2xl font-bold text-purple-400">
                {realTimeData.activeChains?.length || 0}
              </p>
            </div>
            <ClockIcon className="w-8 h-8 text-purple-400" />
          </div>
        </motion.div>

        <motion.div
          className="card p-6 bg-yellow-500/10"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Active Exchanges</p>
              <p className="text-2xl font-bold text-yellow-400">
                {realTimeData.activeExchanges?.length || 0}
              </p>
            </div>
            <ChartBarIcon className="w-8 h-8 text-yellow-400" />
          </div>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profit Over Time */}
        <motion.div
          className="card p-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3 className="text-lg font-semibold text-white mb-4">Profit Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Line
                type="monotone"
                dataKey="profit"
                stroke="#10B981"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Opportunities Volume */}
        <motion.div
          className="card p-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h3 className="text-lg font-semibold text-white mb-4">Opportunities Volume</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={timeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="opportunities" fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Opportunities */}
        <motion.div
          className="card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h3 className="text-lg font-semibold text-white mb-4">Recent Opportunities</h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {opportunities.slice(0, 5).map((opportunity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  <div>
                    <p className="text-white font-medium">
                      {opportunity.token} on {opportunity.source_exchange}
                    </p>
                    <p className="text-sm text-gray-400">
                      {opportunity.source_chain} → {opportunity.target_chain}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-semibold">
                    +${opportunity.estimated_profit?.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-400">
                    {opportunity.profit_percentage?.toFixed(2)}% profit
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Logs */}
        <motion.div
          className="card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h3 className="text-lg font-semibold text-white mb-4">Recent Logs</h3>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {recentLogs.map((log, index) => (
              <div key={index} className="flex items-start space-x-3 p-2 rounded">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  log.level === 'ERROR' ? 'bg-red-400' :
                  log.level === 'WARNING' ? 'bg-yellow-400' : 'bg-green-400'
                }`} />
                <div className="flex-1">
                  <p className="text-white text-sm">{log.message}</p>
                  <p className="text-gray-400 text-xs">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Monitoring; 