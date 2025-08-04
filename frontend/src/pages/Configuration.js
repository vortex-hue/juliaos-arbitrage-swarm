import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useBot } from '../context/BotContext';
import { toast } from 'react-hot-toast';
import {
  CogIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

const Configuration = () => {
  const { configuration, updateConfiguration } = useBot();
  const [formData, setFormData] = useState(configuration || {});
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateConfiguration(formData);
      toast.success('Configuration saved successfully!');
    } catch (error) {
      toast.error('Failed to save configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (section, key, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

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
          <h1 className="text-3xl font-bold text-white">Configuration</h1>
          <p className="text-gray-400 mt-1">Manage bot settings and parameters</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-6 py-2 rounded-lg text-white font-medium transition-colors"
        >
          {isSaving ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Arbitrage Agent Settings */}
        <motion.div
          className="card p-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex items-center space-x-3 mb-6">
            <CurrencyDollarIcon className="w-6 h-6 text-green-400" />
            <h3 className="text-lg font-semibold text-white">Arbitrage Agent</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Exchanges
              </label>
              <input
                type="text"
                value={formData.arbitrage_agent?.exchanges?.join(', ') || ''}
                onChange={(e) => handleInputChange('arbitrage_agent', 'exchanges', e.target.value.split(', '))}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
                placeholder="uniswap, sushiswap, pancakeswap"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Chains
              </label>
              <input
                type="text"
                value={formData.arbitrage_agent?.chains?.join(', ') || ''}
                onChange={(e) => handleInputChange('arbitrage_agent', 'chains', e.target.value.split(', '))}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
                placeholder="ethereum, bsc, polygon"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Minimum Profit Threshold (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.arbitrage_agent?.min_profit_threshold || 0.5}
                onChange={(e) => handleInputChange('arbitrage_agent', 'min_profit_threshold', parseFloat(e.target.value))}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Maximum Risk Score
              </label>
              <input
                type="number"
                step="1"
                value={formData.arbitrage_agent?.max_risk_score || 70}
                onChange={(e) => handleInputChange('arbitrage_agent', 'max_risk_score', parseFloat(e.target.value))}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
              />
            </div>
          </div>
        </motion.div>

        {/* Agent Swarm Settings */}
        <motion.div
          className="card p-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center space-x-3 mb-6">
            <GlobeAltIcon className="w-6 h-6 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Agent Swarm</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Maximum Agents
              </label>
              <input
                type="number"
                value={formData.agent_swarm?.max_agents || 10}
                onChange={(e) => handleInputChange('agent_swarm', 'max_agents', parseInt(e.target.value))}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Coordination Strategy
              </label>
              <select
                value={formData.agent_swarm?.coordination_strategy || 'consensus'}
                onChange={(e) => handleInputChange('agent_swarm', 'coordination_strategy', e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
              >
                <option value="consensus">Consensus</option>
                <option value="leader">Leader</option>
                <option value="distributed">Distributed</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Consensus Threshold
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="1"
                value={formData.agent_swarm?.consensus_threshold || 0.7}
                onChange={(e) => handleInputChange('agent_swarm', 'consensus_threshold', parseFloat(e.target.value))}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
              />
            </div>
          </div>
        </motion.div>

        {/* Cross-Chain Bridge Settings */}
        <motion.div
          className="card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex items-center space-x-3 mb-6">
            <ShieldCheckIcon className="w-6 h-6 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Cross-Chain Bridge</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="gas_optimization"
                checked={formData.cross_chain_bridge?.gas_optimization || false}
                onChange={(e) => handleInputChange('cross_chain_bridge', 'gas_optimization', e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded"
              />
              <label htmlFor="gas_optimization" className="text-sm font-medium text-gray-300">
                Enable Gas Optimization
              </label>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Slippage Tolerance (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.cross_chain_bridge?.slippage_tolerance || 1.0}
                onChange={(e) => handleInputChange('cross_chain_bridge', 'slippage_tolerance', parseFloat(e.target.value))}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Max Retries
              </label>
              <input
                type="number"
                value={formData.cross_chain_bridge?.max_retries || 3}
                onChange={(e) => handleInputChange('cross_chain_bridge', 'max_retries', parseInt(e.target.value))}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
              />
            </div>
          </div>
        </motion.div>

        {/* Wallet Configuration */}
        <motion.div
          className="card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="flex items-center space-x-3 mb-6">
            <CogIcon className="w-6 h-6 text-yellow-400" />
            <h3 className="text-lg font-semibold text-white">Wallet Settings</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Wallet Address
              </label>
              <input
                type="text"
                value={formData.wallet?.address || ''}
                onChange={(e) => handleInputChange('wallet', 'address', e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
                placeholder="0x..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Private Key (Encrypted)
              </label>
              <input
                type="password"
                value={formData.wallet?.private_key || ''}
                onChange={(e) => handleInputChange('wallet', 'private_key', e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
                placeholder="••••••••"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Configuration; 