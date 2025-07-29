// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Script.sol";
import "../src/AdvancedStrategyRouter.sol";
import "../src/strategies/TWAPEngine.sol";
import "../src/interfaces/IOrderMixin.sol";

contract InteractWithDeployed is Script {
    // Deployed contract addresses on Polygon
    address constant ROUTER = 0x49f3cF9680ed21857FCDe27B5C163FAae9e22F66;
    address constant TWAP_ENGINE = 0xE2d88d34D34A1fba6f34F79785De1E36dc4f8c12;
    address constant OPTIONS_PROTOCOL = 0xB16c17578917fac80fEA345ee76021204cd07C34;
    
    // 1inch Protocol
    address constant ONEINCH_PROTOCOL = 0x111111125421cA6dc452d289314280a0f8842A65;
    
    // Polygon tokens
    address constant WMATIC = 0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270;
    address constant USDC = 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174;
    
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Interacting with deployed contracts on Polygon");
        console.log("User address:", deployer);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Check balances
        uint256 maticBalance = deployer.balance;
        console.log("MATIC balance:", maticBalance / 1e18, "MATIC");
        
        // Get router
        AdvancedStrategyRouter router = AdvancedStrategyRouter(ROUTER);
        console.log("Router paused?", router.paused());
        console.log("Protocol fee:", router.protocolFeeRate(), "bps");
        
        // Get TWAP engine
        TWAPEngine twapEngine = TWAPEngine(TWAP_ENGINE);
        
        // Check existing TWAP config
        bytes32 existingConfigId = 0xd370de720e8920af209d24cbc9f36bbf9001fab23564ae21503855867c2cce47;
        (
            uint256 totalExecuted,
            uint256 executedIntervals,
            uint256 averagePrice,
            bool isPaused,
            uint256 lastExecutionTime
        ) = twapEngine.getTWAPStatus(existingConfigId);
        
        console.log("\nExisting TWAP Status:");
        console.log("  Total Executed:", totalExecuted);
        console.log("  Executed Intervals:", executedIntervals);
        console.log("  Is Paused:", isPaused);
        
        // Create a new smaller TWAP config
        console.log("\nCreating new TWAP config...");
        uint256 smallAmount = 0.0001 ether; // Very small amount for testing
        bytes32 newConfigId = twapEngine.configureTWAP(
            smallAmount,
            3,          // 3 intervals
            30 minutes, // 30 minutes total
            500,        // 5% max deviation
            false       // no randomization
        );
        
        console.log("New TWAP Config ID:", vm.toString(newConfigId));
        
        vm.stopBroadcast();
        
        console.log("\n[SUCCESS] Interaction complete!");
        console.log("\nNext steps:");
        console.log("1. Approve tokens for the router contract");
        console.log("2. Create and sign a 1inch limit order");
        console.log("3. Submit the order to 1inch API or execute directly");
    }
}

contract CheckBalances is Script {
    function run() external view {
        address user = vm.envAddress("USER_ADDRESS");
        
        console.log("Checking balances for:", user);
        console.log("MATIC:", user.balance / 1e18, "MATIC");
        
        // Check token balances if needed
        // IERC20(WMATIC).balanceOf(user);
        // IERC20(USDC).balanceOf(user);
    }
}