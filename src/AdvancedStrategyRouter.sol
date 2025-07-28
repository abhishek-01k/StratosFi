// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/IAdvancedStrategy.sol";
import "./strategies/OptionsProtocol.sol";
import "./strategies/ConcentratedLiquidityHook.sol";
import "./strategies/TWAPEngine.sol";
import "./oracles/VolatilityOracle.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title AdvancedStrategyRouter
 * @notice Unified router for all advanced 1inch limit order strategies
 * @dev Main entry point for strategy execution and management
 */
contract AdvancedStrategyRouter is IAdvancedStrategy, Ownable(msg.sender), Pausable {
    // ============ STRUCTS ============

    struct CombinedStrategyConfig {
        bool useOptions;
        bool useConcentratedLiquidity;
        bool useTWAP;
        bool useVolatilityAdjustment;
        bytes optionsData;
        bytes liquidityData;
        bytes twapData;
        uint256 maxGasPrice;
    }

    struct StrategyStats {
        uint256 totalExecutions;
        uint256 totalVolume;
        uint256 averageGasUsed;
        uint256 successRate;
        mapping(IAdvancedStrategy.StrategyType => uint256) executionsByType;
    }

    // ============ STATE VARIABLES ============

    OptionsProtocol public immutable optionsProtocol;
    ConcentratedLiquidityHook public immutable liquidityHook;
    TWAPEngine public immutable twapEngine;
    VolatilityOracle public immutable volatilityOracle;

    mapping(address => StrategyStats) public userStats;
    mapping(bytes32 => CombinedStrategyConfig) public combinedConfigs;
    
    uint256 public protocolFeeRate = 10; // 0.1% in basis points
    address public feeCollector;
    
    uint256 private constant BASIS_POINTS = 10_000;

    // ============ EVENTS ============

    event CombinedStrategyExecuted(
        bytes32 indexed configId,
        address indexed user,
        uint256 totalAmount,
        uint256 gasUsed
    );

    event ProtocolFeeUpdated(uint256 newFeeRate);
    event FeeCollectorUpdated(address newCollector);

    // ============ CONSTRUCTOR ============

    constructor(
        address _optionsProtocol,
        address _liquidityHook,
        address _twapEngine,
        address _volatilityOracle,
        address _feeCollector
    ) {
        optionsProtocol = OptionsProtocol(_optionsProtocol);
        liquidityHook = ConcentratedLiquidityHook(_liquidityHook);
        twapEngine = TWAPEngine(_twapEngine);
        volatilityOracle = VolatilityOracle(_volatilityOracle);
        feeCollector = _feeCollector;
    }

    // ============ AMOUNT GETTER INTERFACE ============

    function getMakingAmount(
        IOrderMixin.Order calldata order,
        bytes calldata extension,
        bytes32 orderHash,
        address taker,
        uint256 takingAmount,
        uint256 remainingMakingAmount,
        bytes calldata extraData
    ) external view override returns (uint256) {
        (StrategyType strategyType, bytes memory strategyData) = abi.decode(extraData, (StrategyType, bytes));
        
        if (strategyType == StrategyType.Options) {
            return optionsProtocol.getMakingAmount(order, extension, orderHash, taker, takingAmount, remainingMakingAmount, strategyData);
        } else if (strategyType == StrategyType.ConcentratedLiquidity) {
            return liquidityHook.getMakingAmount(order, extension, orderHash, taker, takingAmount, remainingMakingAmount, strategyData);
        } else if (strategyType == StrategyType.TWAP) {
            return twapEngine.getMakingAmount(order, extension, orderHash, taker, takingAmount, remainingMakingAmount, strategyData);
        } else if (strategyType == StrategyType.Combined) {
            return _getCombinedMakingAmount(order, extension, orderHash, taker, takingAmount, remainingMakingAmount, strategyData);
        }
        
        return remainingMakingAmount;
    }

    function getTakingAmount(
        IOrderMixin.Order calldata order,
        bytes calldata extension,
        bytes32 orderHash,
        address taker,
        uint256 makingAmount,
        uint256 remainingMakingAmount,
        bytes calldata extraData
    ) external view override returns (uint256) {
        (StrategyType strategyType, bytes memory strategyData) = abi.decode(extraData, (StrategyType, bytes));
        
        if (strategyType == StrategyType.Options) {
            return optionsProtocol.getTakingAmount(order, extension, orderHash, taker, makingAmount, remainingMakingAmount, strategyData);
        } else if (strategyType == StrategyType.ConcentratedLiquidity) {
            return liquidityHook.getTakingAmount(order, extension, orderHash, taker, makingAmount, remainingMakingAmount, strategyData);
        } else if (strategyType == StrategyType.TWAP) {
            return twapEngine.getTakingAmount(order, extension, orderHash, taker, makingAmount, remainingMakingAmount, strategyData);
        } else if (strategyType == StrategyType.Combined) {
            return _getCombinedTakingAmount(order, extension, orderHash, taker, makingAmount, remainingMakingAmount, strategyData);
        }
        
        return (makingAmount * order.takingAmount) / order.makingAmount;
    }

    // ============ STRATEGY INTERFACE ============

    function configureStrategy(
        StrategyConfig calldata config
    ) external override whenNotPaused returns (bytes32 configId) {
        configId = keccak256(abi.encode(config, msg.sender, block.timestamp));
        
        if (config.strategyType == StrategyType.Options) {
            optionsProtocol.configureStrategy(config);
        } else if (config.strategyType == StrategyType.ConcentratedLiquidity) {
            liquidityHook.configureStrategy(config);
        } else if (config.strategyType == StrategyType.TWAP) {
            twapEngine.configureStrategy(config);
        } else if (config.strategyType == StrategyType.Combined) {
            _configureCombinedStrategy(configId, config);
        }
        
        emit StrategyConfigured(configId, config.strategyType, msg.sender);
    }

    function executeStrategy(
        bytes32 orderHash,
        bytes calldata strategyData
    ) external override whenNotPaused returns (uint256 executedAmount) {
        uint256 gasStart = gasleft();
        
        (StrategyType strategyType, bytes memory data) = abi.decode(strategyData, (StrategyType, bytes));
        
        if (strategyType == StrategyType.Options) {
            executedAmount = optionsProtocol.executeStrategy(orderHash, data);
        } else if (strategyType == StrategyType.ConcentratedLiquidity) {
            executedAmount = liquidityHook.executeStrategy(orderHash, data);
        } else if (strategyType == StrategyType.TWAP) {
            executedAmount = twapEngine.executeStrategy(orderHash, data);
        } else if (strategyType == StrategyType.Combined) {
            executedAmount = _executeCombinedStrategy(orderHash, data);
        }
        
        // Update statistics
        _updateStats(msg.sender, strategyType, executedAmount, gasStart - gasleft());
        
        // Collect protocol fee
        if (protocolFeeRate > 0 && executedAmount > 0) {
            uint256 fee = (executedAmount * protocolFeeRate) / BASIS_POINTS;
            // Transfer fee logic here
        }
        
        emit StrategyExecuted(orderHash, strategyType, executedAmount, msg.sender);
    }

    function validateStrategy(
        bytes32 orderHash,
        bytes calldata strategyData
    ) external view override returns (bool isValid) {
        (StrategyType strategyType, bytes memory data) = abi.decode(strategyData, (StrategyType, bytes));
        
        if (strategyType == StrategyType.Options) {
            return optionsProtocol.validateStrategy(orderHash, data);
        } else if (strategyType == StrategyType.ConcentratedLiquidity) {
            return liquidityHook.validateStrategy(orderHash, data);
        } else if (strategyType == StrategyType.TWAP) {
            return twapEngine.validateStrategy(orderHash, data);
        } else if (strategyType == StrategyType.Combined) {
            return _validateCombinedStrategy(orderHash, data);
        }
        
        return false;
    }

    function getStrategyGasEstimate(
        StrategyType strategyType
    ) external pure override returns (uint256) {
        if (strategyType == StrategyType.Options) {
            return 150_000;
        } else if (strategyType == StrategyType.ConcentratedLiquidity) {
            return 200_000;
        } else if (strategyType == StrategyType.TWAP) {
            return 100_000;
        } else if (strategyType == StrategyType.Volatility) {
            return 75_000;
        } else if (strategyType == StrategyType.Combined) {
            return 300_000;
        }
        return 50_000;
    }

    // ============ COMBINED STRATEGY FUNCTIONS ============

    function configureCombinedStrategy(
        CombinedStrategyConfig calldata config
    ) external whenNotPaused returns (bytes32 configId) {
        configId = keccak256(abi.encode(config, msg.sender, block.timestamp));
        combinedConfigs[configId] = config;
        
        emit CombinedStrategyExecuted(configId, msg.sender, 0, 0);
    }

    function _configureCombinedStrategy(
        bytes32 configId,
        StrategyConfig memory config
    ) internal {
        CombinedStrategyConfig memory combinedConfig = abi.decode(config.additionalData, (CombinedStrategyConfig));
        combinedConfigs[configId] = combinedConfig;
    }

    function _executeCombinedStrategy(
        bytes32 orderHash,
        bytes memory data
    ) internal returns (uint256 executedAmount) {
        bytes32 configId = abi.decode(data, (bytes32));
        CombinedStrategyConfig memory config = combinedConfigs[configId];
        
        uint256 totalAmount;
        
        // Execute enabled strategies in sequence
        if (config.useOptions && config.optionsData.length > 0) {
            uint256 optionsAmount = optionsProtocol.executeStrategy(orderHash, config.optionsData);
            totalAmount += optionsAmount;
        }
        
        if (config.useConcentratedLiquidity && config.liquidityData.length > 0) {
            uint256 liquidityAmount = liquidityHook.executeStrategy(orderHash, config.liquidityData);
            totalAmount += liquidityAmount;
        }
        
        if (config.useTWAP && config.twapData.length > 0) {
            uint256 twapAmount = twapEngine.executeStrategy(orderHash, config.twapData);
            totalAmount += twapAmount;
        }
        
        // Apply volatility adjustment if enabled
        if (config.useVolatilityAdjustment) {
            uint256 volatility = volatilityOracle.getCurrentVolatility();
            if (volatility > 1000) { // High volatility
                totalAmount = (totalAmount * 80) / 100; // Reduce by 20%
            }
        }
        
        executedAmount = totalAmount;
    }

    function _validateCombinedStrategy(
        bytes32 orderHash,
        bytes memory data
    ) internal view returns (bool) {
        bytes32 configId = abi.decode(data, (bytes32));
        CombinedStrategyConfig memory config = combinedConfigs[configId];
        
        // At least one strategy must be enabled
        return config.useOptions || config.useConcentratedLiquidity || config.useTWAP;
    }

    function _getCombinedMakingAmount(
        IOrderMixin.Order calldata order,
        bytes calldata extension,
        bytes32 orderHash,
        address taker,
        uint256 takingAmount,
        uint256 remainingMakingAmount,
        bytes memory strategyData
    ) internal view returns (uint256) {
        bytes32 configId = abi.decode(strategyData, (bytes32));
        CombinedStrategyConfig memory config = combinedConfigs[configId];
        
        uint256 minAmount = remainingMakingAmount;
        
        // Get minimum amount across all enabled strategies
        if (config.useOptions) {
            uint256 optionsAmount = optionsProtocol.getMakingAmount(
                order, extension, orderHash, taker, takingAmount, remainingMakingAmount, config.optionsData
            );
            if (optionsAmount < minAmount) minAmount = optionsAmount;
        }
        
        if (config.useConcentratedLiquidity) {
            uint256 liquidityAmount = liquidityHook.getMakingAmount(
                order, extension, orderHash, taker, takingAmount, remainingMakingAmount, config.liquidityData
            );
            if (liquidityAmount < minAmount) minAmount = liquidityAmount;
        }
        
        if (config.useTWAP) {
            uint256 twapAmount = twapEngine.getMakingAmount(
                order, extension, orderHash, taker, takingAmount, remainingMakingAmount, config.twapData
            );
            if (twapAmount < minAmount) minAmount = twapAmount;
        }
        
        return minAmount;
    }

    function _getCombinedTakingAmount(
        IOrderMixin.Order calldata order,
        bytes calldata extension,
        bytes32 orderHash,
        address taker,
        uint256 makingAmount,
        uint256 remainingMakingAmount,
        bytes memory strategyData
    ) internal view returns (uint256) {
        // Similar logic to _getCombinedMakingAmount but for taking amounts
        return (makingAmount * order.takingAmount) / order.makingAmount;
    }

    // ============ STATISTICS & MONITORING ============

    function _updateStats(
        address user,
        StrategyType strategyType,
        uint256 amount,
        uint256 gasUsed
    ) internal {
        StrategyStats storage stats = userStats[user];
        stats.totalExecutions++;
        stats.totalVolume += amount;
        stats.averageGasUsed = (stats.averageGasUsed * (stats.totalExecutions - 1) + gasUsed) / stats.totalExecutions;
        stats.executionsByType[strategyType]++;
        
        if (amount > 0) {
            stats.successRate = (stats.successRate * (stats.totalExecutions - 1) + 100) / stats.totalExecutions;
        } else {
            stats.successRate = (stats.successRate * (stats.totalExecutions - 1)) / stats.totalExecutions;
        }
    }

    function getUserStats(address user) external view returns (
        uint256 totalExecutions,
        uint256 totalVolume,
        uint256 averageGasUsed,
        uint256 successRate
    ) {
        StrategyStats storage stats = userStats[user];
        return (
            stats.totalExecutions,
            stats.totalVolume,
            stats.averageGasUsed,
            stats.successRate
        );
    }

    function getStrategyExecutions(
        address user,
        StrategyType strategyType
    ) external view returns (uint256) {
        return userStats[user].executionsByType[strategyType];
    }

    // ============ ADMIN FUNCTIONS ============

    function updateProtocolFee(uint256 newFeeRate) external onlyOwner {
        require(newFeeRate <= 100, "Fee too high"); // Max 1%
        protocolFeeRate = newFeeRate;
        emit ProtocolFeeUpdated(newFeeRate);
    }

    function updateFeeCollector(address newCollector) external onlyOwner {
        require(newCollector != address(0), "Invalid address");
        feeCollector = newCollector;
        emit FeeCollectorUpdated(newCollector);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // ============ EMERGENCY FUNCTIONS ============

    function emergencyPause() external {
        require(volatilityOracle.shouldPauseExecution(), "No emergency");
        _pause();
    }
}