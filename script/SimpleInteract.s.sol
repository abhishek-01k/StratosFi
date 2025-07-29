// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Script.sol";
import "../src/AdvancedStrategyRouter.sol";
import "../src/strategies/TWAPEngine.sol";

contract SimpleInteract is Script {
    // Deployed contract addresses on Polygon
    address constant ROUTER = 0x49f3cF9680ed21857FCDe27B5C163FAae9e22F66;
    address constant TWAP_ENGINE = 0xE2d88d34D34A1fba6f34F79785De1E36dc4f8c12;
    
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("=== Polygon Mainnet Interaction ===");
        console.log("User:", deployer);
        console.log("Balance:", deployer.balance / 1e18, "MATIC");
        
        // Check router
        AdvancedStrategyRouter router = AdvancedStrategyRouter(ROUTER);
        console.log("\nRouter Status:");
        console.log("- Address:", address(router));
        console.log("- Paused:", router.paused());
        console.log("- Fee:", router.protocolFeeRate(), "bps");
        console.log("- Owner:", router.owner());
        
        // Check TWAP engine
        TWAPEngine twapEngine = TWAPEngine(TWAP_ENGINE);
        console.log("\nTWAP Engine:");
        console.log("- Address:", address(twapEngine));
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Create a minimal TWAP config
        console.log("\nCreating minimal TWAP config...");
        bytes32 configId = twapEngine.configureTWAP(
            0.00001 ether,  // Tiny amount
            2,              // 2 intervals
            10 minutes,     // 10 minutes total
            1000,           // 10% max deviation
            false           // no randomization
        );
        
        console.log("Created TWAP Config:", vm.toString(configId));
        
        vm.stopBroadcast();
        
        console.log("\n[DONE] Contracts are live on Polygon!");
        console.log("\nYour deployed contracts:");
        console.log("- Router:", ROUTER);
        console.log("- TWAP Engine:", TWAP_ENGINE);
        console.log("- Options:", 0xB16c17578917fac80fEA345ee76021204cd07C34);
        console.log("- Liquidity Hook:", 0x2c58f9388470Cef9C163d40470BDcE62C0d9888e);
        console.log("- Volatility Oracle:", 0x0Aa50c2FC813d7d316d044464DF0D5cA8e8c4A79);
    }
}