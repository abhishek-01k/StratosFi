// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../interfaces/IAdvancedStrategy.sol";
import "../interfaces/IAmountGetter.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title OptionsProtocol
 * @notice Revolutionary options trading on 1inch limit order execution rights
 * @dev Implements call and put options for limit order execution
 */
contract OptionsProtocol is IAdvancedStrategy, ReentrancyGuard {
    // ============ STRUCTS ============

    struct OptionData {
        bytes32 orderHash;          // Hash of underlying limit order
        uint256 strikePrice;        // Strike price in quote token
        uint256 expiration;         // Option expiration timestamp
        uint256 premium;            // Premium paid by option buyer
        bool isCall;                // true = call option, false = put option
        address holder;             // Option holder address
        address seller;             // Option seller address
        bool isExercised;          // Whether option has been exercised
        uint256 creationTime;       // Option creation timestamp
        uint256 collateral;         // Collateral amount locked
    }

    struct OptionGreeks {
        int256 delta;              // Price sensitivity
        int256 gamma;              // Delta sensitivity
        int256 theta;              // Time decay
        int256 vega;               // Volatility sensitivity
        uint256 intrinsicValue;    // Current intrinsic value
        uint256 timeValue;         // Current time value
    }

    // ============ CONSTANTS ============

    uint256 private constant BASIS_POINTS = 10_000;
    uint256 private constant EXERCISE_WINDOW = 1800; // 30 minutes before expiration
    uint256 private constant MIN_EXPIRATION = 300; // 5 minutes
    uint256 private constant MAX_EXPIRATION = 30 days;
    uint256 private constant PROTOCOL_FEE_BPS = 300; // 3%

    // ============ STATE VARIABLES ============

    mapping(bytes32 => OptionData) public options;
    mapping(bytes32 => bool) public exercisedOptions;
    mapping(address => uint256) public collateralBalances;
    
    uint256 public totalOptionsCreated;
    address public immutable feeCollector;
    
    // Price oracle interface (simplified for demo)
    address public priceOracle;

    // ============ EVENTS ============

    event OptionCreated(
        bytes32 indexed optionId,
        bytes32 indexed orderHash,
        address indexed holder,
        uint256 strikePrice,
        uint256 expiration,
        bool isCall
    );

    event OptionExercised(
        bytes32 indexed optionId,
        address indexed exerciser,
        uint256 profit,
        uint256 executionPrice
    );

    event OptionExpired(bytes32 indexed optionId);
    event CollateralDeposited(address indexed user, uint256 amount);
    event CollateralWithdrawn(address indexed user, uint256 amount);

    // ============ ERRORS ============

    error InvalidExpiration();
    error InvalidStrikePrice();
    error InsufficientPremium();
    error InsufficientCollateral();
    error OptionNotFound();
    error OptionHasExpired();
    error OptionAlreadyExercised();
    error NotOptionHolder();
    error NotInExerciseWindow();
    error ExerciseNotProfitable();

    // ============ CONSTRUCTOR ============

    constructor(address _feeCollector, address _priceOracle) {
        feeCollector = _feeCollector;
        priceOracle = _priceOracle;
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
        bytes32 optionId = abi.decode(extraData, (bytes32));
        OptionData memory option = options[optionId];
        
        // Validate option can be exercised
        if (!_canExercise(option, taker)) {
            return 0;
        }
        
        // Calculate profitable execution amount
        return _calculateProfitableAmount(order, option, takingAmount, remainingMakingAmount);
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
        bytes32 optionId = abi.decode(extraData, (bytes32));
        OptionData memory option = options[optionId];
        
        if (!_canExercise(option, taker)) {
            return 0;
        }
        
        return (makingAmount * order.takingAmount) / order.makingAmount;
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
    ) external override nonReentrant returns (uint256 executedAmount) {
        bytes32 optionId = abi.decode(strategyData, (bytes32));
        return _exerciseOption(optionId);
    }

    function validateStrategy(
        bytes32 orderHash,
        bytes calldata strategyData
    ) external view override returns (bool isValid) {
        bytes32 optionId = abi.decode(strategyData, (bytes32));
        OptionData memory option = options[optionId];
        return option.orderHash == orderHash && !option.isExercised;
    }

    function getStrategyGasEstimate(
        StrategyType strategyType
    ) external pure override returns (uint256) {
        if (strategyType == StrategyType.Options) {
            return 150_000;
        }
        return 0;
    }

    // ============ OPTION CREATION ============

    function createCallOption(
        bytes32 orderHash,
        uint256 strikePrice,
        uint256 expiration,
        uint256 premium
    ) external payable returns (bytes32 optionId) {
        _validateOptionParameters(strikePrice, expiration, premium);
        
        optionId = keccak256(abi.encode(orderHash, msg.sender, block.timestamp, totalOptionsCreated++));
        
        OptionData memory option = OptionData({
            orderHash: orderHash,
            strikePrice: strikePrice,
            expiration: expiration,
            premium: premium,
            isCall: true,
            holder: msg.sender,
            seller: address(0), // Will be set when someone sells the option
            isExercised: false,
            creationTime: block.timestamp,
            collateral: 0
        });
        
        options[optionId] = option;
        _processPremiumPayment(premium);
        
        emit OptionCreated(optionId, orderHash, msg.sender, strikePrice, expiration, true);
    }

    function createPutOption(
        bytes32 orderHash,
        uint256 strikePrice,
        uint256 expiration,
        uint256 premium
    ) external payable returns (bytes32 optionId) {
        _validateOptionParameters(strikePrice, expiration, premium);
        
        optionId = keccak256(abi.encode(orderHash, msg.sender, block.timestamp, totalOptionsCreated++));
        
        OptionData memory option = OptionData({
            orderHash: orderHash,
            strikePrice: strikePrice,
            expiration: expiration,
            premium: premium,
            isCall: false,
            holder: msg.sender,
            seller: address(0),
            isExercised: false,
            creationTime: block.timestamp,
            collateral: 0
        });
        
        options[optionId] = option;
        _processPremiumPayment(premium);
        
        emit OptionCreated(optionId, orderHash, msg.sender, strikePrice, expiration, false);
    }

    // ============ OPTION EXERCISE ============

    function exerciseOption(bytes32 optionId) external nonReentrant returns (uint256 profit) {
        return _exerciseOption(optionId);
    }

    function _exerciseOption(bytes32 optionId) internal returns (uint256 profit) {
        OptionData storage option = options[optionId];
        
        if (option.holder == address(0)) revert OptionNotFound();
        if (option.holder != msg.sender) revert NotOptionHolder();
        if (option.isExercised) revert OptionAlreadyExercised();
        if (block.timestamp > option.expiration) revert OptionHasExpired();
        if (block.timestamp < option.expiration - EXERCISE_WINDOW) revert NotInExerciseWindow();
        
        uint256 currentPrice = _getCurrentPrice(option.orderHash);
        
        if (option.isCall) {
            if (currentPrice <= option.strikePrice) revert ExerciseNotProfitable();
            profit = currentPrice - option.strikePrice;
        } else {
            if (currentPrice >= option.strikePrice) revert ExerciseNotProfitable();
            profit = option.strikePrice - currentPrice;
        }
        
        option.isExercised = true;
        exercisedOptions[optionId] = true;
        
        // Transfer profit to option holder
        _transferProfit(option.holder, profit);
        
        emit OptionExercised(optionId, msg.sender, profit, currentPrice);
    }

    // ============ OPTION PRICING ============

    function calculateOptionPremium(
        bytes32 orderHash,
        uint256 strikePrice,
        uint256 expiration,
        bool isCall,
        uint256 currentVolatility
    ) external view returns (uint256 premium) {
        uint256 currentPrice = _getCurrentPrice(orderHash);
        uint256 timeToExpiration = expiration > block.timestamp ? expiration - block.timestamp : 0;
        
        // Simplified Black-Scholes approximation
        uint256 intrinsicValue = isCall
            ? (currentPrice > strikePrice ? currentPrice - strikePrice : 0)
            : (strikePrice > currentPrice ? strikePrice - currentPrice : 0);
            
        uint256 timeValue = (currentVolatility * timeToExpiration * currentPrice) / (365 days * BASIS_POINTS);
        
        premium = intrinsicValue + timeValue;
    }

    function getOptionGreeks(bytes32 optionId) external view returns (OptionGreeks memory greeks) {
        OptionData memory option = options[optionId];
        if (option.holder == address(0)) revert OptionNotFound();
        
        uint256 currentPrice = _getCurrentPrice(option.orderHash);
        uint256 timeToExpiration = option.expiration > block.timestamp ? option.expiration - block.timestamp : 0;
        
        // Simplified Greeks calculation
        greeks.intrinsicValue = option.isCall
            ? (currentPrice > option.strikePrice ? currentPrice - option.strikePrice : 0)
            : (option.strikePrice > currentPrice ? option.strikePrice - currentPrice : 0);
            
        greeks.timeValue = option.premium > greeks.intrinsicValue ? option.premium - greeks.intrinsicValue : 0;
        
        // Simplified Greeks (would use proper formulas in production)
        greeks.delta = option.isCall ? int256(6000) : int256(-4000); // ±0.6/0.4
        greeks.gamma = int256(100); // 0.01
        greeks.theta = timeToExpiration > 0 ? -int256(greeks.timeValue / timeToExpiration) : int256(0);
        greeks.vega = int256(200); // 0.02
    }

    // ============ COLLATERAL MANAGEMENT ============

    function depositCollateral() external payable {
        collateralBalances[msg.sender] += msg.value;
        emit CollateralDeposited(msg.sender, msg.value);
    }

    function withdrawCollateral(uint256 amount) external nonReentrant {
        if (collateralBalances[msg.sender] < amount) revert InsufficientCollateral();
        
        collateralBalances[msg.sender] -= amount;
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
        
        emit CollateralWithdrawn(msg.sender, amount);
    }

    // ============ INTERNAL FUNCTIONS ============

    function _validateOptionParameters(
        uint256 strikePrice,
        uint256 expiration,
        uint256 premium
    ) internal view {
        if (strikePrice == 0) revert InvalidStrikePrice();
        if (expiration < block.timestamp + MIN_EXPIRATION) revert InvalidExpiration();
        if (expiration > block.timestamp + MAX_EXPIRATION) revert InvalidExpiration();
        if (premium == 0) revert InsufficientPremium();
    }

    function _canExercise(OptionData memory option, address exerciser) internal view returns (bool) {
        return option.holder == exerciser &&
               !option.isExercised &&
               block.timestamp >= option.expiration - EXERCISE_WINDOW &&
               block.timestamp <= option.expiration;
    }

    function _calculateProfitableAmount(
        IOrderMixin.Order calldata order,
        OptionData memory option,
        uint256 requestedTaking,
        uint256 remainingMaking
    ) internal pure returns (uint256) {
        // Calculate the amount that would be profitable to execute
        uint256 maxProfitableAmount = (requestedTaking * order.makingAmount) / order.takingAmount;
        return maxProfitableAmount > remainingMaking ? remainingMaking : maxProfitableAmount;
    }

    function _getCurrentPrice(bytes32 orderHash) internal view returns (uint256) {
        // In production, this would query a proper oracle
        // For demo, return a mock price
        return 2000 * 1e18; // $2000
    }

    function _processPremiumPayment(uint256 premium) internal {
        require(msg.value >= premium, "Insufficient payment");
        
        uint256 protocolFee = (premium * PROTOCOL_FEE_BPS) / BASIS_POINTS;
        uint256 sellerAmount = premium - protocolFee;
        
        // Transfer protocol fee
        (bool success1, ) = feeCollector.call{value: protocolFee}("");
        require(success1, "Protocol fee transfer failed");
        
        // In production, transfer to option seller
        // For now, keep in contract
    }

    function _transferProfit(address recipient, uint256 amount) internal {
        // In production, this would handle the actual profit transfer
        // For demo, we'll emit an event
        emit StrategyExecuted(bytes32(0), StrategyType.Options, amount, recipient);
    }
}