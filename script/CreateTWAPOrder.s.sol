// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Script.sol";
import "../src/interfaces/I1inchLimitOrderProtocol.sol";
import "../src/AdvancedStrategyRouter.sol";
import "../src/strategies/TWAPEngine.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract CreateTWAPOrder is Script {
    // Polygon addresses
    address constant WMATIC = 0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270;
    address constant USDC = 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174;
    address constant ONEINCH_PROTOCOL = 0x111111125421cA6dc452d289314280a0f8842A65;
    
    // Deployed contracts (from deployment)
    address constant ROUTER = 0x49f3cF9680ed21857FCDe27B5C163FAae9e22F66;
    address constant TWAP_ENGINE = 0xE2d88d34D34A1fba6f34F79785De1E36dc4f8c12;
    
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("=== Creating 1inch TWAP Order ===");
        console.log("Wallet:", deployer);
        console.log("WMATIC Balance:", IERC20(WMATIC).balanceOf(deployer) / 1e18);
        console.log("USDC Balance:", IERC20(USDC).balanceOf(deployer) / 1e6);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Step 1: Approve tokens to router and TWAP engine
        console.log("\n1. Approving tokens...");
        
        // Approve WMATIC to router and TWAP engine (for selling)
        uint256 amountToSell = 1 ether; // 1 WMATIC
        IERC20(WMATIC).approve(ROUTER, amountToSell);
        console.log("- Approved", amountToSell / 1e18, "WMATIC to router");
        
        IERC20(WMATIC).approve(TWAP_ENGINE, amountToSell);
        console.log("- Approved", amountToSell / 1e18, "WMATIC to TWAP engine");
        
        // Step 2: Configure TWAP parameters
        console.log("\n2. Configuring TWAP...");
        
        TWAPEngine twapEngine = TWAPEngine(TWAP_ENGINE);
        
        // TWAP configuration
        uint256 intervals = 5; // Split into 5 orders
        uint256 duration = 300; // 5 minutes total (1 minute per interval)
        uint256 maxPriceDeviation = 200; // 2% max deviation
        bool enableRandomization = true; // Enable MEV protection
        
        // Configure TWAP in the engine
        bytes32 configId = twapEngine.configureTWAP(
            amountToSell,
            intervals,
            duration,
            maxPriceDeviation,
            enableRandomization
        );
        
        console.log("- TWAP Config ID:", uint256(configId));
        console.log("- Intervals:", intervals);
        console.log("- Duration:", duration, "seconds");
        console.log("- Max Deviation:", maxPriceDeviation / 100, "%");
        
        vm.stopBroadcast();
        
        // Step 3: Show order parameters for manual signing
        console.log("\n3. Order Parameters for 1inch:");
        console.log("- Maker Asset (WMATIC):", WMATIC);
        console.log("- Taker Asset (USDC):", USDC);
        console.log("- Maker Amount:", amountToSell);
        console.log("- Taker Amount:", calculateExpectedUSDC(amountToSell)); // Assuming ~$0.5 per MATIC
        console.log("- Predicate (TWAP Hook):", ROUTER);
        console.log("- Config ID for Interaction:", uint256(configId));
        
        console.log("\n[SUCCESS] TWAP configured! Next steps:");
        console.log("1. Use the order parameters above to create a 1inch limit order");
        console.log("2. Sign the order using EIP-712");
        console.log("3. Submit to 1inch API");
        console.log("\nRun CreateAndSign1inchOrder script next to complete the process.");
    }
    
    function calculateExpectedUSDC(uint256 maticAmount) internal pure returns (uint256) {
        // Rough estimate: 1 MATIC = $0.5
        // So 1 MATIC = 0.5 USDC (with 6 decimals)
        return (maticAmount * 500000) / 1e18; // Convert from 18 to 6 decimals
    }
}