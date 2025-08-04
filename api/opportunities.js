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
    // Mock opportunities data
    const opportunities = [
      {
        id: "opp-1",
        token: "ETH/USDC",
        source_exchange: "Uniswap",
        target_exchange: "SushiSwap",
        source_chain: "Ethereum",
        target_chain: "Ethereum",
        estimated_profit: 25.50,
        profit_percentage: 2.1,
        timestamp: "2024-01-15T14:30:15Z",
        status: "detected"
      },
      {
        id: "opp-2",
        token: "USDC/USDT",
        source_exchange: "Curve",
        target_exchange: "Balancer",
        source_chain: "Polygon",
        target_chain: "Ethereum",
        estimated_profit: 15.75,
        profit_percentage: 1.8,
        timestamp: "2024-01-15T14:30:20Z",
        status: "executed"
      },
      {
        id: "opp-3",
        token: "WBTC/ETH",
        source_exchange: "PancakeSwap",
        target_exchange: "Uniswap",
        source_chain: "BSC",
        target_chain: "Ethereum",
        estimated_profit: 45.20,
        profit_percentage: 3.2,
        timestamp: "2024-01-15T14:30:25Z",
        status: "detected"
      },
      {
        id: "opp-4",
        token: "MATIC/USDC",
        source_exchange: "SushiSwap",
        target_exchange: "Curve",
        source_chain: "Polygon",
        target_chain: "Polygon",
        estimated_profit: 8.90,
        profit_percentage: 1.5,
        timestamp: "2024-01-15T14:30:30Z",
        status: "failed"
      },
      {
        id: "opp-5",
        token: "LINK/ETH",
        source_exchange: "Uniswap",
        target_exchange: "SushiSwap",
        source_chain: "Ethereum",
        target_chain: "Ethereum",
        estimated_profit: 32.10,
        profit_percentage: 2.8,
        timestamp: "2024-01-15T14:30:35Z",
        status: "detected"
      }
    ];

    res.status(200).json(opportunities);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 