import React from 'react';
import { motion } from 'framer-motion';
import { useBot } from '../context/BotContext';
import {
  CurrencyDollarIcon,
  ChartBarIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  CubeIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const Dashboard = () => {
  const { performance, realTimeData, opportunities, isRunning } = useBot();

  const metricCards = [
    {
      title: 'Total Profit',
      value: `$${performance.totalProfit.toLocaleString()}`,
      icon: CurrencyDollarIcon,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10'
    },
    {
      title: 'Success Rate',
      value: `${(performance.successRate * 100).toFixed(1)}%`,
      icon: ChartBarIcon,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'Opportunities',
      value: performance.totalOpportunities.toLocaleString(),
      icon: ArrowTrendingUpIcon,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10'
    },
    {
      title: 'Uptime',
      value: performance.uptime,
      icon: ClockIcon,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10'
    }
  ];

  // Mock chart data
  const chartData = [
    { time: '00:00', profit: 0, opportunities: 0 },
    { time: '02:00', profit: 150, opportunities: 5 },
    { time: '04:00', profit: 320, opportunities: 12 },
    { time: '06:00', profit: 480, opportunities: 18 },
    { time: '08:00', profit: 650, opportunities: 25 },
    { time: '10:00', profit: 820, opportunities: 32 },
    { time: '12:00', profit: 1100, opportunities: 45 },
    { time: '14:00', profit: 1350, opportunities: 58 },
    { time: '16:00', profit: 1500, opportunities: 85 }
  ];

  const recentOpportunities = opportunities.slice(0, 5);

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
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">JuliaOS Arbitrage Swarm Bot Overview</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${isRunning ? 'bg-green-400' : 'bg-red-400'}`} />
          <span className="text-sm text-gray-300">
            {isRunning ? 'Bot Running' : 'Bot Stopped'}
          </span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((card, index) => (
          <motion.div
            key={card.title}
            className={`card card-hover p-6 ${card.bgColor}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">{card.title}</p>
                <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
              </div>
              <card.icon className={`w-8 h-8 ${card.color}`} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profit Chart */}
        <motion.div
          className="card p-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3 className="text-lg font-semibold text-white mb-4">Profit Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
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
              <Area
                type="monotone"
                dataKey="profit"
                stroke="#10B981"
                fill="#10B981"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Opportunities Chart */}
        <motion.div
          className="card p-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h3 className="text-lg font-semibold text-white mb-4">Opportunities Detected</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
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
                dataKey="opportunities"
                stroke="#8B5CF6"
                strokeWidth={2}
                dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Recent Opportunities */}
      <motion.div
        className="card p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h3 className="text-lg font-semibold text-white mb-4">Recent Opportunities</h3>
        <div className="space-y-3">
          {recentOpportunities.length > 0 ? (
            recentOpportunities.map((opportunity, index) => (
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
                    +${opportunity.estimated_profit}
                  </p>
                  <p className="text-sm text-gray-400">
                    {opportunity.profit_percentage}% profit
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-400">
              <CubeIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No opportunities detected yet</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* System Status */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <div className="card p-4">
          <div className="flex items-center space-x-3">
            <CubeIcon className="w-6 h-6 text-blue-400" />
            <div>
              <p className="text-sm text-gray-400">Active Agents</p>
              <p className="text-white font-semibold">5/10</p>
            </div>
          </div>
        </div>
        
        <div className="card p-4">
          <div className="flex items-center space-x-3">
            <UserGroupIcon className="w-6 h-6 text-purple-400" />
            <div>
              <p className="text-sm text-gray-400">Swarm Status</p>
              <p className="text-white font-semibold">Consensus</p>
            </div>
          </div>
        </div>
        
        <div className="card p-4">
          <div className="flex items-center space-x-3">
            <ArrowTrendingUpIcon className="w-6 h-6 text-green-400" />
            <div>
              <p className="text-sm text-gray-400">Current Load</p>
              <p className="text-white font-semibold">75%</p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard; 