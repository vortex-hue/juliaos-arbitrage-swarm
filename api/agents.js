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
    // Mock agents data
    const agents = [
      {
        id: "agent-1",
        type: "Market Analysis",
        status: "active",
        load: 85,
        performance: 92,
        lastActivity: "2024-01-15T14:30:15Z"
      },
      {
        id: "agent-2",
        type: "Arbitrage Detection",
        status: "active",
        load: 78,
        performance: 88,
        lastActivity: "2024-01-15T14:30:20Z"
      },
      {
        id: "agent-3",
        type: "Risk Assessment",
        status: "active",
        load: 65,
        performance: 95,
        lastActivity: "2024-01-15T14:30:25Z"
      },
      {
        id: "agent-4",
        type: "Execution",
        status: "idle",
        load: 45,
        performance: 87,
        lastActivity: "2024-01-15T14:30:30Z"
      },
      {
        id: "agent-5",
        type: "Portfolio Manager",
        status: "active",
        load: 72,
        performance: 91,
        lastActivity: "2024-01-15T14:30:35Z"
      }
    ];

    res.status(200).json(agents);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 