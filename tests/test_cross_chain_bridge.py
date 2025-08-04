"""
Tests for Cross-Chain Bridge functionality

This module contains comprehensive tests for the cross-chain bridge,
including transfer operations, provider selection, and fee calculations.
"""

import pytest
import asyncio
from unittest.mock import Mock, patch, AsyncMock
import sys
import os

# Add src to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from bridges.CrossChainBridge import CrossChainBridge, BridgeConfig, BridgeTransfer

class TestCrossChainBridge:
    """Test suite for CrossChainBridge class"""
    
    @pytest.fixture
    def mock_bridge_config(self):
        """Mock bridge configuration for testing"""
        return BridgeConfig(
            source_chain="ethereum",
            target_chain="bsc",
            bridge_provider="multichain",
            gas_optimization=True,
            slippage_tolerance=1.0,
            max_retries=3
        )
    
    @pytest.fixture
    def mock_bridge(self, mock_bridge_config):
        """Create a mock cross-chain bridge"""
        with patch('bridges.CrossChainBridge.JuliaOS') as mock_juliaos:
            mock_juliaos.bridge.get_supported_chains.return_value = ["ethereum", "bsc", "polygon"]
            mock_juliaos.bridge.get_provider.return_value = Mock()
            bridge = CrossChainBridge(mock_bridge_config)
            return bridge
    
    @pytest.fixture
    def sample_transfer_params(self):
        """Sample transfer parameters for testing"""
        return {
            "source_chain": "ethereum",
            "target_chain": "bsc",
            "token": "USDC",
            "amount": 1000.0,
            "recipient": "0x1234567890123456789012345678901234567890"
        }
    
    def test_bridge_initialization(self, mock_bridge, mock_bridge_config):
        """Test bridge initialization with configuration"""
        assert mock_bridge.id.startswith("cross-chain-bridge-")
        assert mock_bridge.config == mock_bridge_config
        assert len(mock_bridge.supported_chains) > 0
        assert len(mock_bridge.bridge_providers) > 0
        assert mock_bridge.performance_metrics["total_transfers"] == 0
        assert mock_bridge.performance_metrics["successful_transfers"] == 0
    
    @patch('bridges.CrossChainBridge.JuliaOS')
    def test_initialize_bridge_providers(self, mock_juliaos, mock_bridge):
        """Test bridge provider initialization"""
        mock_juliaos.bridge.get_supported_chains.return_value = ["ethereum", "bsc", "polygon"]
        mock_juliaos.bridge.get_provider.return_value = Mock()
        
        mock_bridge.initialize_bridge_providers()
        
        # Verify providers initialized
        assert len(mock_bridge.supported_chains) > 0
        assert len(mock_bridge.bridge_providers) > 0
        assert "multichain" in mock_bridge.bridge_providers
        assert "stargate" in mock_bridge.bridge_providers
    
    def test_transfer_validation(self, mock_bridge, sample_transfer_params):
        """Test transfer parameter validation"""
        # Valid parameters should pass
        mock_bridge.validate_transfer_params(sample_transfer_params)
        
        # Test missing required fields
        invalid_params = sample_transfer_params.copy()
        del invalid_params["token"]
        
        with pytest.raises(ArgumentError):
            mock_bridge.validate_transfer_params(invalid_params)
        
        # Test unsupported chains
        invalid_params = sample_transfer_params.copy()
        invalid_params["source_chain"] = "unsupported_chain"
        
        with pytest.raises(ArgumentError):
            mock_bridge.validate_transfer_params(invalid_params)
        
        # Test invalid amount
        invalid_params = sample_transfer_params.copy()
        invalid_params["amount"] = -100
        
        with pytest.raises(ArgumentError):
            mock_bridge.validate_transfer_params(invalid_params)
    
    def test_select_optimal_bridge_provider(self, mock_bridge, sample_transfer_params):
        """Test optimal bridge provider selection"""
        # Mock provider metrics
        with patch('bridges.CrossChainBridge.JuliaOS') as mock_juliaos:
            mock_juliaos.bridge.get_provider_fees.return_value = {"total_fees": 10.0}
            mock_juliaos.bridge.get_provider_speed.return_value = 30
            mock_juliaos.bridge.get_provider_reliability.return_value = 0.95
            
            optimal_provider = mock_bridge.select_optimal_bridge_provider(sample_transfer_params)
            
            # Verify provider selected
            assert optimal_provider in mock_bridge.bridge_providers.keys()
    
    def test_calculate_bridge_fees(self, mock_bridge, sample_transfer_params):
        """Test bridge fee calculation"""
        provider = "multichain"
        
        with patch('bridges.CrossChainBridge.JuliaOS') as mock_juliaos:
            mock_juliaos.bridge.calculate_fees.return_value = {
                "gas_fees": 5.0,
                "bridge_fees": 3.0,
                "total_fees": 8.0,
                "fee_currency": "USDC"
            }
            
            fees = mock_bridge.calculate_bridge_fees(provider, sample_transfer_params)
            
            # Verify fee calculation
            assert fees["gas_fees"] == 5.0
            assert fees["bridge_fees"] == 3.0
            assert fees["total_fees"] == 8.0
            assert fees["fee_currency"] == "USDC"
    
    def test_estimate_transfer_time(self, mock_bridge, sample_transfer_params):
        """Test transfer time estimation"""
        provider = "multichain"
        
        with patch('bridges.CrossChainBridge.JuliaOS') as mock_juliaos:
            mock_juliaos.bridge.estimate_transfer_time.return_value = 300  # 5 minutes
            
            estimated_time = mock_bridge.estimate_transfer_time(provider, sample_transfer_params)
            
            # Verify time estimation
            assert estimated_time == 300
    
    @patch('bridges.CrossChainBridge.JuliaOS')
    def test_execute_bridge_transfer(self, mock_juliaos, mock_bridge, sample_transfer_params):
        """Test bridge transfer execution"""
        # Mock transfer result
        mock_juliaos.bridge.execute_transfer.return_value = {
            "success": True,
            "tx_hash": "0x1234567890abcdef",
            "estimated_time": 300
        }
        
        transfer = BridgeTransfer(
            id="transfer-123",
            source_chain="ethereum",
            target_chain="bsc",
            token="USDC",
            amount=1000.0,
            recipient="0x1234567890123456789012345678901234567890",
            bridge_provider="multichain",
            status="pending",
            tx_hash="",
            gas_fees=5.0,
            bridge_fees=3.0,
            estimated_time=300,
            timestamp="2023-01-01T00:00:00"
        )
        
        result = mock_bridge.execute_bridge_transfer(transfer, "multichain")
        
        # Verify transfer execution
        assert result["success"] == True
        assert result["tx_hash"] == "0x1234567890abcdef"
    
    def test_update_transfer_status(self, mock_bridge):
        """Test transfer status update"""
        transfer = BridgeTransfer(
            id="transfer-123",
            source_chain="ethereum",
            target_chain="bsc",
            token="USDC",
            amount=1000.0,
            recipient="0x1234567890123456789012345678901234567890",
            bridge_provider="multichain",
            status="pending",
            tx_hash="",
            gas_fees=5.0,
            bridge_fees=3.0,
            estimated_time=300,
            timestamp="2023-01-01T00:00:00"
        )
        
        # Test successful transfer
        result = {"success": True, "tx_hash": "0x123"}
        mock_bridge.update_transfer_status(transfer, result)
        
        assert transfer.status == "completed"
        assert transfer.tx_hash == "0x123"
        assert transfer in mock_bridge.active_transfers
        
        # Test failed transfer
        transfer.status = "pending"
        result = {"success": False, "error": "Insufficient funds"}
        mock_bridge.update_transfer_status(transfer, result)
        
        assert transfer.status == "failed"
    
    def test_update_bridge_performance(self, mock_bridge):
        """Test bridge performance metrics update"""
        transfer = BridgeTransfer(
            id="transfer-123",
            source_chain="ethereum",
            target_chain="bsc",
            token="USDC",
            amount=1000.0,
            recipient="0x1234567890123456789012345678901234567890",
            bridge_provider="multichain",
            status="completed",
            tx_hash="0x123",
            gas_fees=5.0,
            bridge_fees=3.0,
            estimated_time=300,
            timestamp="2023-01-01T00:00:00"
        )
        
        initial_transfers = mock_bridge.performance_metrics["total_transfers"]
        initial_successful = mock_bridge.performance_metrics["successful_transfers"]
        
        mock_bridge.update_bridge_performance(transfer)
        
        # Verify metrics updated
        assert mock_bridge.performance_metrics["total_transfers"] == initial_transfers + 1
        assert mock_bridge.performance_metrics["successful_transfers"] == initial_successful + 1
        assert mock_bridge.performance_metrics["total_fees_paid"] == 8.0
    
    def test_get_supported_chains(self, mock_bridge):
        """Test supported chains retrieval"""
        chains = mock_bridge.get_supported_chains()
        
        # Verify chains returned
        assert isinstance(chains, list)
        assert len(chains) > 0
        assert "ethereum" in chains
        assert "bsc" in chains
    
    def test_get_bridge_fees(self, mock_bridge):
        """Test bridge fees retrieval for specific route"""
        source_chain = "ethereum"
        target_chain = "bsc"
        
        with patch('bridges.CrossChainBridge.JuliaOS') as mock_juliaos:
            mock_juliaos.bridge.get_route_fees.return_value = {
                "gas_fees": 5.0,
                "bridge_fees": 3.0,
                "total_fees": 8.0
            }
            
            fees_by_provider = mock_bridge.get_bridge_fees(source_chain, target_chain)
            
            # Verify fees returned
            assert isinstance(fees_by_provider, dict)
            assert len(fees_by_provider) > 0
    
    def test_get_transfer_status(self, mock_bridge):
        """Test transfer status retrieval"""
        # Add a test transfer
        transfer = BridgeTransfer(
            id="transfer-123",
            source_chain="ethereum",
            target_chain="bsc",
            token="USDC",
            amount=1000.0,
            recipient="0x1234567890123456789012345678901234567890",
            bridge_provider="multichain",
            status="completed",
            tx_hash="0x123",
            gas_fees=5.0,
            bridge_fees=3.0,
            estimated_time=300,
            timestamp="2023-01-01T00:00:00"
        )
        mock_bridge.active_transfers.append(transfer)
        
        status = mock_bridge.get_transfer_status("transfer-123")
        
        # Verify status returned
        assert status is not None
        assert status["id"] == "transfer-123"
        assert status["status"] == "completed"
        assert status["tx_hash"] == "0x123"
        
        # Test non-existent transfer
        status = mock_bridge.get_transfer_status("non-existent")
        assert status is None
    
    def test_get_bridge_performance(self, mock_bridge):
        """Test bridge performance metrics retrieval"""
        # Set some test metrics
        mock_bridge.performance_metrics["total_transfers"] = 100
        mock_bridge.performance_metrics["successful_transfers"] = 85
        
        performance = mock_bridge.get_bridge_performance()
        
        # Verify performance metrics
        assert performance["total_transfers"] == 100
        assert performance["successful_transfers"] == 85
        assert performance["success_rate"] == 0.85
        assert "uptime" in performance
    
    @patch('bridges.CrossChainBridge.JuliaOS')
    def test_monitor_transfers(self, mock_juliaos, mock_bridge):
        """Test transfer monitoring"""
        # Add a pending transfer
        transfer = BridgeTransfer(
            id="transfer-123",
            source_chain="ethereum",
            target_chain="bsc",
            token="USDC",
            amount=1000.0,
            recipient="0x1234567890123456789012345678901234567890",
            bridge_provider="multichain",
            status="pending",
            tx_hash="0x123",
            gas_fees=5.0,
            bridge_fees=3.0,
            estimated_time=300,
            timestamp="2023-01-01T00:00:00"
        )
        mock_bridge.active_transfers.append(transfer)
        
        # Mock completed status
        mock_juliaos.bridge.check_transfer_status.return_value = {"completed": True}
        
        mock_bridge.monitor_transfers()
        
        # Verify transfer status updated
        assert transfer.status == "completed"
    
    def test_cleanup_old_transfers(self, mock_bridge):
        """Test cleanup of old transfers"""
        # Add old transfer
        old_transfer = BridgeTransfer(
            id="transfer-old",
            source_chain="ethereum",
            target_chain="bsc",
            token="USDC",
            amount=1000.0,
            recipient="0x1234567890123456789012345678901234567890",
            bridge_provider="multichain",
            status="completed",
            tx_hash="0x123",
            gas_fees=5.0,
            bridge_fees=3.0,
            estimated_time=300,
            timestamp="2023-01-01T00:00:00"  # Old timestamp
        )
        mock_bridge.active_transfers.append(old_transfer)
        
        # Add recent transfer
        recent_transfer = BridgeTransfer(
            id="transfer-recent",
            source_chain="ethereum",
            target_chain="bsc",
            token="USDC",
            amount=1000.0,
            recipient="0x1234567890123456789012345678901234567890",
            bridge_provider="multichain",
            status="completed",
            tx_hash="0x456",
            gas_fees=5.0,
            bridge_fees=3.0,
            estimated_time=300,
            timestamp="2023-12-01T00:00:00"  # Recent timestamp
        )
        mock_bridge.active_transfers.append(recent_transfer)
        
        initial_count = len(mock_bridge.active_transfers)
        
        mock_bridge.cleanup_old_transfers()
        
        # Verify old transfer removed
        assert len(mock_bridge.active_transfers) < initial_count
    
    def test_is_valid_address(self, mock_bridge):
        """Test address validation"""
        # Valid addresses
        assert mock_bridge.is_valid_address("0x1234567890123456789012345678901234567890")
        assert mock_bridge.is_valid_address("0xabcdefabcdefabcdefabcdefabcdefabcdefabcd")
        
        # Invalid addresses
        assert not mock_bridge.is_valid_address("invalid")
        assert not mock_bridge.is_valid_address("0x123")  # Too short
        assert not mock_bridge.is_valid_address("0x" + "1" * 50)  # Too long
    
    def test_get_optimal_route(self, mock_bridge):
        """Test optimal route calculation"""
        source_chain = "ethereum"
        target_chain = "bsc"
        token = "USDC"
        
        with patch('bridges.CrossChainBridge.JuliaOS') as mock_juliaos:
            mock_juliaos.bridge.get_route_info.return_value = {
                "fees": {"total_fees": 8.0},
                "estimated_time": 300
            }
            
            optimal_route = mock_bridge.get_optimal_route(source_chain, target_chain, token)
            
            # Verify optimal route found
            assert optimal_route is not None
            assert "provider" in optimal_route
            assert "route" in optimal_route
    
    def test_transfer_integration(self, mock_bridge, sample_transfer_params):
        """Test complete transfer integration"""
        with patch('bridges.CrossChainBridge.JuliaOS') as mock_juliaos:
            # Mock all necessary calls
            mock_juliaos.bridge.get_provider_fees.return_value = {"total_fees": 8.0}
            mock_juliaos.bridge.get_provider_speed.return_value = 30
            mock_juliaos.bridge.get_provider_reliability.return_value = 0.95
            mock_juliaos.bridge.calculate_fees.return_value = {
                "gas_fees": 5.0,
                "bridge_fees": 3.0,
                "total_fees": 8.0,
                "fee_currency": "USDC"
            }
            mock_juliaos.bridge.estimate_transfer_time.return_value = 300
            mock_juliaos.bridge.execute_transfer.return_value = {
                "success": True,
                "tx_hash": "0x1234567890abcdef"
            }
            
            # Execute transfer
            result = mock_bridge.transfer(sample_transfer_params)
            
            # Verify transfer completed
            assert result["success"] == True
            assert result["tx_hash"] == "0x1234567890abcdef"
            
            # Verify performance metrics updated
            assert mock_bridge.performance_metrics["total_transfers"] == 1
            assert mock_bridge.performance_metrics["successful_transfers"] == 1

class TestBridgeConfig:
    """Test suite for BridgeConfig struct"""
    
    def test_bridge_config_creation(self):
        """Test bridge configuration creation"""
        config = BridgeConfig(
            source_chain="ethereum",
            target_chain="bsc",
            bridge_provider="multichain",
            gas_optimization=True,
            slippage_tolerance=1.0,
            max_retries=3
        )
        
        assert config.source_chain == "ethereum"
        assert config.target_chain == "bsc"
        assert config.bridge_provider == "multichain"
        assert config.gas_optimization == True
        assert config.slippage_tolerance == 1.0
        assert config.max_retries == 3

class TestBridgeTransfer:
    """Test suite for BridgeTransfer struct"""
    
    def test_bridge_transfer_creation(self):
        """Test bridge transfer creation"""
        transfer = BridgeTransfer(
            id="transfer-123",
            source_chain="ethereum",
            target_chain="bsc",
            token="USDC",
            amount=1000.0,
            recipient="0x1234567890123456789012345678901234567890",
            bridge_provider="multichain",
            status="pending",
            tx_hash="",
            gas_fees=5.0,
            bridge_fees=3.0,
            estimated_time=300,
            timestamp="2023-01-01T00:00:00"
        )
        
        assert transfer.id == "transfer-123"
        assert transfer.source_chain == "ethereum"
        assert transfer.target_chain == "bsc"
        assert transfer.token == "USDC"
        assert transfer.amount == 1000.0
        assert transfer.status == "pending"
        assert transfer.gas_fees == 5.0
        assert transfer.bridge_fees == 3.0

if __name__ == "__main__":
    pytest.main([__file__]) 