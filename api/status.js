export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    // Mock bot status data
    const status = {
      isRunning: false,
      performance: {
        totalOpportunities: 100,
        successfulTrades: 85,
        successRate: 0.85,
        totalProfit: 1500,
        opportunitiesPerHour: 45.5,
        uptime: "2h 15m 30s"
      },
      swarm: {
        totalAgents: 10,
        activeAgents: 5,
        coordinationStrategy: "consensus",
        consensusThreshold: 0.7
      }
    };

    res.status(200).json(status);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 