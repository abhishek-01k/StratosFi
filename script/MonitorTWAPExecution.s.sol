// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Script.sol";
import "../src/strategies/TWAPEngine.sol";
import "../src/AdvancedStrategyRouter.sol";

contract MonitorTWAPExecution is Script {
    address constant ROUTER = 0x49f3cF9680ed21857FCDe27B5C163FAae9e22F66;
    address constant TWAP_ENGINE = 0xE2d88d34D34A1fba6f34F79785De1E36dc4f8c12;
    
    function run() external view {
        console.log("=== TWAP Execution Monitor ===");
        console.log("Timestamp:", block.timestamp);
        console.log("\nContract Addresses:");
        console.log("- Router:", ROUTER);
        console.log("- TWAP Engine:", TWAP_ENGINE);
        
        // Check TWAP configurations
        bytes32 configId = bytes32(uint256(1)); // From previous script
        TWAPEngine twap = TWAPEngine(TWAP_ENGINE);
        
        // Note: We need to add getter functions to TWAPEngine to properly monitor
        // For now, we'll show what monitoring would look like
        
        console.log("\n=== Monitoring Instructions ===");
        console.log("1. Check your order on 1inch:");
        console.log("   https://app.1inch.io/#/137/limit-order/history");
        
        console.log("\n2. Monitor transactions on Polygonscan:");
        console.log("   https://polygonscan.com/address/", ROUTER);
        
        console.log("\n3. Track TWAP executions:");
        console.log("   - Each interval should execute ~1 minute apart");
        console.log("   - Total 5 executions over 5 minutes");
        console.log("   - Each execution trades 0.2 WMATIC");
        
        console.log("\n4. Check for events:");
        console.log("   - TWAPConfigured");
        console.log("   - TWAPIntervalExecuted");
        console.log("   - TWAPCompleted");
        
        console.log("\n5. Verify MEV protection:");
        console.log("   - Execution times should have slight randomization");
        console.log("   - Price should stay within 2% deviation");
    }
}