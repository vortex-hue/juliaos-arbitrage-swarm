import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useBot } from '../context/BotContext';
import {
  DocumentTextIcon,
  FunnelIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const Logs = () => {
  const { logs } = useBot();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const logLevels = [
    { value: 'all', label: 'All', color: 'text-gray-400' },
    { value: 'INFO', label: 'Info', color: 'text-blue-400' },
    { value: 'WARNING', label: 'Warning', color: 'text-yellow-400' },
    { value: 'ERROR', label: 'Error', color: 'text-red-400' }
  ];

  const getLevelIcon = (level) => {
    switch (level) {
      case 'ERROR':
        return <ExclamationTriangleIcon className="w-4 h-4 text-red-400" />;
      case 'WARNING':
        return <ExclamationTriangleIcon className="w-4 h-4 text-yellow-400" />;
      case 'INFO':
        return <InformationCircleIcon className="w-4 h-4 text-blue-400" />;
      default:
        return <CheckCircleIcon className="w-4 h-4 text-green-400" />;
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'ERROR':
        return 'text-red-400';
      case 'WARNING':
        return 'text-yellow-400';
      case 'INFO':
        return 'text-blue-400';
      default:
        return 'text-green-400';
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesFilter = filter === 'all' || log.level === filter;
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const mockLogs = [
    { id: 1, level: 'INFO', message: 'Bot started successfully', timestamp: '2024-01-15T14:30:15Z' },
    { id: 2, level: 'INFO', message: 'Connected to price feeds', timestamp: '2024-01-15T14:30:20Z' },
    { id: 3, level: 'INFO', message: 'Detected arbitrage opportunity', timestamp: '2024-01-15T14:30:25Z' },
    { id: 4, level: 'WARNING', message: 'High gas fees detected', timestamp: '2024-01-15T14:30:30Z' },
    { id: 5, level: 'INFO', message: 'Executed trade successfully', timestamp: '2024-01-15T14:30:35Z' },
    { id: 6, level: 'ERROR', message: 'Bridge transfer failed', timestamp: '2024-01-15T14:30:40Z' },
    { id: 7, level: 'INFO', message: 'Profit: $25.50', timestamp: '2024-01-15T14:30:45Z' },
    { id: 8, level: 'INFO', message: 'Agent performance updated', timestamp: '2024-01-15T14:30:50Z' },
    { id: 9, level: 'WARNING', message: 'Low liquidity detected', timestamp: '2024-01-15T14:30:55Z' },
    { id: 10, level: 'INFO', message: 'Swarm consensus reached', timestamp: '2024-01-15T14:31:00Z' }
  ];

  const allLogs = [...logs, ...mockLogs];

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
          <h1 className="text-3xl font-bold text-white">System Logs</h1>
          <p className="text-gray-400 mt-1">Monitor bot activity and debug issues</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <DocumentTextIcon className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-300">
              {allLogs.length} entries
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <motion.div
        className="card p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Search Logs
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search log messages..."
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Log Level
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
            >
              {logLevels.map(level => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Log Entries */}
      <motion.div
        className="card p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Log Entries</h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full" />
              <span className="text-xs text-gray-400">Info</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full" />
              <span className="text-xs text-gray-400">Warning</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-400 rounded-full" />
              <span className="text-xs text-gray-400">Error</span>
            </div>
          </div>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log, index) => (
              <motion.div
                key={log.id || index}
                className="flex items-start space-x-3 p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <div className="flex-shrink-0 mt-1">
                  {getLevelIcon(log.level)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-white text-sm">{log.message}</p>
                    <span className={`text-xs font-medium ${getLevelColor(log.level)}`}>
                      {log.level}
                    </span>
                  </div>
                  <p className="text-gray-400 text-xs mt-1">
                    {new Date(log.timestamp).toLocaleString()}
                  </p>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-400">
              <DocumentTextIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No logs found matching the current filters</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Log Statistics */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-blue-400">
            {allLogs.filter(log => log.level === 'INFO').length}
          </p>
          <p className="text-sm text-gray-400">Info Logs</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-yellow-400">
            {allLogs.filter(log => log.level === 'WARNING').length}
          </p>
          <p className="text-sm text-gray-400">Warnings</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-red-400">
            {allLogs.filter(log => log.level === 'ERROR').length}
          </p>
          <p className="text-sm text-gray-400">Errors</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-green-400">
            {allLogs.length}
          </p>
          <p className="text-sm text-gray-400">Total Logs</p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Logs; 