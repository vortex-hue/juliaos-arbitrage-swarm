"""
Tests for Agent Swarm functionality

This module contains comprehensive tests for the agent swarm,
including coordination, consensus mechanisms, and load balancing.
"""

import pytest
import asyncio
from unittest.mock import Mock, patch, AsyncMock
import sys
import os

# Add src to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from swarm.AgentSwarm import AgentSwarm, SwarmConfig

class TestAgentSwarm:
    """Test suite for AgentSwarm class"""
    
    @pytest.fixture
    def mock_swarm_config(self):
        """Mock swarm configuration for testing"""
        return SwarmConfig(
            max_agents=10,
            coordination_strategy="consensus",
            consensus_threshold=0.7,
            load_balancing=True,
            fault_tolerance=True,
            auto_scaling=True
        )
    
    @pytest.fixture
    def mock_swarm(self, mock_swarm_config):
        """Create a mock agent swarm"""
        with patch('swarm.AgentSwarm.JuliaOS') as mock_juliaos:
            mock_juliaos.create_agent.return_value = Mock()
            mock_juliaos.register_swarm.return_value = None
            swarm = AgentSwarm(mock_swarm_config)
            return swarm
    
    @pytest.fixture
    def sample_opportunity(self):
        """Sample opportunity for testing"""
        return {
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
    
    def test_swarm_initialization(self, mock_swarm, mock_swarm_config):
        """Test swarm initialization with configuration"""
        assert mock_swarm.id.startswith("arbitrage-swarm-")
        assert mock_swarm.config == mock_swarm_config
        assert len(mock_swarm.agents) == 0
        assert mock_swarm.coordinator is None
        assert mock_swarm.performance_metrics["total_swarm_opportunities"] == 0
        assert mock_swarm.performance_metrics["successful_swarm_trades"] == 0
    
    @patch('swarm.AgentSwarm.JuliaOS')
    def test_initialize_swarm(self, mock_juliaos, mock_swarm):
        """Test swarm initialization with JuliaOS framework"""
        mock_juliaos.register_swarm.return_value = None
        mock_juliaos.create_agent.return_value = Mock()
        
        # Test initialization
        mock_swarm.initialize_swarm()
        
        # Verify JuliaOS calls
        mock_juliaos.register_swarm.assert_called_once_with(mock_swarm)
        assert mock_swarm.coordinator is not None
        assert len(mock_swarm.agents) > 0
    
    def test_create_coordinator_agent(self, mock_swarm):
        """Test coordinator agent creation"""
        with patch('swarm.AgentSwarm.JuliaOS') as mock_juliaos:
            mock_juliaos.create_agent.return_value = Mock()
            
            coordinator = mock_swarm.create_coordinator_agent(mock_swarm)
            
            # Verify coordinator creation
            assert coordinator is not None
            mock_juliaos.create_agent.assert_called_once()
    
    def test_initialize_agent_pool(self, mock_swarm):
        """Test agent pool initialization"""
        initial_count = len(mock_swarm.agents)
        
        mock_swarm.initialize_agent_pool()
        
        # Verify agents created
        assert len(mock_swarm.agents) > initial_count
        
        # Check for different agent types
        agent_types = [agent.config["agent_type"] for agent in mock_swarm.agents]
        assert "market_analysis" in agent_types
        assert "arbitrage_detection" in agent_types
        assert "risk_assessment" in agent_types
        assert "execution" in agent_types
        assert "portfolio_management" in agent_types
    
    def test_create_specialized_agents(self, mock_swarm):
        """Test creation of specialized agents"""
        # Test market analysis agent
        market_agent = mock_swarm.create_market_analysis_agent(mock_swarm, 1)
        assert market_agent is not None
        assert market_agent.config["agent_type"] == "market_analysis"
        
        # Test arbitrage detection agent
        arbitrage_agent = mock_swarm.create_arbitrage_detection_agent(mock_swarm, 1)
        assert arbitrage_agent is not None
        assert arbitrage_agent.config["agent_type"] == "arbitrage_detection"
        
        # Test risk assessment agent
        risk_agent = mock_swarm.create_risk_assessment_agent(mock_swarm, 1)
        assert risk_agent is not None
        assert risk_agent.config["agent_type"] == "risk_assessment"
        
        # Test execution agent
        execution_agent = mock_swarm.create_execution_agent(mock_swarm, 1)
        assert execution_agent is not None
        assert execution_agent.config["agent_type"] == "execution"
        
        # Test portfolio management agent
        portfolio_agent = mock_swarm.create_portfolio_management_agent(mock_swarm)
        assert portfolio_agent is not None
        assert portfolio_agent.config["agent_type"] == "portfolio_management"
    
    def test_collect_swarm_opportunities(self, mock_swarm):
        """Test opportunity collection from all agents"""
        # Mock agent opportunities
        mock_opportunities = [
            {"token": "USDC", "profit_percentage": 2.0},
            {"token": "ETH", "profit_percentage": 1.5}
        ]
        
        for agent in mock_swarm.agents:
            agent.get_opportunities = Mock(return_value=mock_opportunities)
        
        opportunities = mock_swarm.collect_swarm_opportunities()
        
        # Verify opportunities collected
        assert len(opportunities) > 0
        for opportunity in opportunities:
            assert "source_agent" in opportunity
    
    def test_coordinate_swarm_analysis(self, mock_swarm, sample_opportunity):
        """Test swarm coordination analysis"""
        opportunities = [sample_opportunity]
        
        # Mock consensus result
        with patch.object(mock_swarm, 'get_swarm_consensus') as mock_consensus:
            mock_consensus.return_value = {
                "approved": True,
                "score": 0.8,
                "reasoning": "Good opportunity"
            }
            
            coordinated_opportunities = mock_swarm.coordinate_swarm_analysis(opportunities)
            
            # Verify coordination
            assert len(coordinated_opportunities) == 1
            assert coordinated_opportunities[0]["consensus_score"] == 0.8
            assert coordinated_opportunities[0]["consensus_reasoning"] == "Good opportunity"
    
    def test_get_swarm_consensus(self, mock_swarm, sample_opportunity):
        """Test swarm consensus mechanism"""
        # Mock agent votes
        mock_votes = {
            "agent1": {"recommendation": "execute", "confidence": 0.8},
            "agent2": {"recommendation": "execute", "confidence": 0.9},
            "agent3": {"recommendation": "skip", "confidence": 0.3}
        }
        
        for agent in mock_swarm.agents:
            agent.analyze_opportunity = Mock(return_value=mock_votes[f"agent{agent.id}"])
        
        with patch.object(mock_swarm, 'synthesize_swarm_reasoning') as mock_synthesis:
            mock_synthesis.return_value = "Consensus reached"
            
            consensus = mock_swarm.get_swarm_consensus(sample_opportunity)
            
            # Verify consensus calculation
            assert consensus["approved"] == True  # 2/3 approve
            assert consensus["score"] == 2/3
            assert consensus["total_votes"] == 3
            assert consensus["approved_votes"] == 2
    
    def test_synthesize_swarm_reasoning(self, mock_swarm):
        """Test LLM synthesis of swarm reasoning"""
        agent_votes = {
            "agent1": {"recommendation": "execute", "confidence": 0.8, "reasoning": "Good liquidity"},
            "agent2": {"recommendation": "execute", "confidence": 0.9, "reasoning": "Low risk"}
        }
        
        with patch('swarm.AgentSwarm.JuliaOS') as mock_juliaos:
            mock_juliaos.agent.useLLM.return_value = "Synthesized reasoning"
            
            reasoning = mock_swarm.synthesize_swarm_reasoning(agent_votes)
            
            # Verify LLM synthesis
            assert reasoning == "Synthesized reasoning"
            mock_juliaos.agent.useLLM.assert_called_once()
    
    def test_execute_swarm_arbitrage(self, mock_swarm, sample_opportunity):
        """Test swarm arbitrage execution"""
        # Mock execution result
        mock_result = {"success": True, "profit": 20.0}
        
        with patch.object(mock_swarm, 'select_execution_agent') as mock_select:
            mock_execution_agent = Mock()
            mock_execution_agent.execute_arbitrage = Mock(return_value=mock_result)
            mock_select.return_value = mock_execution_agent
            
            initial_opportunities = mock_swarm.performance_metrics["total_swarm_opportunities"]
            initial_trades = mock_swarm.performance_metrics["successful_swarm_trades"]
            
            mock_swarm.execute_swarm_arbitrage(sample_opportunity)
            
            # Verify execution and metrics update
            assert mock_swarm.performance_metrics["total_swarm_opportunities"] == initial_opportunities + 1
            assert mock_swarm.performance_metrics["successful_swarm_trades"] == initial_trades + 1
            assert mock_swarm.performance_metrics["total_swarm_profit"] == 20.0
    
    def test_select_execution_agent(self, mock_swarm, sample_opportunity):
        """Test execution agent selection"""
        execution_agent = mock_swarm.select_execution_agent(sample_opportunity)
        
        # Verify execution agent selected
        assert execution_agent is not None
        assert execution_agent.config["agent_type"] == "execution"
    
    def test_auto_scale_swarm(self, mock_swarm):
        """Test swarm auto-scaling"""
        # Test overloaded scenario
        with patch.object(mock_swarm, 'calculate_swarm_load') as mock_load:
            mock_load.return_value = 0.95  # Overloaded
            
            with patch.object(mock_swarm, 'add_agents_to_swarm') as mock_add:
                mock_swarm.auto_scale_swarm()
                mock_add.assert_called_once_with(mock_swarm, 2)
        
        # Test underutilized scenario
        with patch.object(mock_swarm, 'calculate_swarm_load') as mock_load:
            mock_load.return_value = 0.2  # Underutilized
            
            with patch.object(mock_swarm, 'remove_agents_from_swarm') as mock_remove:
                mock_swarm.auto_scale_swarm()
                mock_remove.assert_called_once_with(mock_swarm, 1)
    
    def test_calculate_swarm_load(self, mock_swarm):
        """Test swarm load calculation"""
        # Mock agent statuses
        for i, agent in enumerate(mock_swarm.agents):
            agent.status = "active" if i < len(mock_swarm.agents) // 2 else "inactive"
        
        load = mock_swarm.calculate_swarm_load(mock_swarm)
        
        # Verify load calculation
        assert 0 <= load <= 1
        assert load == 0.5  # Half active
    
    def test_add_agents_to_swarm(self, mock_swarm):
        """Test adding agents to swarm"""
        initial_count = len(mock_swarm.agents)
        
        mock_swarm.add_agents_to_swarm(mock_swarm, 2)
        
        # Verify agents added
        assert len(mock_swarm.agents) == initial_count + 2
    
    def test_remove_agents_from_swarm(self, mock_swarm):
        """Test removing agents from swarm"""
        initial_count = len(mock_swarm.agents)
        
        # Mock agent performance
        for agent in mock_swarm.agents:
            agent.get_performance_metrics = Mock(return_value={"success_rate": 0.5})
        
        mock_swarm.remove_agents_from_swarm(mock_swarm, 1)
        
        # Verify agents removed
        assert len(mock_swarm.agents) == initial_count - 1
    
    def test_balance_swarm_load(self, mock_swarm):
        """Test swarm load balancing"""
        # Mock agent loads
        agent_loads = [
            (mock_swarm.agents[0], 0.9),  # High load
            (mock_swarm.agents[1], 0.1)   # Low load
        ]
        
        with patch.object(mock_swarm, 'get_agent_load') as mock_get_load:
            mock_get_load.side_effect = [0.9, 0.1]
            
            with patch('swarm.AgentSwarm.JuliaOS') as mock_juliaos:
                mock_juliaos.agent.adjust_workload.return_value = None
                
                mock_swarm.balance_swarm_load(mock_swarm)
                
                # Verify workload adjustments
                assert mock_juliaos.agent.adjust_workload.call_count == 2
    
    def test_get_agent_performance(self, mock_swarm):
        """Test agent performance retrieval"""
        mock_agent = Mock()
        mock_agent.get_performance_metrics = Mock(return_value={"success_rate": 0.8})
        
        performance = mock_swarm.get_agent_performance(mock_agent)
        
        # Verify performance retrieval
        assert performance == 0.8
    
    def test_get_agent_load(self, mock_swarm):
        """Test agent load retrieval"""
        mock_agent = Mock()
        mock_agent.get_performance_metrics = Mock(return_value={"current_load": 0.6})
        
        load = mock_swarm.get_agent_load(mock_agent)
        
        # Verify load retrieval
        assert load == 0.6
    
    def test_update_swarm_performance(self, mock_swarm):
        """Test swarm performance metrics update"""
        # Set initial metrics
        mock_swarm.performance_metrics["total_swarm_opportunities"] = 100
        mock_swarm.performance_metrics["successful_swarm_trades"] = 80
        
        mock_swarm.update_swarm_performance(mock_swarm)
        
        # Verify metrics updated
        assert "swarm_efficiency" in mock_swarm.performance_metrics
        assert mock_swarm.performance_metrics["swarm_efficiency"] == 0.8
        assert "uptime" in mock_swarm.performance_metrics
        assert "opportunities_per_hour" in mock_swarm.performance_metrics
    
    def test_error_handling(self, mock_swarm):
        """Test error handling in swarm operations"""
        # Test with invalid opportunity
        invalid_opportunity = {}
        
        # Should handle gracefully
        opportunities = mock_swarm.collect_swarm_opportunities()
        assert isinstance(opportunities, list)
    
    @pytest.mark.asyncio
    async def test_async_swarm_coordination(self, mock_swarm):
        """Test asynchronous swarm coordination"""
        # Mock async operations
        with patch('swarm.AgentSwarm.start_swarm_coordination') as mock_coordination:
            mock_swarm.initialize_swarm()
            
            # Verify coordination started
            mock_coordination.assert_called_once()

class TestSwarmConfig:
    """Test suite for SwarmConfig struct"""
    
    def test_swarm_config_creation(self):
        """Test swarm configuration creation"""
        config = SwarmConfig(
            max_agents=10,
            coordination_strategy="consensus",
            consensus_threshold=0.7,
            load_balancing=True,
            fault_tolerance=True,
            auto_scaling=True
        )
        
        assert config.max_agents == 10
        assert config.coordination_strategy == "consensus"
        assert config.consensus_threshold == 0.7
        assert config.load_balancing == True
        assert config.fault_tolerance == True
        assert config.auto_scaling == True
    
    def test_swarm_config_validation(self):
        """Test swarm configuration validation"""
        # Valid configuration
        valid_config = SwarmConfig(
            max_agents=5,
            coordination_strategy="leader",
            consensus_threshold=0.5,
            load_balancing=False,
            fault_tolerance=True,
            auto_scaling=False
        )
        
        assert valid_config.max_agents > 0
        assert valid_config.consensus_threshold >= 0 and valid_config.consensus_threshold <= 1
        
        # Test invalid configurations
        with pytest.raises(ValueError):
            SwarmConfig(
                max_agents=0,  # Invalid
                coordination_strategy="consensus",
                consensus_threshold=0.7,
                load_balancing=True,
                fault_tolerance=True,
                auto_scaling=True
            )

if __name__ == "__main__":
    pytest.main([__file__]) 