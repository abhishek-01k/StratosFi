// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../interfaces/IAdvancedStrategy.sol";
import "../interfaces/IAmountGetter.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

/**
 * @title ConcentratedLiquidityHook
 * @notice Uniswap V3-style concentrated liquidity ranges for 1inch limit orders
 * @dev Implements dynamic liquidity provision within specific price ranges
 */
contract ConcentratedLiquidityHook is IAdvancedStrategy {

    // ============ STRUCTS ============

    struct LiquidityRange {
        int24 tickLower;           // Lower price tick
        int24 tickUpper;           // Upper price tick
        uint256 liquidity;         // Amount of liquidity in range
        uint256 feeGrowthInside0;  // Fee growth inside range for token0
        uint256 feeGrowthInside1;  // Fee growth inside range for token1
        uint256 tokensOwed0;       // Uncollected fees for token0
        uint256 tokensOwed1;       // Uncollected fees for token1
    }

    struct LiquidityPosition {
        bytes32 orderHash;         // Associated limit order
        address owner;             // Position owner
        uint24 feeTier;           // Fee tier (500 = 0.05%, 3000 = 0.3%, 10000 = 1%)
        LiquidityRange range;      // Price range details
        uint256 createdAt;         // Position creation time
        uint256 lastUpdate;        // Last update timestamp
        bool isActive;             // Whether position is active
    }

    struct ConcentratedLiquidityParams {
        int24 tickLower;
        int24 tickUpper;
        uint24 feeTier;
        uint256 amount0Desired;
        uint256 amount1Desired;
        uint256 amount0Min;
        uint256 amount1Min;
        address recipient;
        uint256 deadline;
    }

    struct LiquidityConfig {
        int24 defaultTickSpacing;
        uint256 maxPositionsPerOrder;
        uint256 minLiquidityAmount;
    }

    // ============ CONSTANTS ============

    uint256 private constant Q96 = 2**96;
    uint256 private constant Q128 = 2**128;
    int24 private constant MIN_TICK = -887272;
    int24 private constant MAX_TICK = 887272;
    int24 private constant TICK_SPACING = 60;
    
    // Fee tiers
    uint24 private constant FEE_LOW = 500;      // 0.05%
    uint24 private constant FEE_MEDIUM = 3000;  // 0.3%
    uint24 private constant FEE_HIGH = 10000;   // 1%

    // ============ STATE VARIABLES ============

    mapping(bytes32 => LiquidityPosition) public positions;
    mapping(address => bytes32[]) public userPositions;
    mapping(uint24 => bool) public validFeeTiers;
    
    uint256 public totalPositions;
    uint256 public globalFeeGrowth0;
    uint256 public globalFeeGrowth1;
    
    // Current price (sqrtPriceX96)
    uint160 public sqrtPriceX96;
    int24 public currentTick;

    // ============ EVENTS ============

    event LiquidityAdded(
        bytes32 indexed positionId,
        address indexed owner,
        int24 tickLower,
        int24 tickUpper,
        uint256 liquidity,
        uint256 amount0,
        uint256 amount1
    );

    event LiquidityRemoved(
        bytes32 indexed positionId,
        address indexed owner,
        uint256 liquidity,
        uint256 amount0,
        uint256 amount1
    );

    event FeesCollected(
        bytes32 indexed positionId,
        address indexed owner,
        uint256 amount0,
        uint256 amount1
    );

    event RangeOrderExecuted(
        bytes32 indexed orderHash,
        int24 tickCurrent,
        uint256 executedAmount
    );

    // ============ ERRORS ============

    error InvalidTickRange();
    error InvalidFeeTier();
    error PositionNotFound();
    error NotPositionOwner();
    error PositionInactive();
    error InvalidLiquidity();
    error SlippageExceeded();
    error DeadlineExceeded();

    // ============ CONSTRUCTOR ============

    constructor() {
        validFeeTiers[FEE_LOW] = true;
        validFeeTiers[FEE_MEDIUM] = true;
        validFeeTiers[FEE_HIGH] = true;
        
        // Initialize with a default price (can be updated by oracle)
        sqrtPriceX96 = 1771595571142710102694207168000; // ~$2000 ETH/USDC
        currentTick = 82493;
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
        ConcentratedLiquidityParams memory params = abi.decode(extraData, (ConcentratedLiquidityParams));
        
        // Check if current tick is within range
        if (currentTick < params.tickLower || currentTick > params.tickUpper) {
            return 0; // Out of range, no execution
        }
        
        // Calculate amount based on concentrated liquidity position
        return _calculateInRangeAmount(order, params, takingAmount, remainingMakingAmount, true);
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
        ConcentratedLiquidityParams memory params = abi.decode(extraData, (ConcentratedLiquidityParams));
        
        if (currentTick < params.tickLower || currentTick > params.tickUpper) {
            return 0;
        }
        
        return _calculateInRangeAmount(order, params, makingAmount, remainingMakingAmount, false);
    }

    // ============ STRATEGY INTERFACE ============

    function configureStrategy(
        StrategyConfig calldata config
    ) external override returns (bytes32 configId) {
        configId = keccak256(abi.encode(config, block.timestamp, msg.sender));
        emit StrategyConfigured(configId, config.strategyType, msg.sender);
    }

    function executeStrategy(
        bytes32 orderHash,
        bytes calldata strategyData
    ) external override returns (uint256 executedAmount) {
        ConcentratedLiquidityParams memory params = abi.decode(strategyData, (ConcentratedLiquidityParams));
        
        // Execute concentrated liquidity strategy
        executedAmount = _executeLiquidityOrder(orderHash, params);
        
        emit RangeOrderExecuted(orderHash, currentTick, executedAmount);
    }

    function validateStrategy(
        bytes32 orderHash,
        bytes calldata strategyData
    ) external view override returns (bool isValid) {
        ConcentratedLiquidityParams memory params = abi.decode(strategyData, (ConcentratedLiquidityParams));
        
        // Validate tick range
        if (params.tickLower >= params.tickUpper) return false;
        if (params.tickLower < MIN_TICK || params.tickUpper > MAX_TICK) return false;
        
        // Validate fee tier
        if (!validFeeTiers[params.feeTier]) return false;
        
        // Check if in range
        if (currentTick < params.tickLower || currentTick > params.tickUpper) return false;
        
        return true;
    }

    function getStrategyGasEstimate(
        StrategyType strategyType
    ) external pure override returns (uint256) {
        if (strategyType == StrategyType.ConcentratedLiquidity) {
            return 200_000;
        }
        return 0;
    }

    // ============ LIQUIDITY MANAGEMENT ============

    function addLiquidity(
        bytes32 orderHash,
        ConcentratedLiquidityParams calldata params
    ) external returns (bytes32 positionId, uint256 liquidity, uint256 amount0, uint256 amount1) {
        if (params.deadline < block.timestamp) revert DeadlineExceeded();
        _validateTickRange(params.tickLower, params.tickUpper);
        if (!validFeeTiers[params.feeTier]) revert InvalidFeeTier();
        
        // Calculate liquidity amount
        (liquidity, amount0, amount1) = _calculateLiquidityAmounts(params);
        
        if (amount0 < params.amount0Min || amount1 < params.amount1Min) {
            revert SlippageExceeded();
        }
        
        // Create position
        positionId = keccak256(abi.encode(orderHash, msg.sender, totalPositions++));
        
        LiquidityPosition storage position = positions[positionId];
        position.orderHash = orderHash;
        position.owner = msg.sender;
        position.feeTier = params.feeTier;
        position.range.tickLower = params.tickLower;
        position.range.tickUpper = params.tickUpper;
        position.range.liquidity = liquidity;
        position.createdAt = block.timestamp;
        position.lastUpdate = block.timestamp;
        position.isActive = true;
        
        userPositions[msg.sender].push(positionId);
        
        emit LiquidityAdded(positionId, msg.sender, params.tickLower, params.tickUpper, liquidity, amount0, amount1);
    }

    function removeLiquidity(
        bytes32 positionId,
        uint128 liquidityToRemove
    ) external returns (uint256 amount0, uint256 amount1) {
        LiquidityPosition storage position = positions[positionId];
        
        if (position.owner != msg.sender) revert NotPositionOwner();
        if (!position.isActive) revert PositionInactive();
        if (liquidityToRemove > position.range.liquidity) revert InvalidLiquidity();
        
        // Calculate amounts to return
        (amount0, amount1) = _calculateRemoveLiquidityAmounts(position, liquidityToRemove);
        
        // Update position
        position.range.liquidity = position.range.liquidity - liquidityToRemove;
        if (position.range.liquidity == 0) {
            position.isActive = false;
        }
        position.lastUpdate = block.timestamp;
        
        emit LiquidityRemoved(positionId, msg.sender, liquidityToRemove, amount0, amount1);
    }

    function collectFees(bytes32 positionId) external returns (uint256 amount0, uint256 amount1) {
        LiquidityPosition storage position = positions[positionId];
        
        if (position.owner != msg.sender) revert NotPositionOwner();
        
        amount0 = position.range.tokensOwed0;
        amount1 = position.range.tokensOwed1;
        
        position.range.tokensOwed0 = 0;
        position.range.tokensOwed1 = 0;
        
        emit FeesCollected(positionId, msg.sender, amount0, amount1);
    }

    // ============ VIEW FUNCTIONS ============

    function getPosition(bytes32 positionId) external view returns (LiquidityPosition memory) {
        return positions[positionId];
    }

    function getUserPositions(address user) external view returns (bytes32[] memory) {
        return userPositions[user];
    }

    function tickToPrice(int24 tick) public pure returns (uint256 price) {
        // price = 1.0001^tick
        uint256 absTick = tick < 0 ? uint256(-int256(tick)) : uint256(int256(tick));
        uint256 ratio = absTick & 0x1 != 0 ? 0xfffcb933bd6fad37aa2d162d1a594001 : 0x100000000000000000000000000000000;
        
        if (absTick & 0x2 != 0) ratio = (ratio * 0xfff97272373d413259a46990580e213a) >> 128;
        if (absTick & 0x4 != 0) ratio = (ratio * 0xfff2e50f5f656932ef12357cf3c7fdcc) >> 128;
        if (absTick & 0x8 != 0) ratio = (ratio * 0xffe5caca7e10e4e61c3624eaa0941cd0) >> 128;
        if (absTick & 0x10 != 0) ratio = (ratio * 0xffcb9843d60f6159c9db58835c926644) >> 128;
        if (absTick & 0x20 != 0) ratio = (ratio * 0xff973b41fa98c081472e6896dfb254c0) >> 128;
        if (absTick & 0x40 != 0) ratio = (ratio * 0xff2ea16466c96a3843ec78b326b52861) >> 128;
        if (absTick & 0x80 != 0) ratio = (ratio * 0xfe5dee046a99a2a811c461f1969c3053) >> 128;
        
        if (tick > 0) ratio = type(uint256).max / ratio;
        
        price = (ratio * 1e18) >> 96;
    }

    function getOptimalFeeTier(uint256 volatility) external pure returns (uint24 feeTier) {
        if (volatility < 1000) {  // Low volatility < 10%
            return FEE_LOW;       // 0.05%
        } else if (volatility < 5000) {  // Medium volatility < 50%
            return FEE_MEDIUM;    // 0.3%
        } else {
            return FEE_HIGH;      // 1%
        }
    }

    // ============ INTERNAL FUNCTIONS ============

    function _validateTickRange(int24 tickLower, int24 tickUpper) internal pure {
        if (tickLower >= tickUpper) revert InvalidTickRange();
        if (tickLower < MIN_TICK || tickUpper > MAX_TICK) revert InvalidTickRange();
        if (tickLower % TICK_SPACING != 0 || tickUpper % TICK_SPACING != 0) revert InvalidTickRange();
    }

    function _calculateLiquidityAmounts(
        ConcentratedLiquidityParams memory params
    ) internal view returns (uint256 liquidity, uint256 amount0, uint256 amount1) {
        // Simplified liquidity calculation
        uint160 sqrtRatioA = _getSqrtRatioAtTick(params.tickLower);
        uint160 sqrtRatioB = _getSqrtRatioAtTick(params.tickUpper);
        
        if (currentTick < params.tickLower) {
            // All in token0
            liquidity = _getLiquidityForAmount0(sqrtRatioA, sqrtRatioB, params.amount0Desired);
            amount0 = params.amount0Desired;
            amount1 = 0;
        } else if (currentTick < params.tickUpper) {
            // In range
            uint256 liquidity0 = _getLiquidityForAmount0(sqrtPriceX96, sqrtRatioB, params.amount0Desired);
            uint256 liquidity1 = _getLiquidityForAmount1(sqrtRatioA, sqrtPriceX96, params.amount1Desired);
            liquidity = liquidity0 < liquidity1 ? liquidity0 : liquidity1;
            amount0 = _getAmount0ForLiquidity(sqrtPriceX96, sqrtRatioB, liquidity);
            amount1 = _getAmount1ForLiquidity(sqrtRatioA, sqrtPriceX96, liquidity);
        } else {
            // All in token1
            liquidity = _getLiquidityForAmount1(sqrtRatioA, sqrtRatioB, params.amount1Desired);
            amount0 = 0;
            amount1 = params.amount1Desired;
        }
    }

    function _calculateRemoveLiquidityAmounts(
        LiquidityPosition memory position,
        uint128 liquidityToRemove
    ) internal view returns (uint256 amount0, uint256 amount1) {
        uint160 sqrtRatioA = _getSqrtRatioAtTick(position.range.tickLower);
        uint160 sqrtRatioB = _getSqrtRatioAtTick(position.range.tickUpper);
        
        amount0 = _getAmount0ForLiquidity(sqrtRatioA, sqrtRatioB, liquidityToRemove);
        amount1 = _getAmount1ForLiquidity(sqrtRatioA, sqrtRatioB, liquidityToRemove);
    }

    function _calculateInRangeAmount(
        IOrderMixin.Order calldata order,
        ConcentratedLiquidityParams memory params,
        uint256 requestedAmount,
        uint256 remainingAmount,
        bool isMaking
    ) internal view returns (uint256) {
        // Calculate optimal execution amount within the concentrated liquidity range
        uint256 liquidityAvailable = _getLiquidityInRange(params.tickLower, params.tickUpper);
        uint256 maxExecutable = (liquidityAvailable * params.feeTier) / 1e6;
        
        uint256 optimalAmount = requestedAmount < maxExecutable ? requestedAmount : maxExecutable;
        return optimalAmount < remainingAmount ? optimalAmount : remainingAmount;
    }

    function _executeLiquidityOrder(
        bytes32 orderHash,
        ConcentratedLiquidityParams memory params
    ) internal returns (uint256 executedAmount) {
        // Simulate execution within concentrated liquidity range
        // For now, just return the desired amount if in range
        if (currentTick >= params.tickLower && currentTick <= params.tickUpper) {
            executedAmount = params.amount0Desired;
        } else {
            executedAmount = 0;
        }
        
        emit StrategyExecuted(orderHash, StrategyType.ConcentratedLiquidity, executedAmount, msg.sender);
    }

    function _getSqrtRatioAtTick(int24 tick) internal pure returns (uint160 sqrtPriceX96_) {
        uint256 absTick = tick < 0 ? uint256(-int256(tick)) : uint256(int256(tick));
        require(absTick <= uint256(int256(MAX_TICK)), "T");

        uint256 ratio = absTick & 0x1 != 0 ? 0xfffcb933bd6fad37aa2d162d1a594001 : 0x100000000000000000000000000000000;
        if (absTick & 0x2 != 0) ratio = (ratio * 0xfff97272373d413259a46990580e213a) >> 128;
        if (absTick & 0x4 != 0) ratio = (ratio * 0xfff2e50f5f656932ef12357cf3c7fdcc) >> 128;
        if (absTick & 0x8 != 0) ratio = (ratio * 0xffe5caca7e10e4e61c3624eaa0941cd0) >> 128;
        if (absTick & 0x10 != 0) ratio = (ratio * 0xffcb9843d60f6159c9db58835c926644) >> 128;
        if (absTick & 0x20 != 0) ratio = (ratio * 0xff973b41fa98c081472e6896dfb254c0) >> 128;
        if (absTick & 0x40 != 0) ratio = (ratio * 0xff2ea16466c96a3843ec78b326b52861) >> 128;
        if (absTick & 0x80 != 0) ratio = (ratio * 0xfe5dee046a99a2a811c461f1969c3053) >> 128;
        if (absTick & 0x100 != 0) ratio = (ratio * 0xfcbe86c7900a88aedcffc83b479aa3a4) >> 128;
        if (absTick & 0x200 != 0) ratio = (ratio * 0xf987a7253ac413176f2b074cf7815e54) >> 128;
        if (absTick & 0x400 != 0) ratio = (ratio * 0xf3392b0822b70005940c7a398e4b70f3) >> 128;
        if (absTick & 0x800 != 0) ratio = (ratio * 0xe7159475a2c29b7443b29c7fa6e889d9) >> 128;
        if (absTick & 0x1000 != 0) ratio = (ratio * 0xd097f3bdfd2022b8845ad8f792aa5825) >> 128;
        if (absTick & 0x2000 != 0) ratio = (ratio * 0xa9f746462d870fdf8a65dc1f90e061e5) >> 128;
        if (absTick & 0x4000 != 0) ratio = (ratio * 0x70d869a156d2a1b890bb3df62baf32f7) >> 128;
        if (absTick & 0x8000 != 0) ratio = (ratio * 0x31be135f97d08fd981231505542fcfa6) >> 128;
        if (absTick & 0x10000 != 0) ratio = (ratio * 0x9aa508b5b7a84e1c677de54f3e99bc9) >> 128;
        if (absTick & 0x20000 != 0) ratio = (ratio * 0x5d6af8dedb81196699c329225ee604) >> 128;
        if (absTick & 0x40000 != 0) ratio = (ratio * 0x2216e584f5fa1ea926041bedfe98) >> 128;
        if (absTick & 0x80000 != 0) ratio = (ratio * 0x48a170391f7dc42444e8fa2) >> 128;

        if (tick > 0) ratio = type(uint256).max / ratio;

        sqrtPriceX96_ = uint160((ratio >> 32) + (ratio % (1 << 32) == 0 ? 0 : 1));
    }

    function _getLiquidityForAmount0(
        uint160 sqrtRatioAX96,
        uint160 sqrtRatioBX96,
        uint256 amount0
    ) internal pure returns (uint256 liquidity) {
        if (sqrtRatioAX96 > sqrtRatioBX96) (sqrtRatioAX96, sqrtRatioBX96) = (sqrtRatioBX96, sqrtRatioAX96);
        uint256 intermediate = (uint256(sqrtRatioAX96) * uint256(sqrtRatioBX96)) / Q96;
        return (amount0 * intermediate) / (uint256(sqrtRatioBX96) - uint256(sqrtRatioAX96));
    }

    function _getLiquidityForAmount1(
        uint160 sqrtRatioAX96,
        uint160 sqrtRatioBX96,
        uint256 amount1
    ) internal pure returns (uint256 liquidity) {
        if (sqrtRatioAX96 > sqrtRatioBX96) (sqrtRatioAX96, sqrtRatioBX96) = (sqrtRatioBX96, sqrtRatioAX96);
        return (amount1 * Q96) / (uint256(sqrtRatioBX96) - uint256(sqrtRatioAX96));
    }

    function _getAmount0ForLiquidity(
        uint160 sqrtRatioAX96,
        uint160 sqrtRatioBX96,
        uint256 liquidity
    ) internal pure returns (uint256 amount0) {
        if (sqrtRatioAX96 > sqrtRatioBX96) (sqrtRatioAX96, sqrtRatioBX96) = (sqrtRatioBX96, sqrtRatioAX96);
        return (liquidity * (uint256(sqrtRatioBX96) - uint256(sqrtRatioAX96))) / 
               ((uint256(sqrtRatioAX96) * uint256(sqrtRatioBX96)) / Q96);
    }

    function _getAmount1ForLiquidity(
        uint160 sqrtRatioAX96,
        uint160 sqrtRatioBX96,
        uint256 liquidity
    ) internal pure returns (uint256 amount1) {
        if (sqrtRatioAX96 > sqrtRatioBX96) (sqrtRatioAX96, sqrtRatioBX96) = (sqrtRatioBX96, sqrtRatioAX96);
        return (liquidity * (uint256(sqrtRatioBX96) - uint256(sqrtRatioAX96))) / Q96;
    }

    function _getLiquidityInRange(int24 tickLower, int24 tickUpper) internal view returns (uint256) {
        // Simplified: return mock liquidity
        return 1000000 * 1e18;
    }
}