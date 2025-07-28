// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title VolatilityOracle
 * @notice Real-time volatility tracking and risk assessment
 * @dev Provides volatility data for dynamic strategy adjustments
 */
contract VolatilityOracle {
    // ============ STRUCTS ============

    struct VolatilityData {
        uint256 currentVolatility;     // Current volatility in basis points
        uint256 baselineVolatility;    // Expected normal volatility
        uint256 lastUpdateTime;        // Last update timestamp
        uint256 updateCount;           // Number of updates
        uint256[] historicalValues;    // Historical volatility values
    }

    struct RiskMetrics {
        uint256 riskScore;            // 0-1000 risk score
        bool isHighRisk;              // High risk flag
        uint256 adjustmentFactor;     // Position size adjustment factor
        uint256 recommendedInterval;  // Recommended TWAP interval
    }

    // ============ CONSTANTS ============

    uint256 private constant BASIS_POINTS = 10_000;
    uint256 private constant HISTORY_SIZE = 24; // 24 hours of hourly data
    uint256 private constant UPDATE_INTERVAL = 3600; // 1 hour
    uint256 private constant STALE_THRESHOLD = 7200; // 2 hours

    // Risk thresholds
    uint256 private constant LOW_VOLATILITY = 200;     // 2%
    uint256 private constant NORMAL_VOLATILITY = 500;  // 5%
    uint256 private constant HIGH_VOLATILITY = 1200;   // 12%
    uint256 private constant EXTREME_VOLATILITY = 2000; // 20%

    // ============ STATE VARIABLES ============

    VolatilityData public volatilityData;
    mapping(address => bool) public authorizedUpdaters;
    address public owner;

    // ============ EVENTS ============

    event VolatilityUpdated(uint256 newVolatility, uint256 timestamp);
    event UpdaterAuthorized(address updater);
    event UpdaterDeauthorized(address updater);

    // ============ MODIFIERS ============

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyAuthorized() {
        require(authorizedUpdaters[msg.sender] || msg.sender == owner, "Not authorized");
        _;
    }

    // ============ CONSTRUCTOR ============

    constructor() {
        owner = msg.sender;
        
        // Initialize with default values
        volatilityData.baselineVolatility = NORMAL_VOLATILITY;
        volatilityData.currentVolatility = NORMAL_VOLATILITY;
        volatilityData.lastUpdateTime = block.timestamp;
        volatilityData.historicalValues = new uint256[](HISTORY_SIZE);
        
        // Fill historical values with baseline
        for (uint256 i = 0; i < HISTORY_SIZE; i++) {
            volatilityData.historicalValues[i] = NORMAL_VOLATILITY;
        }
    }

    // ============ MAIN FUNCTIONS ============

    function updateVolatility(uint256 newVolatility) external onlyAuthorized {
        require(newVolatility <= BASIS_POINTS, "Invalid volatility");
        require(block.timestamp >= volatilityData.lastUpdateTime + UPDATE_INTERVAL, "Too frequent");
        
        // Update current volatility
        volatilityData.currentVolatility = newVolatility;
        volatilityData.lastUpdateTime = block.timestamp;
        volatilityData.updateCount++;
        
        // Update historical values (circular buffer)
        uint256 index = volatilityData.updateCount % HISTORY_SIZE;
        volatilityData.historicalValues[index] = newVolatility;
        
        emit VolatilityUpdated(newVolatility, block.timestamp);
    }

    function getCurrentVolatility() external view returns (uint256) {
        if (isStale()) {
            // Return higher volatility if data is stale (conservative approach)
            return volatilityData.currentVolatility * 150 / 100;
        }
        return volatilityData.currentVolatility;
    }

    function getRiskMetrics() external view returns (RiskMetrics memory metrics) {
        uint256 volatility = volatilityData.currentVolatility;
        
        // Calculate risk score (0-1000)
        if (volatility <= LOW_VOLATILITY) {
            metrics.riskScore = 100;
        } else if (volatility <= NORMAL_VOLATILITY) {
            metrics.riskScore = 100 + ((volatility - LOW_VOLATILITY) * 400) / (NORMAL_VOLATILITY - LOW_VOLATILITY);
        } else if (volatility <= HIGH_VOLATILITY) {
            metrics.riskScore = 500 + ((volatility - NORMAL_VOLATILITY) * 300) / (HIGH_VOLATILITY - NORMAL_VOLATILITY);
        } else if (volatility <= EXTREME_VOLATILITY) {
            metrics.riskScore = 800 + ((volatility - HIGH_VOLATILITY) * 200) / (EXTREME_VOLATILITY - HIGH_VOLATILITY);
        } else {
            metrics.riskScore = 1000;
        }
        
        metrics.isHighRisk = volatility > HIGH_VOLATILITY;
        
        // Calculate adjustment factor (50-150%)
        if (volatility <= NORMAL_VOLATILITY) {
            // Low volatility: increase position size
            metrics.adjustmentFactor = 100 + ((NORMAL_VOLATILITY - volatility) * 50) / NORMAL_VOLATILITY;
        } else {
            // High volatility: decrease position size
            uint256 reduction = ((volatility - NORMAL_VOLATILITY) * 50) / NORMAL_VOLATILITY;
            metrics.adjustmentFactor = reduction > 50 ? 50 : 100 - reduction;
        }
        
        // Calculate recommended TWAP interval (in seconds)
        if (volatility <= LOW_VOLATILITY) {
            metrics.recommendedInterval = 3600; // 1 hour
        } else if (volatility <= NORMAL_VOLATILITY) {
            metrics.recommendedInterval = 1800; // 30 minutes
        } else if (volatility <= HIGH_VOLATILITY) {
            metrics.recommendedInterval = 600; // 10 minutes
        } else {
            metrics.recommendedInterval = 300; // 5 minutes (fast execution)
        }
    }

    function getVolatilityTrend() external view returns (
        bool isIncreasing,
        uint256 trendStrength,
        uint256 averageVolatility
    ) {
        uint256 recentAverage = _calculateAverage(0, HISTORY_SIZE / 2);
        uint256 olderAverage = _calculateAverage(HISTORY_SIZE / 2, HISTORY_SIZE);
        
        isIncreasing = recentAverage > olderAverage;
        
        if (isIncreasing) {
            trendStrength = ((recentAverage - olderAverage) * 100) / olderAverage;
        } else {
            trendStrength = ((olderAverage - recentAverage) * 100) / olderAverage;
        }
        
        averageVolatility = (recentAverage + olderAverage) / 2;
    }

    function getHistoricalVolatility(uint256 hoursBack) external view returns (uint256[] memory) {
        require(hoursBack <= HISTORY_SIZE, "Too far back");
        
        uint256[] memory history = new uint256[](hoursBack);
        uint256 startIndex = volatilityData.updateCount > hoursBack 
            ? volatilityData.updateCount - hoursBack 
            : 0;
            
        for (uint256 i = 0; i < hoursBack; i++) {
            uint256 index = (startIndex + i) % HISTORY_SIZE;
            history[i] = volatilityData.historicalValues[index];
        }
        
        return history;
    }

    function isStale() public view returns (bool) {
        return block.timestamp > volatilityData.lastUpdateTime + STALE_THRESHOLD;
    }

    function shouldPauseExecution() external view returns (bool) {
        return volatilityData.currentVolatility > EXTREME_VOLATILITY || isStale();
    }

    function getVolatilityCategory() external view returns (string memory) {
        uint256 volatility = volatilityData.currentVolatility;
        
        if (volatility <= LOW_VOLATILITY) {
            return "LOW";
        } else if (volatility <= NORMAL_VOLATILITY) {
            return "NORMAL";
        } else if (volatility <= HIGH_VOLATILITY) {
            return "HIGH";
        } else {
            return "EXTREME";
        }
    }

    // ============ ADMIN FUNCTIONS ============

    function authorizeUpdater(address updater) external onlyOwner {
        authorizedUpdaters[updater] = true;
        emit UpdaterAuthorized(updater);
    }

    function deauthorizeUpdater(address updater) external onlyOwner {
        authorizedUpdaters[updater] = false;
        emit UpdaterDeauthorized(updater);
    }

    function updateBaselineVolatility(uint256 newBaseline) external onlyOwner {
        require(newBaseline > 0 && newBaseline <= BASIS_POINTS, "Invalid baseline");
        volatilityData.baselineVolatility = newBaseline;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid address");
        owner = newOwner;
    }

    // ============ INTERNAL FUNCTIONS ============

    function _calculateAverage(uint256 startOffset, uint256 endOffset) internal view returns (uint256) {
        require(endOffset > startOffset && endOffset <= HISTORY_SIZE, "Invalid range");
        
        uint256 sum = 0;
        uint256 count = endOffset - startOffset;
        uint256 baseIndex = volatilityData.updateCount > HISTORY_SIZE 
            ? volatilityData.updateCount - HISTORY_SIZE 
            : 0;
        
        for (uint256 i = startOffset; i < endOffset; i++) {
            uint256 index = (baseIndex + i) % HISTORY_SIZE;
            sum += volatilityData.historicalValues[index];
        }
        
        return sum / count;
    }

    // ============ MOCK FUNCTIONS FOR TESTING ============

    function mockUpdateVolatility(uint256 newVolatility) external {
        // For testing only - remove in production
        volatilityData.currentVolatility = newVolatility;
        volatilityData.lastUpdateTime = block.timestamp;
        emit VolatilityUpdated(newVolatility, block.timestamp);
    }
}