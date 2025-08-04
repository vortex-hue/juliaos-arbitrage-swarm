import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Monitoring from './pages/Monitoring';
import Configuration from './pages/Configuration';
import Agents from './pages/Agents';
import Swarm from './pages/Swarm';
import Logs from './pages/Logs';
import { BotProvider } from './context/BotContext';

function App() {
  return (
    <BotProvider>
      <div className="flex h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <Sidebar />
        <motion.main 
          className="flex-1 overflow-hidden"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="h-full overflow-y-auto p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/monitoring" element={<Monitoring />} />
              <Route path="/configuration" element={<Configuration />} />
              <Route path="/agents" element={<Agents />} />
              <Route path="/swarm" element={<Swarm />} />
              <Route path="/logs" element={<Logs />} />
            </Routes>
          </div>
        </motion.main>
      </div>
    </BotProvider>
  );
}

export default App; 