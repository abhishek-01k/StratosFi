// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Script.sol";
import "../src/AdvancedStrategyRouter.sol";
import "../src/strategies/TWAPEngine.sol";
import "../src/strategies/ConcentratedLiquidityHook.sol";
import "../src/strategies/OptionsProtocol.sol";
import "../src/oracles/VolatilityOracle.sol";

contract DeployToPolygon is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Deploying to Polygon Mainnet");
        console.log("Deployer:", deployer);
        console.log("Balance:", deployer.balance / 1e18, "MATIC");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy all contracts
        console.log("\nDeploying contracts...");
        
        VolatilityOracle volatilityOracle = new VolatilityOracle();
        console.log("1. VolatilityOracle:", address(volatilityOracle));
        
        TWAPEngine twapEngine = new TWAPEngine(address(volatilityOracle));
        console.log("2. TWAPEngine:", address(twapEngine));
        
        ConcentratedLiquidityHook liquidityHook = new ConcentratedLiquidityHook();
        console.log("3. ConcentratedLiquidityHook:", address(liquidityHook));
        
        OptionsProtocol optionsProtocol = new OptionsProtocol(deployer, address(volatilityOracle));
        console.log("4. OptionsProtocol:", address(optionsProtocol));
        
        AdvancedStrategyRouter router = new AdvancedStrategyRouter(
            address(optionsProtocol),
            address(liquidityHook),
            address(twapEngine),
            address(volatilityOracle),
            deployer
        );
        console.log("5. AdvancedStrategyRouter:", address(router));
        
        vm.stopBroadcast();
        
        console.log("\n[SUCCESS] Deployment complete!");
        console.log("\nSave these addresses:");
        console.log("VOLATILITY_ORACLE=", address(volatilityOracle));
        console.log("TWAP_ENGINE=", address(twapEngine));
        console.log("LIQUIDITY_HOOK=", address(liquidityHook));
        console.log("OPTIONS_PROTOCOL=", address(optionsProtocol));
        console.log("ROUTER=", address(router));
    }
}