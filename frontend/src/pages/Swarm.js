import React from 'react';
import { motion } from 'framer-motion';
import { useBot } from '../context/BotContext';
import {
  UserGroupIcon,
  ChartBarIcon,
  CogIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const Swarm = () => {
  const { swarm } = useBot();

  const swarmData = [
    { name: 'Active Agents', value: 5, color: '#10B981' },
    { name: 'Idle Agents', value: 3, color: '#6B7280' },
    { name: 'Failed Agents', value: 0, color: '#EF4444' },
    { name: 'Scaling Agents', value: 2, color: '#F59E0B' }
  ];

  const coordinationStrategies = [
    { name: 'Consensus', description: 'All agents must agree on decisions', active: true },
    { name: 'Leader', description: 'Single agent makes final decisions', active: false },
    { name: 'Distributed', description: 'Decentralized decision making', active: false }
  ];

  const swarmMetrics = [
    { label: 'Total Agents', value: '10', color: 'text-blue-400' },
    { label: 'Active Agents', value: '5', color: 'text-green-400' },
    { label: 'Consensus Rate', value: '85%', color: 'text-purple-400' },
    { label: 'Response Time', value: '2.3s', color: 'text-yellow-400' }
  ];

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Swarm Intelligence</h1>
        <p className="text-gray-400 mt-1">Monitor swarm coordination and agent collaboration</p>
      </div>

      {/* Swarm Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {swarmMetrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            className="card p-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div className="text-center">
              <p className={`text-2xl font-bold ${metric.color}`}>{metric.value}</p>
              <p className="text-sm text-gray-400 mt-1">{metric.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agent Distribution */}
        <motion.div
          className="card p-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3 className="text-lg font-semibold text-white mb-4">Agent Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={swarmData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {swarmData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-4">
            {swarmData.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-300">{item.name}</span>
                <span className="text-sm text-white font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Coordination Strategies */}
        <motion.div
          className="card p-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h3 className="text-lg font-semibold text-white mb-4">Coordination Strategies</h3>
          <div className="space-y-4">
            {coordinationStrategies.map((strategy, index) => (
              <div
                key={strategy.name}
                className={`p-4 rounded-lg border ${
                  strategy.active
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-gray-600 bg-gray-800/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">{strategy.name}</h4>
                    <p className="text-sm text-gray-400">{strategy.description}</p>
                  </div>
                  {strategy.active && (
                    <CheckCircleIcon className="w-5 h-5 text-blue-400" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Swarm Performance */}
      <motion.div
        className="card p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h3 className="text-lg font-semibold text-white mb-4">Swarm Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 relative">
              <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#374151"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="3"
                  strokeDasharray="85, 100"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-white">85%</span>
              </div>
            </div>
            <p className="text-sm text-gray-400">Consensus Rate</p>
          </div>

          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 relative">
              <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#374151"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#8B5CF6"
                  strokeWidth="3"
                  strokeDasharray="92, 100"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-white">92%</span>
              </div>
            </div>
            <p className="text-sm text-gray-400">Success Rate</p>
          </div>

          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 relative">
              <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#374151"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="3"
                  strokeDasharray="78, 100"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-white">78%</span>
              </div>
            </div>
            <p className="text-sm text-gray-400">Efficiency</p>
          </div>
        </div>
      </motion.div>

      {/* Swarm Logs */}
      <motion.div
        className="card p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <h3 className="text-lg font-semibold text-white mb-4">Recent Swarm Activity</h3>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {[
            { time: '14:32:15', message: 'Swarm consensus reached on opportunity ETH/USDC', type: 'success' },
            { time: '14:31:42', message: 'Agent arbitrage-1 joined the swarm', type: 'info' },
            { time: '14:30:18', message: 'Load balancing: redistributed workload across agents', type: 'info' },
            { time: '14:29:55', message: 'Agent market-1 detected price anomaly', type: 'warning' },
            { time: '14:28:33', message: 'Swarm coordination strategy updated to consensus', type: 'info' }
          ].map((log, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-gray-800/50 rounded-lg">
              <div className={`w-2 h-2 rounded-full mt-2 ${
                log.type === 'success' ? 'bg-green-400' :
                log.type === 'warning' ? 'bg-yellow-400' : 'bg-blue-400'
              }`} />
              <div className="flex-1">
                <p className="text-white text-sm">{log.message}</p>
                <p className="text-gray-400 text-xs">{log.time}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Swarm; 