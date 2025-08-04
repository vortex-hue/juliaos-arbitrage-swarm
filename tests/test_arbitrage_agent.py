"""
Tests for Arbitrage Agent functionality

This module contains comprehensive tests for the arbitrage agent,
including opportunity detection, LLM analysis, and execution logic.
"""

import pytest
import asyncio
from unittest.mock import Mock, patch, AsyncMock
import sys
import os

# Add src to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from agents.ArbitrageAgent import ArbitrageAgent, ArbitrageOpportunity

class TestArbitrageAgent:
    """Test suite for ArbitrageAgent class"""
    
    @pytest.fixture
    def mock_config(self):
        """Mock configuration for testing"""
        return {
            "exchanges": ["uniswap", "sushiswap", "pancakeswap"],
            "chains": ["ethereum", "bsc", "polygon"],
            "min_profit_threshold": 0.5,
            "max_risk_score": 70.0,
            "monitoring_interval": 30,
            "max_position_size": 0.1,
            "llm_provider": "gpt-4",
            "wallet_address": "0x1234567890123456789012345678901234567890"
        }
    
    @pytest.fixture
    def mock_agent(self, mock_config):
        """Create a mock arbitrage agent"""
        with patch('agents.ArbitrageAgent.JuliaOS') as mock_juliaos:
            mock_juliaos.get_llm_provider.return_value = Mock()
            agent = ArbitrageAgent(mock_config)
            return agent
    
    @pytest.fixture
    def sample_opportunity(self):
        """Sample arbitrage opportunity for testing"""
        return ArbitrageOpportunity(
            source_exchange="uniswap",
            target_exchange="sushiswap",
            source_chain="ethereum",
            target_chain="ethereum",
            token="USDC",
            source_price=1.00,
            target_price=1.02,
            profit_percentage=2.0,
            estimated_profit=20.0,
            risk_score=30.0,
            timestamp="2023-01-01T00:00:00"
        )
    
    def test_agent_initialization(self, mock_agent, mock_config):
        """Test agent initialization with configuration"""
        assert mock_agent.id.startswith("arbitrage-agent-")
        assert mock_agent.exchanges == mock_config["exchanges"]
        assert mock_agent.chains == mock_config["chains"]
        assert mock_agent.min_profit_threshold == mock_config["min_profit_threshold"]
        assert mock_agent.max_risk_score == mock_config["max_risk_score"]
        assert mock_agent.performance_metrics["total_opportunities"] == 0
        assert mock_agent.performance_metrics["successful_trades"] == 0
    
    @patch('agents.ArbitrageAgent.JuliaOS')
    def test_initialize_agent(self, mock_juliaos, mock_agent):
        """Test agent initialization with JuliaOS framework"""
        mock_juliaos.register_agent.return_value = None
        mock_juliaos.get_price_feed.return_value = {}
        
        # Test initialization
        mock_agent.initialize_agent()
        
        # Verify JuliaOS calls
        mock_juliaos.register_agent.assert_called_once_with(mock_agent)
    
    @patch('agents.ArbitrageAgent.JuliaOS')
    def test_collect_market_data(self, mock_juliaos, mock_agent):
        """Test market data collection from multiple exchanges"""
        # Mock price feed responses
        mock_juliaos.get_price_feed.side_effect = [
            {"USDC": {"price": 1.00}, "ETH": {"price": 2000.0}},
            {"USDC": {"price": 1.01}, "ETH": {"price": 2005.0}},
            {"USDC": {"price": 0.99}, "ETH": {"price": 1995.0}}
        ]
        
        market_data = mock_agent.collect_market_data()
        
        # Verify data collection
        assert len(market_data) > 0
        assert "uniswap_ethereum" in market_data
        assert "sushiswap_ethereum" in market_data
        assert "pancakeswap_ethereum" in market_data
    
    def test_detect_arbitrage_opportunities(self, mock_agent):
        """Test arbitrage opportunity detection"""
        # Mock market data
        market_data = {
            "uniswap_ethereum": {"USDC": {"price": 1.00}},
            "sushiswap_ethereum": {"USDC": {"price": 1.02}},
            "pancakeswap_ethereum": {"USDC": {"price": 0.99}}
        }
        
        opportunities = mock_agent.detect_arbitrage_opportunities(market_data)
        
        # Verify opportunities detected
        assert len(opportunities) > 0
        for opportunity in opportunities:
            assert opportunity.profit_percentage >= mock_agent.min_profit_threshold
            assert opportunity.source_exchange != opportunity.target_exchange
    
    @patch('agents.ArbitrageAgent.JuliaOS')
    def test_analyze_with_llm(self, mock_juliaos, mock_agent, sample_opportunity):
        """Test LLM analysis of arbitrage opportunities"""
        # Mock LLM response
        mock_response = '''
        {
            "risk_score": 25.0,
            "recommendation": "execute",
            "confidence": 0.85,
            "reasoning": "Good liquidity and low risk"
        }
        '''
        mock_juliaos.agent.useLLM.return_value = mock_response
        
        opportunities = [sample_opportunity]
        analyzed_opportunities = mock_agent.analyze_with_llm(opportunities)
        
        # Verify LLM analysis
        assert len(analyzed_opportunities) == 1
        assert analyzed_opportunities[0].risk_score == 25.0
    
    def test_filter_opportunities(self, mock_agent):
        """Test opportunity filtering based on criteria"""
        # Create test opportunities
        opportunities = [
            ArbitrageOpportunity(
                source_exchange="uniswap",
                target_exchange="sushiswap",
                source_chain="ethereum",
                target_chain="ethereum",
                token="USDC",
                source_price=1.00,
                target_price=1.02,
                profit_percentage=2.0,
                estimated_profit=20.0,
                risk_score=30.0,
                timestamp="2023-01-01T00:00:00"
            ),
            ArbitrageOpportunity(
                source_exchange="pancakeswap",
                target_exchange="uniswap",
                source_chain="bsc",
                target_chain="ethereum",
                token="ETH",
                source_price=2000.0,
                target_price=2100.0,
                profit_percentage=0.3,
                estimated_profit=100.0,
                risk_score=80.0,
                timestamp="2023-01-01T00:00:00"
            )
        ]
        
        filtered_opportunities = mock_agent.filter_opportunities(opportunities)
        
        # Verify filtering
        assert len(filtered_opportunities) == 1  # Only first opportunity should pass
        assert filtered_opportunities[0].profit_percentage >= mock_agent.min_profit_threshold
        assert filtered_opportunities[0].risk_score <= mock_agent.max_risk_score
    
    @patch('agents.ArbitrageAgent.JuliaOS')
    def test_execute_arbitrage(self, mock_juliaos, mock_agent, sample_opportunity):
        """Test arbitrage execution"""
        # Mock successful execution
        mock_juliaos.bridge.transfer.return_value = {"success": True, "tx_hash": "0x123"}
        mock_juliaos.dex.execute_trade.return_value = {"success": True, "tx_hash": "0x456"}
        
        initial_opportunities = mock_agent.performance_metrics["total_opportunities"]
        initial_trades = mock_agent.performance_metrics["successful_trades"]
        
        mock_agent.execute_arbitrage(sample_opportunity)
        
        # Verify metrics updated
        assert mock_agent.performance_metrics["total_opportunities"] == initial_opportunities + 1
        assert mock_agent.performance_metrics["successful_trades"] == initial_trades + 1
    
    def test_calculate_estimated_profit(self, mock_agent):
        """Test profit calculation with fees"""
        token = "USDC"
        source_price = 1.00
        target_price = 1.02
        
        estimated_profit = mock_agent.calculate_estimated_profit(token, source_price, target_price)
        
        # Verify profit calculation
        assert estimated_profit > 0
        assert estimated_profit < (target_price - source_price) * 1000  # After fees
    
    def test_calculate_optimal_amount(self, mock_agent, sample_opportunity):
        """Test optimal trade amount calculation"""
        optimal_amount = mock_agent.calculate_optimal_amount(sample_opportunity)
        
        # Verify amount calculation
        assert optimal_amount > 0
        assert optimal_amount <= 10000.0 * mock_agent.config["max_position_size"]
    
    def test_prepare_llm_context(self, mock_agent, sample_opportunity):
        """Test LLM context preparation"""
        context = mock_agent.prepare_llm_context(sample_opportunity)
        
        # Verify context includes all necessary information
        assert "Arbitrage Opportunity Analysis" in context
        assert sample_opportunity.token in context
        assert sample_opportunity.source_exchange in context
        assert sample_opportunity.target_exchange in context
        assert str(sample_opportunity.profit_percentage) in context
    
    def test_update_performance_metrics(self, mock_agent):
        """Test performance metrics update"""
        initial_uptime = mock_agent.performance_metrics.get("uptime", None)
        
        mock_agent.update_performance_metrics()
        
        # Verify metrics updated
        assert "uptime" in mock_agent.performance_metrics
        assert "opportunities_per_hour" in mock_agent.performance_metrics
    
    @patch('agents.ArbitrageAgent.JuliaOS')
    def test_initialize_price_monitoring(self, mock_juliaos, mock_agent):
        """Test price monitoring initialization"""
        mock_juliaos.price_feed.connect.return_value = None
        
        mock_agent.initialize_price_monitoring()
        
        # Verify price feed connections
        expected_calls = len(mock_agent.exchanges) * len(mock_agent.chains)
        assert mock_juliaos.price_feed.connect.call_count == expected_calls
    
    def test_opportunity_validation(self, mock_agent):
        """Test opportunity validation logic"""
        # Valid opportunity
        valid_opportunity = ArbitrageOpportunity(
            source_exchange="uniswap",
            target_exchange="sushiswap",
            source_chain="ethereum",
            target_chain="ethereum",
            token="USDC",
            source_price=1.00,
            target_price=1.02,
            profit_percentage=2.0,
            estimated_profit=20.0,
            risk_score=30.0,
            timestamp="2023-01-01T00:00:00"
        )
        
        # Should be valid
        assert valid_opportunity.profit_percentage >= mock_agent.min_profit_threshold
        assert valid_opportunity.risk_score <= mock_agent.max_risk_score
    
    def test_error_handling(self, mock_agent):
        """Test error handling in agent operations"""
        # Test with invalid market data
        invalid_market_data = {}
        
        opportunities = mock_agent.detect_arbitrage_opportunities(invalid_market_data)
        
        # Should handle gracefully
        assert isinstance(opportunities, list)
        assert len(opportunities) == 0
    
    @pytest.mark.asyncio
    async def test_async_operations(self, mock_agent):
        """Test asynchronous operations"""
        # Mock async operations
        with patch('agents.ArbitrageAgent.start_monitoring_loop') as mock_loop:
            mock_agent.initialize_agent()
            
            # Verify async loop started
            mock_loop.assert_called_once()

class TestArbitrageOpportunity:
    """Test suite for ArbitrageOpportunity struct"""
    
    def test_opportunity_creation(self):
        """Test arbitrage opportunity creation"""
        opportunity = ArbitrageOpportunity(
            source_exchange="uniswap",
            target_exchange="sushiswap",
            source_chain="ethereum",
            target_chain="ethereum",
            token="USDC",
            source_price=1.00,
            target_price=1.02,
            profit_percentage=2.0,
            estimated_profit=20.0,
            risk_score=30.0,
            timestamp="2023-01-01T00:00:00"
        )
        
        assert opportunity.source_exchange == "uniswap"
        assert opportunity.target_exchange == "sushiswap"
        assert opportunity.token == "USDC"
        assert opportunity.profit_percentage == 2.0
        assert opportunity.estimated_profit == 20.0
        assert opportunity.risk_score == 30.0
    
    def test_opportunity_comparison(self):
        """Test opportunity comparison for sorting"""
        opportunity1 = ArbitrageOpportunity(
            source_exchange="uniswap",
            target_exchange="sushiswap",
            source_chain="ethereum",
            target_chain="ethereum",
            token="USDC",
            source_price=1.00,
            target_price=1.02,
            profit_percentage=2.0,
            estimated_profit=20.0,
            risk_score=30.0,
            timestamp="2023-01-01T00:00:00"
        )
        
        opportunity2 = ArbitrageOpportunity(
            source_exchange="pancakeswap",
            target_exchange="uniswap",
            source_chain="bsc",
            target_chain="ethereum",
            token="ETH",
            source_price=2000.0,
            target_price=2100.0,
            profit_percentage=5.0,
            estimated_profit=100.0,
            risk_score=20.0,
            timestamp="2023-01-01T00:00:00"
        )
        
        # Test sorting by profit/risk ratio
        opportunities = [opportunity1, opportunity2]
        sorted_opportunities = sorted(opportunities, 
                                   key=lambda opp: opp.profit_percentage / (opp.risk_score + 1),
                                   reverse=True)
        
        assert sorted_opportunities[0].profit_percentage == 5.0  # Higher profit/risk ratio

if __name__ == "__main__":
    pytest.main([__file__]) 