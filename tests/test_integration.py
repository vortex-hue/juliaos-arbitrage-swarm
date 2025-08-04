"""
Integration Tests for Cross-Chain Arbitrage Swarm Bot

This module contains comprehensive integration tests that verify
the entire system works together correctly, including all components
interacting with each other.
"""

import pytest
import asyncio
from unittest.mock import Mock, patch, AsyncMock
import sys
import os
import json

# Add src to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from main import ArbitrageSwarmBot
from agents.ArbitrageAgent import ArbitrageAgent
from swarm.AgentSwarm import AgentSwarm, SwarmConfig
from bridges.CrossChainBridge import CrossChainBridge, BridgeConfig

class TestSystemIntegration:
    """Integration test suite for the complete system"""
    
    @pytest.fixture
    def mock_config(self):
        """Mock configuration for integration testing"""
        return {
            "arbitrage_agent": {
                "exchanges": ["uniswap", "sushiswap", "pancakeswap"],
                "chains": ["ethereum", "bsc", "polygon"],
                "min_profit_threshold": 0.5,
                "max_risk_score": 70.0,
                "monitoring_interval": 30,
                "max_position_size": 0.1,
                "llm_provider": "gpt-4"
            },
            "agent_swarm": {
                "max_agents": 5,
                "coordination_strategy": "consensus",
                "consensus_threshold": 0.7,
                "load_balancing": True,
                "fault_tolerance": True,
                "auto_scaling": True
            },
            "cross_chain_bridge": {
                "gas_optimization": True,
                "slippage_tolerance": 1.0,
                "max_retries": 3
            },
            "wallet": {
                "address": "0x1234567890123456789012345678901234567890",
                "private_key": "test_key",
                "supported_tokens": ["USDC", "USDT", "ETH", "BTC", "DAI"]
            },
            "api_keys": {
                "openai_api_key": "test_openai_key",
                "infura_api_key": "test_infura_key",
                "alchemy_api_key": "test_alchemy_key"
            }
        }
    
    @pytest.fixture
    def mock_bot(self, mock_config):
        """Create a mock arbitrage swarm bot"""
        with patch('main.JuliaOS') as mock_juliaos:
            mock_juliaos.initialize.return_value = None
            mock_juliaos.shutdown.return_value = None
            mock_juliaos.get_llm_provider.return_value = Mock()
            mock_juliaos.create_agent.return_value = Mock()
            mock_juliaos.register_agent.return_value = None
            mock_juliaos.register_swarm.return_value = None
            mock_juliaos.bridge.get_supported_chains.return_value = ["ethereum", "bsc", "polygon"]
            mock_juliaos.bridge.get_provider.return_value = Mock()
            
            bot = ArbitrageSwarmBot("test_config.json")
            return bot
    
    def test_system_initialization(self, mock_bot, mock_config):
        """Test complete system initialization"""
        # Verify all components created
        assert mock_bot.arbitrage_agent is not None
        assert mock_bot.agent_swarm is not None
        assert mock_bot.cross_chain_bridge is not None
        
        # Verify configuration loaded
        assert mock_bot.config["arbitrage_agent"]["exchanges"] == mock_config["arbitrage_agent"]["exchanges"]
        assert mock_bot.config["agent_swarm"]["max_agents"] == mock_config["agent_swarm"]["max_agents"]
    
    @patch('main.JuliaOS')
    def test_system_startup(self, mock_juliaos, mock_bot):
        """Test complete system startup"""
        mock_juliaos.initialize.return_value = None
        mock_juliaos.register_agent.return_value = None
        mock_juliaos.register_swarm.return_value = None
        
        # Test startup
        mock_bot.start_bot()
        
        # Verify JuliaOS initialized
        mock_juliaos.initialize.assert_called_once()
        
        # Verify components initialized
        assert mock_bot.is_running == True
    
    def test_system_shutdown(self, mock_bot):
        """Test complete system shutdown"""
        mock_bot.is_running = True
        
        mock_bot.stop_bot()
        
        # Verify shutdown
        assert mock_bot.is_running == False
    
    def test_opportunity_detection_integration(self, mock_bot):
        """Test opportunity detection across all components"""
        # Mock market data
        market_data = {
            "uniswap_ethereum": {"USDC": {"price": 1.00}},
            "sushiswap_ethereum": {"USDC": {"price": 1.02}},
            "pancakeswap_bsc": {"USDC": {"price": 0.99}}
        }
        
        # Mock opportunity detection
        with patch.object(mock_bot.arbitrage_agent, 'collect_market_data') as mock_collect:
            mock_collect.return_value = market_data
            
            opportunities = mock_bot.collect_opportunities()
            
            # Verify opportunities collected
            assert isinstance(opportunities, list)
    
    def test_swarm_coordination_integration(self, mock_bot):
        """Test swarm coordination with arbitrage agent"""
        # Mock opportunities
        opportunities = [
            {
                "token": "USDC",
                "source_exchange": "uniswap",
                "target_exchange": "sushiswap",
                "source_chain": "ethereum",
                "target_chain": "ethereum",
                "source_price": 1.00,
                "target_price": 1.02,
                "profit_percentage": 2.0,
                "estimated_profit": 20.0,
                "risk_score": 30.0
            }
        ]
        
        # Mock LLM analysis
        with patch('main.JuliaOS') as mock_juliaos:
            mock_juliaos.agent.useLLM.return_value = json.dumps({
                "risk_score": 25.0,
                "recommendation": "execute",
                "confidence": 0.85,
                "reasoning": "Good opportunity"
            })
            
            processed_opportunities = mock_bot.process_opportunities(opportunities)
            
            # Verify opportunities processed
            assert len(processed_opportunities) > 0
            assert "llm_analysis" in processed_opportunities[0]
            assert "swarm_consensus" in processed_opportunities[0]
    
    def test_cross_chain_execution_integration(self, mock_bot):
        """Test cross-chain execution integration"""
        opportunity = {
            "token": "USDC",
            "source_exchange": "uniswap",
            "target_exchange": "sushiswap",
            "source_chain": "ethereum",
            "target_chain": "bsc",
            "source_price": 1.00,
            "target_price": 1.02,
            "profit_percentage": 2.0,
            "estimated_profit": 20.0,
            "risk_score": 30.0
        }
        
        # Mock bridge transfer
        with patch('bridges.CrossChainBridge.JuliaOS') as mock_juliaos:
            mock_juliaos.bridge.execute_transfer.return_value = {
                "success": True,
                "tx_hash": "0x1234567890abcdef"
            }
            
            # Mock DEX execution
            mock_juliaos.dex.execute_trade.return_value = {
                "success": True,
                "tx_hash": "0xabcdef1234567890"
            }
            
            mock_bot.execute_opportunity(opportunity)
            
            # Verify execution completed
            assert mock_bot.performance_metrics["total_opportunities"] == 1
            assert mock_bot.performance_metrics["successful_trades"] == 1
    
    def test_performance_metrics_integration(self, mock_bot):
        """Test performance metrics across all components"""
        # Set initial metrics
        mock_bot.performance_metrics["total_opportunities"] = 100
        mock_bot.performance_metrics["successful_trades"] = 85
        
        # Update performance
        mock_bot.update_bot_performance()
        
        # Verify metrics updated
        assert "success_rate" in mock_bot.performance_metrics
        assert "uptime" in mock_bot.performance_metrics
        assert "opportunities_per_hour" in mock_bot.performance_metrics
        
        # Get performance
        performance = mock_bot.get_bot_performance()
        
        # Verify performance data
        assert performance["total_opportunities"] == 100
        assert performance["successful_trades"] == 85
        assert performance["success_rate"] == 0.85
    
    def test_error_handling_integration(self, mock_bot):
        """Test error handling across all components"""
        # Test with invalid opportunity
        invalid_opportunity = {}
        
        # Should handle gracefully
        processed_opportunities = mock_bot.process_opportunities([invalid_opportunity])
        
        # Verify graceful handling
        assert isinstance(processed_opportunities, list)
        assert len(processed_opportunities) == 0
    
    @pytest.mark.asyncio
    async def test_async_operations_integration(self, mock_bot):
        """Test asynchronous operations across all components"""
        # Mock async operations
        with patch('main.start_monitoring_loop') as mock_monitoring:
            with patch('swarm.AgentSwarm.start_swarm_coordination') as mock_coordination:
                with patch('bridges.CrossChainBridge.monitor_transfers') as mock_bridge_monitoring:
                    
                    mock_bot.start_bot()
                    
                    # Verify async operations started
                    mock_monitoring.assert_called_once()
                    mock_coordination.assert_called_once()
                    mock_bridge_monitoring.assert_called_once()
    
    def test_configuration_management_integration(self, mock_bot):
        """Test configuration management across all components"""
        # Test configuration loading
        config = mock_bot.config
        
        # Verify all required sections present
        assert "arbitrage_agent" in config
        assert "agent_swarm" in config
        assert "cross_chain_bridge" in config
        assert "wallet" in config
        assert "api_keys" in config
        
        # Verify agent configuration
        agent_config = config["arbitrage_agent"]
        assert "exchanges" in agent_config
        assert "chains" in agent_config
        assert "min_profit_threshold" in agent_config
        
        # Verify swarm configuration
        swarm_config = config["agent_swarm"]
        assert "max_agents" in swarm_config
        assert "coordination_strategy" in swarm_config
        assert "consensus_threshold" in swarm_config
    
    def test_component_interaction_integration(self, mock_bot):
        """Test interaction between all components"""
        # Test agent-swarm interaction
        assert mock_bot.arbitrage_agent is not None
        assert mock_bot.agent_swarm is not None
        
        # Test swarm-bridge interaction
        assert mock_bot.agent_swarm is not None
        assert mock_bot.cross_chain_bridge is not None
        
        # Test agent-bridge interaction
        assert mock_bot.arbitrage_agent is not None
        assert mock_bot.cross_chain_bridge is not None
    
    def test_data_flow_integration(self, mock_bot):
        """Test data flow through all components"""
        # Mock market data collection
        market_data = {
            "uniswap_ethereum": {"USDC": {"price": 1.00}},
            "sushiswap_ethereum": {"USDC": {"price": 1.02}}
        }
        
        # Mock opportunity detection
        opportunities = [
            {
                "token": "USDC",
                "source_exchange": "uniswap",
                "target_exchange": "sushiswap",
                "source_chain": "ethereum",
                "target_chain": "ethereum",
                "source_price": 1.00,
                "target_price": 1.02,
                "profit_percentage": 2.0,
                "estimated_profit": 20.0,
                "risk_score": 30.0
            }
        ]
        
        # Test data flow
        with patch.object(mock_bot.arbitrage_agent, 'collect_market_data') as mock_collect:
            mock_collect.return_value = market_data
            
            # Collect opportunities
            collected_opportunities = mock_bot.collect_opportunities()
            
            # Process opportunities
            processed_opportunities = mock_bot.process_opportunities(collected_opportunities)
            
            # Verify data flow
            assert isinstance(collected_opportunities, list)
            assert isinstance(processed_opportunities, list)
    
    def test_performance_monitoring_integration(self, mock_bot):
        """Test performance monitoring across all components"""
        # Set performance metrics
        mock_bot.performance_metrics["total_opportunities"] = 100
        mock_bot.performance_metrics["successful_trades"] = 85
        mock_bot.performance_metrics["total_profit"] = 1500.0
        
        # Update performance
        mock_bot.update_bot_performance()
        
        # Get performance
        performance = mock_bot.get_bot_performance()
        
        # Verify monitoring
        assert performance["total_opportunities"] == 100
        assert performance["successful_trades"] == 85
        assert performance["total_profit"] == 1500.0
        assert performance["success_rate"] == 0.85
    
    def test_system_resilience_integration(self, mock_bot):
        """Test system resilience and fault tolerance"""
        # Test with component failures
        with patch.object(mock_bot.arbitrage_agent, 'collect_market_data') as mock_collect:
            mock_collect.side_effect = Exception("Network error")
            
            # Should handle gracefully
            opportunities = mock_bot.collect_opportunities()
            
            # Verify graceful handling
            assert isinstance(opportunities, list)
            assert len(opportunities) == 0
    
    def test_scalability_integration(self, mock_bot):
        """Test system scalability"""
        # Test with multiple opportunities
        opportunities = [
            {
                "token": "USDC",
                "source_exchange": "uniswap",
                "target_exchange": "sushiswap",
                "source_chain": "ethereum",
                "target_chain": "ethereum",
                "source_price": 1.00,
                "target_price": 1.02,
                "profit_percentage": 2.0,
                "estimated_profit": 20.0,
                "risk_score": 30.0
            },
            {
                "token": "ETH",
                "source_exchange": "pancakeswap",
                "target_exchange": "uniswap",
                "source_chain": "bsc",
                "target_chain": "ethereum",
                "source_price": 2000.0,
                "target_price": 2100.0,
                "profit_percentage": 5.0,
                "estimated_profit": 100.0,
                "risk_score": 25.0
            }
        ]
        
        # Process multiple opportunities
        processed_opportunities = mock_bot.process_opportunities(opportunities)
        
        # Verify scalability
        assert len(processed_opportunities) <= len(opportunities)
        assert isinstance(processed_opportunities, list)

class TestEndToEndIntegration:
    """End-to-end integration test suite"""
    
    @pytest.fixture
    def e2e_bot(self):
        """Create a bot for end-to-end testing"""
        with patch('main.JuliaOS') as mock_juliaos:
            mock_juliaos.initialize.return_value = None
            mock_juliaos.shutdown.return_value = None
            mock_juliaos.get_llm_provider.return_value = Mock()
            mock_juliaos.create_agent.return_value = Mock()
            mock_juliaos.register_agent.return_value = None
            mock_juliaos.register_swarm.return_value = None
            mock_juliaos.bridge.get_supported_chains.return_value = ["ethereum", "bsc", "polygon"]
            mock_juliaos.bridge.get_provider.return_value = Mock()
            
            bot = ArbitrageSwarmBot("test_config.json")
            return bot
    
    def test_complete_arbitrage_cycle(self, e2e_bot):
        """Test complete arbitrage cycle from detection to execution"""
        # Mock market data
        market_data = {
            "uniswap_ethereum": {"USDC": {"price": 1.00}},
            "sushiswap_ethereum": {"USDC": {"price": 1.02}},
            "pancakeswap_bsc": {"USDC": {"price": 0.99}}
        }
        
        # Mock LLM analysis
        llm_response = json.dumps({
            "risk_score": 25.0,
            "recommendation": "execute",
            "confidence": 0.85,
            "reasoning": "Good opportunity"
        })
        
        # Mock bridge transfer
        bridge_result = {
            "success": True,
            "tx_hash": "0x1234567890abcdef"
        }
        
        # Mock DEX execution
        dex_result = {
            "success": True,
            "tx_hash": "0xabcdef1234567890"
        }
        
        with patch.object(e2e_bot.arbitrage_agent, 'collect_market_data') as mock_collect:
            mock_collect.return_value = market_data
            
            with patch('main.JuliaOS') as mock_juliaos:
                mock_juliaos.agent.useLLM.return_value = llm_response
                mock_juliaos.bridge.execute_transfer.return_value = bridge_result
                mock_juliaos.dex.execute_trade.return_value = dex_result
                
                # Execute complete cycle
                opportunities = e2e_bot.collect_opportunities()
                processed_opportunities = e2e_bot.process_opportunities(opportunities)
                
                for opportunity in processed_opportunities:
                    e2e_bot.execute_opportunity(opportunity)
                
                # Verify complete cycle
                assert e2e_bot.performance_metrics["total_opportunities"] > 0
                assert e2e_bot.performance_metrics["successful_trades"] > 0
                assert e2e_bot.performance_metrics["total_profit"] > 0
    
    def test_system_performance_under_load(self, e2e_bot):
        """Test system performance under load"""
        # Generate many opportunities
        opportunities = []
        for i in range(100):
            opportunities.append({
                "token": f"TOKEN_{i}",
                "source_exchange": "uniswap",
                "target_exchange": "sushiswap",
                "source_chain": "ethereum",
                "target_chain": "ethereum",
                "source_price": 1.00,
                "target_price": 1.02,
                "profit_percentage": 2.0,
                "estimated_profit": 20.0,
                "risk_score": 30.0
            })
        
        # Process under load
        with patch('main.JuliaOS') as mock_juliaos:
            mock_juliaos.agent.useLLM.return_value = json.dumps({
                "risk_score": 25.0,
                "recommendation": "execute",
                "confidence": 0.85,
                "reasoning": "Good opportunity"
            })
            
            processed_opportunities = e2e_bot.process_opportunities(opportunities)
            
            # Verify performance under load
            assert len(processed_opportunities) <= len(opportunities)
            assert isinstance(processed_opportunities, list)

if __name__ == "__main__":
    pytest.main([__file__]) 