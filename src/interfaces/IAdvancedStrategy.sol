// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./IOrderMixin.sol";
import "./IAmountGetter.sol";

/**
 * @title IAdvancedStrategy - Extended Strategy Interface
 * @notice Interface for advanced trading strategies on 1inch
 */
interface IAdvancedStrategy is IAmountGetter {
    // Strategy types
    enum StrategyType {
        Options,
        ConcentratedLiquidity,
        TWAP,
        Volatility,
        Combined
    }

    // Common strategy configuration
    struct StrategyConfig {
        StrategyType strategyType;
        bool isActive;
        uint256 minExecutionAmount;
        uint256 maxExecutionAmount;
        address oracle;
        bytes additionalData;
    }

    // Events
    event StrategyExecuted(
        bytes32 indexed orderHash,
        StrategyType strategyType,
        uint256 executedAmount,
        address executor
    );

    event StrategyConfigured(
        bytes32 indexed configId,
        StrategyType strategyType,
        address indexed creator
    );

    // Functions
    function configureStrategy(StrategyConfig calldata config) external returns (bytes32 configId);
    function executeStrategy(bytes32 orderHash, bytes calldata strategyData) external returns (uint256 executedAmount);
    function validateStrategy(bytes32 orderHash, bytes calldata strategyData) external view returns (bool isValid);
    function getStrategyGasEstimate(StrategyType strategyType) external pure returns (uint256 gasEstimate);
}