// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../interfaces/IAdvancedStrategy.sol";
import "../interfaces/IAmountGetter.sol";
import "../oracles/VolatilityOracle.sol";

/**
 * @title TWAPEngine
 * @notice MEV-resistant Time-Weighted Average Price execution engine
 * @dev Implements randomized execution amounts and adaptive intervals
 */
contract TWAPEngine is IAdvancedStrategy {
    // ============ STRUCTS ============

    struct TWAPConfig {
        uint256 totalAmount;          // Total amount to execute
        uint256 intervals;            // Number of execution intervals
        uint256 startTime;            // Start timestamp
        uint256 endTime;              // End timestamp
        uint256 maxPriceDeviation;    // Max price deviation in basis points
        bool enableRandomization;     // Enable MEV protection
        uint256 randomizationFactor;  // Randomization percentage (basis points)
        address priceOracle;          // Price oracle address
    }

    struct TWAPExecution {
        bytes32 configId;             // TWAP configuration ID
        uint256 executedAmount;       // Total executed amount
        uint256 executedIntervals;    // Number of completed intervals
        uint256 lastExecutionTime;    // Last execution timestamp
        uint256 lastExecutionPrice;   // Last execution price
        uint256[] intervalAmounts;    // Amount executed per interval
        bool isPaused;                // Emergency pause flag
    }

    struct IntervalData {
        uint256 targetTime;           // Target execution time
        uint256 actualTime;           // Actual execution time
        uint256 targetAmount;         // Target execution amount
        uint256 actualAmount;         // Actual execution amount
        uint256 executionPrice;       // Execution price
        bytes32 randomSeed;           // Random seed for this interval
    }

    // ============ CONSTANTS ============

    uint256 private constant BASIS_POINTS = 10_000;
    uint256 private constant MAX_RANDOMIZATION = 1500; // 15% max randomization
    uint256 private constant MIN_INTERVAL_TIME = 60; // 1 minute minimum
    uint256 private constant MAX_INTERVALS = 1000;

    // ============ STATE VARIABLES ============

    mapping(bytes32 => TWAPConfig) public twapConfigs;
    mapping(bytes32 => TWAPExecution) public twapExecutions;
    mapping(bytes32 => mapping(uint256 => IntervalData)) public intervalData;
    
    VolatilityOracle public immutable volatilityOracle;
    uint256 public emergencyPauseThreshold = 2000; // 20% volatility

    // ============ EVENTS ============

    event TWAPConfigured(
        bytes32 indexed configId,
        uint256 totalAmount,
        uint256 intervals,
        uint256 startTime,
        uint256 endTime
    );

    event TWAPIntervalExecuted(
        bytes32 indexed configId,
        uint256 intervalIndex,
        uint256 executedAmount,
        uint256 executionPrice,
        uint256 randomSeed
    );

    event TWAPCompleted(
        bytes32 indexed configId,
        uint256 totalExecuted,
        uint256 averagePrice
    );

    event TWAPPaused(bytes32 indexed configId, uint256 volatility);
    event TWAPResumed(bytes32 indexed configId);

    // ============ ERRORS ============

    error InvalidTWAPConfig();
    error TWAPNotStarted();
    error TWAPExpired();
    error TWAPIsPaused();
    error IntervalNotReady();
    error PriceDeviationExceeded();
    error InvalidInterval();
    error TWAPIsCompleted();

    // ============ CONSTRUCTOR ============

    constructor(address _volatilityOracle) {
        volatilityOracle = VolatilityOracle(_volatilityOracle);
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
        bytes32 configId = abi.decode(extraData, (bytes32));
        return _calculateTWAPAmount(configId, order, remainingMakingAmount, true);
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
        bytes32 configId = abi.decode(extraData, (bytes32));
        return _calculateTWAPAmount(configId, order, remainingMakingAmount, false);
    }

    // ============ STRATEGY INTERFACE ============

    function configureStrategy(
        StrategyConfig calldata config
    ) external override returns (bytes32 configId) {
        TWAPConfig memory twapConfig = abi.decode(config.additionalData, (TWAPConfig));
        configId = _configureTWAP(twapConfig);
        emit StrategyConfigured(configId, config.strategyType, msg.sender);
    }

    function executeStrategy(
        bytes32 orderHash,
        bytes calldata strategyData
    ) external override returns (uint256 executedAmount) {
        (bytes32 configId, uint256 currentPrice) = abi.decode(strategyData, (bytes32, uint256));
        return _executeTWAPInterval(configId, currentPrice);
    }

    function validateStrategy(
        bytes32 orderHash,
        bytes calldata strategyData
    ) external view override returns (bool) {
        bytes32 configId = abi.decode(strategyData, (bytes32));
        TWAPConfig memory config = twapConfigs[configId];
        TWAPExecution memory execution = twapExecutions[configId];
        
        // Check if TWAP is valid and ready for execution
        if (config.totalAmount == 0) return false;
        if (block.timestamp < config.startTime) return false;
        if (block.timestamp > config.endTime) return false;
        if (execution.isPaused) return false;
        if (execution.executedIntervals >= config.intervals) return false;
        
        return true;
    }

    function getStrategyGasEstimate(
        StrategyType strategyType
    ) external pure override returns (uint256) {
        if (strategyType == StrategyType.TWAP) {
            return 100_000;
        }
        return 0;
    }

    // ============ TWAP CONFIGURATION ============

    function configureTWAP(
        uint256 totalAmount,
        uint256 intervals,
        uint256 duration,
        uint256 maxPriceDeviation,
        bool enableRandomization
    ) external returns (bytes32 configId) {
        TWAPConfig memory config = TWAPConfig({
            totalAmount: totalAmount,
            intervals: intervals,
            startTime: block.timestamp,
            endTime: block.timestamp + duration,
            maxPriceDeviation: maxPriceDeviation,
            enableRandomization: enableRandomization,
            randomizationFactor: enableRandomization ? MAX_RANDOMIZATION : 0,
            priceOracle: address(volatilityOracle)
        });
        
        return _configureTWAP(config);
    }

    function _configureTWAP(TWAPConfig memory config) internal returns (bytes32 configId) {
        // Validate configuration
        if (config.intervals == 0 || config.intervals > MAX_INTERVALS) revert InvalidTWAPConfig();
        if (config.totalAmount == 0) revert InvalidTWAPConfig();
        if (config.endTime <= config.startTime) revert InvalidTWAPConfig();
        if (config.maxPriceDeviation > BASIS_POINTS) revert InvalidTWAPConfig();
        
        uint256 intervalDuration = (config.endTime - config.startTime) / config.intervals;
        if (intervalDuration < MIN_INTERVAL_TIME) revert InvalidTWAPConfig();
        
        // Generate config ID
        configId = keccak256(abi.encode(config, msg.sender, block.timestamp));
        
        // Store configuration
        twapConfigs[configId] = config;
        
        // Initialize execution tracking
        TWAPExecution storage execution = twapExecutions[configId];
        execution.configId = configId;
        execution.intervalAmounts = new uint256[](config.intervals);
        
        emit TWAPConfigured(
            configId,
            config.totalAmount,
            config.intervals,
            config.startTime,
            config.endTime
        );
    }

    // ============ TWAP EXECUTION ============

    function executeTWAPInterval(
        bytes32 configId,
        uint256 currentPrice
    ) external returns (uint256 executedAmount) {
        return _executeTWAPInterval(configId, currentPrice);
    }

    function _executeTWAPInterval(
        bytes32 configId,
        uint256 currentPrice
    ) internal returns (uint256 executedAmount) {
        TWAPConfig memory config = twapConfigs[configId];
        TWAPExecution storage execution = twapExecutions[configId];
        
        // Validations
        if (block.timestamp < config.startTime) revert TWAPNotStarted();
        if (block.timestamp > config.endTime) revert TWAPExpired();
        if (execution.isPaused) revert TWAPIsPaused();
        if (execution.executedIntervals >= config.intervals) revert TWAPIsCompleted();
        
        // Check interval timing
        uint256 currentInterval = _getCurrentInterval(config, execution);
        if (currentInterval == execution.executedIntervals) revert IntervalNotReady();
        
        // Check volatility and pause if needed
        uint256 currentVolatility = volatilityOracle.getCurrentVolatility();
        if (currentVolatility > emergencyPauseThreshold) {
            execution.isPaused = true;
            emit TWAPPaused(configId, currentVolatility);
            revert TWAPIsPaused();
        }
        
        // Validate price deviation
        if (execution.lastExecutionPrice > 0) {
            uint256 priceDeviation = _calculatePriceDeviation(
                execution.lastExecutionPrice,
                currentPrice
            );
            if (priceDeviation > config.maxPriceDeviation) {
                revert PriceDeviationExceeded();
            }
        }
        
        // Calculate execution amount with MEV protection
        executedAmount = _calculateIntervalAmount(config, execution, currentInterval);
        
        // Update execution tracking
        IntervalData storage interval = intervalData[configId][currentInterval];
        interval.targetTime = config.startTime + (currentInterval * (config.endTime - config.startTime) / config.intervals);
        interval.actualTime = block.timestamp;
        interval.targetAmount = config.totalAmount / config.intervals;
        interval.actualAmount = executedAmount;
        interval.executionPrice = currentPrice;
        interval.randomSeed = _generateRandomSeed(configId, currentInterval);
        
        execution.executedAmount += executedAmount;
        execution.executedIntervals++;
        execution.lastExecutionTime = block.timestamp;
        execution.lastExecutionPrice = currentPrice;
        execution.intervalAmounts[currentInterval] = executedAmount;
        
        emit TWAPIntervalExecuted(
            configId,
            currentInterval,
            executedAmount,
            currentPrice,
            uint256(interval.randomSeed)
        );
        
        // Check if TWAP is completed
        if (execution.executedIntervals >= config.intervals) {
            uint256 averagePrice = _calculateAveragePrice(configId);
            emit TWAPCompleted(configId, execution.executedAmount, averagePrice);
        }
        
        emit StrategyExecuted(bytes32(0), StrategyType.TWAP, executedAmount, msg.sender);
    }

    // ============ TWAP MANAGEMENT ============

    function pauseTWAP(bytes32 configId) external {
        TWAPExecution storage execution = twapExecutions[configId];
        execution.isPaused = true;
        emit TWAPPaused(configId, volatilityOracle.getCurrentVolatility());
    }

    function resumeTWAP(bytes32 configId) external {
        TWAPExecution storage execution = twapExecutions[configId];
        execution.isPaused = false;
        emit TWAPResumed(configId);
    }

    function updateEmergencyThreshold(uint256 newThreshold) external {
        emergencyPauseThreshold = newThreshold;
    }

    // ============ VIEW FUNCTIONS ============

    function getTWAPStatus(bytes32 configId) external view returns (
        TWAPConfig memory config,
        TWAPExecution memory execution,
        uint256 nextIntervalTime,
        uint256 remainingAmount
    ) {
        config = twapConfigs[configId];
        execution = twapExecutions[configId];
        
        if (execution.executedIntervals < config.intervals) {
            uint256 intervalDuration = (config.endTime - config.startTime) / config.intervals;
            nextIntervalTime = config.startTime + ((execution.executedIntervals + 1) * intervalDuration);
        }
        
        remainingAmount = config.totalAmount - execution.executedAmount;
    }

    function getIntervalHistory(
        bytes32 configId,
        uint256 intervalIndex
    ) external view returns (IntervalData memory) {
        return intervalData[configId][intervalIndex];
    }

    function calculateNextIntervalAmount(
        bytes32 configId
    ) external view returns (uint256 amount, uint256 randomizedAmount) {
        TWAPConfig memory config = twapConfigs[configId];
        TWAPExecution memory execution = twapExecutions[configId];
        
        amount = config.totalAmount / config.intervals;
        
        if (config.enableRandomization) {
            bytes32 seed = _generateRandomSeed(configId, execution.executedIntervals);
            uint256 randomFactor = uint256(seed) % (config.randomizationFactor * 2);
            
            if (randomFactor < config.randomizationFactor) {
                // Reduce amount
                randomizedAmount = amount - (amount * randomFactor / BASIS_POINTS);
            } else {
                // Increase amount
                randomFactor = randomFactor - config.randomizationFactor;
                randomizedAmount = amount + (amount * randomFactor / BASIS_POINTS);
            }
        } else {
            randomizedAmount = amount;
        }
    }

    // ============ INTERNAL FUNCTIONS ============

    function _calculateTWAPAmount(
        bytes32 configId,
        IOrderMixin.Order calldata order,
        uint256 remainingAmount,
        bool isMaking
    ) internal view returns (uint256) {
        TWAPConfig memory config = twapConfigs[configId];
        TWAPExecution memory execution = twapExecutions[configId];
        
        if (execution.isPaused || execution.executedIntervals >= config.intervals) {
            return 0;
        }
        
        uint256 currentInterval = _getCurrentInterval(config, execution);
        if (currentInterval == execution.executedIntervals) {
            return 0; // Not ready for next interval
        }
        
        uint256 intervalAmount = _calculateIntervalAmount(config, execution, currentInterval);
        return intervalAmount > remainingAmount ? remainingAmount : intervalAmount;
    }

    function _getCurrentInterval(
        TWAPConfig memory config,
        TWAPExecution memory execution
    ) internal view returns (uint256) {
        if (block.timestamp >= config.endTime) {
            return config.intervals - 1;
        }
        
        uint256 elapsed = block.timestamp - config.startTime;
        uint256 totalDuration = config.endTime - config.startTime;
        return (elapsed * config.intervals) / totalDuration;
    }

    function _calculateIntervalAmount(
        TWAPConfig memory config,
        TWAPExecution memory execution,
        uint256 intervalIndex
    ) internal view returns (uint256) {
        uint256 baseAmount = config.totalAmount / config.intervals;
        
        // Handle remainder for last interval
        if (intervalIndex == config.intervals - 1) {
            return config.totalAmount - execution.executedAmount;
        }
        
        // Apply randomization for MEV protection
        if (config.enableRandomization) {
            bytes32 seed = _generateRandomSeed(execution.configId, intervalIndex);
            uint256 randomFactor = uint256(seed) % (config.randomizationFactor * 2);
            
            if (randomFactor < config.randomizationFactor) {
                // Reduce amount by up to randomizationFactor
                uint256 reduction = (baseAmount * randomFactor) / BASIS_POINTS;
                return baseAmount > reduction ? baseAmount - reduction : baseAmount / 2;
            } else {
                // Increase amount by up to randomizationFactor
                randomFactor = randomFactor - config.randomizationFactor;
                uint256 increase = (baseAmount * randomFactor) / BASIS_POINTS;
                return baseAmount + increase;
            }
        }
        
        // Apply volatility-based adjustment
        uint256 volatility = volatilityOracle.getCurrentVolatility();
        if (volatility > 1000) { // High volatility > 10%
            // Reduce execution size during high volatility
            uint256 reduction = (baseAmount * (volatility - 1000)) / BASIS_POINTS;
            return baseAmount > reduction ? baseAmount - reduction : baseAmount / 2;
        }
        
        return baseAmount;
    }

    function _generateRandomSeed(
        bytes32 configId,
        uint256 intervalIndex
    ) internal view returns (bytes32) {
        return keccak256(abi.encodePacked(
            configId,
            intervalIndex,
            block.timestamp,
            block.prevrandao,
            blockhash(block.number - 1)
        ));
    }

    function _calculatePriceDeviation(
        uint256 previousPrice,
        uint256 currentPrice
    ) internal pure returns (uint256) {
        uint256 diff = previousPrice > currentPrice 
            ? previousPrice - currentPrice 
            : currentPrice - previousPrice;
        return (diff * BASIS_POINTS) / previousPrice;
    }

    function _calculateAveragePrice(bytes32 configId) internal view returns (uint256) {
        TWAPExecution memory execution = twapExecutions[configId];
        uint256 totalPrice;
        uint256 count;
        
        for (uint256 i = 0; i < execution.executedIntervals; i++) {
            IntervalData memory interval = intervalData[configId][i];
            if (interval.executionPrice > 0) {
                totalPrice += interval.executionPrice;
                count++;
            }
        }
        
        return count > 0 ? totalPrice / count : 0;
    }
}