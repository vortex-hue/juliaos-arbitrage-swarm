import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HomeIcon,
  ChartBarIcon,
  CogIcon,
  CubeIcon,
  UserGroupIcon,
  DocumentTextIcon,
  PlayIcon,
  StopIcon
} from '@heroicons/react/24/outline';
import { useBot } from '../context/BotContext';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Monitoring', href: '/monitoring', icon: ChartBarIcon },
  { name: 'Configuration', href: '/configuration', icon: CogIcon },
  { name: 'Agents', href: '/agents', icon: CubeIcon },
  { name: 'Swarm', href: '/swarm', icon: UserGroupIcon },
  { name: 'Logs', href: '/logs', icon: DocumentTextIcon },
];

const Sidebar = () => {
  const location = useLocation();
  const { isRunning, startBot, stopBot } = useBot();

  const handleBotToggle = async () => {
    try {
      if (isRunning) {
        await stopBot();
      } else {
        await startBot();
      }
    } catch (error) {
      console.error('Failed to toggle bot:', error);
    }
  };

  return (
    <motion.div
      className="w-64 bg-gray-900/50 backdrop-blur-xl border-r border-gray-700/50"
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 px-4 border-b border-gray-700/50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">J</span>
            </div>
            <div>
              <h1 className="text-white font-semibold text-lg">JuliaOS</h1>
              <p className="text-gray-400 text-xs">Arbitrage Bot</p>
            </div>
          </div>
        </div>

        {/* Bot Control */}
        <div className="p-4 border-b border-gray-700/50">
          <button
            onClick={handleBotToggle}
            className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
              isRunning
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isRunning ? (
              <>
                <StopIcon className="w-5 h-5" />
                <span>Stop Bot</span>
              </>
            ) : (
              <>
                <PlayIcon className="w-5 h-5" />
                <span>Start Bot</span>
              </>
            )}
          </button>
          
          <div className="mt-3 flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className="text-sm text-gray-300">
              {isRunning ? 'Running' : 'Stopped'}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700/50">
          <div className="text-xs text-gray-400 text-center">
            <p>JuliaOS v1.0.0</p>
            <p className="mt-1">Advanced AI Trading</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Sidebar; 