// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Script.sol";
import "../src/AdvancedStrategyRouter.sol";
import "../src/strategies/OptionsProtocol.sol";
import "../src/strategies/ConcentratedLiquidityHook.sol";
import "../src/strategies/TWAPEngine.sol";
import "../src/oracles/VolatilityOracle.sol";

contract DeployScript is Script {
    // Deployment addresses
    address public feeCollector;
    address public deployer;
    
    // Deployed contracts
    VolatilityOracle public volatilityOracle;
    OptionsProtocol public optionsProtocol;
    ConcentratedLiquidityHook public liquidityHook;
    TWAPEngine public twapEngine;
    AdvancedStrategyRouter public router;

    function setUp() public virtual {
        // Set up addresses based on network
        uint256 chainId = block.chainid;
        
        if (chainId == 1) {
            // Mainnet
            feeCollector = 0x1234567890123456789012345678901234567890; // Replace with actual
        } else if (chainId == 42161) {
            // Arbitrum
            feeCollector = 0x1234567890123456789012345678901234567890; // Replace with actual
        } else {
            // Testnet/Local
            feeCollector = address(0x9999);
        }
    }

    function run() public {
        // Get deployer private key from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        deployer = vm.addr(deployerPrivateKey);
        
        console.log("Deploying contracts with address:", deployer);
        console.log("Chain ID:", block.chainid);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // 1. Deploy Volatility Oracle
        console.log("Deploying VolatilityOracle...");
        volatilityOracle = new VolatilityOracle();
        console.log("VolatilityOracle deployed at:", address(volatilityOracle));
        
        // 2. Deploy Options Protocol
        console.log("Deploying OptionsProtocol...");
        optionsProtocol = new OptionsProtocol(
            feeCollector,
            address(volatilityOracle)
        );
        console.log("OptionsProtocol deployed at:", address(optionsProtocol));
        
        // 3. Deploy Concentrated Liquidity Hook
        console.log("Deploying ConcentratedLiquidityHook...");
        liquidityHook = new ConcentratedLiquidityHook();
        console.log("ConcentratedLiquidityHook deployed at:", address(liquidityHook));
        
        // 4. Deploy TWAP Engine
        console.log("Deploying TWAPEngine...");
        twapEngine = new TWAPEngine(address(volatilityOracle));
        console.log("TWAPEngine deployed at:", address(twapEngine));
        
        // 5. Deploy Advanced Strategy Router
        console.log("Deploying AdvancedStrategyRouter...");
        router = new AdvancedStrategyRouter(
            address(optionsProtocol),
            address(liquidityHook),
            address(twapEngine),
            address(volatilityOracle),
            feeCollector
        );
        console.log("AdvancedStrategyRouter deployed at:", address(router));
        
        // 6. Post-deployment configuration
        console.log("Configuring contracts...");
        
        // Authorize router as volatility updater (for demo purposes)
        volatilityOracle.authorizeUpdater(address(router));
        
        // Set initial volatility
        volatilityOracle.mockUpdateVolatility(500); // 5% baseline volatility
        
        vm.stopBroadcast();
        
        // Save deployment addresses
        _saveDeploymentAddresses();
        
        console.log("\n=== Deployment Summary ===");
        console.log("VolatilityOracle:", address(volatilityOracle));
        console.log("OptionsProtocol:", address(optionsProtocol));
        console.log("ConcentratedLiquidityHook:", address(liquidityHook));
        console.log("TWAPEngine:", address(twapEngine));
        console.log("AdvancedStrategyRouter:", address(router));
        console.log("========================\n");
    }

    function _saveDeploymentAddresses() internal {
        string memory deploymentInfo = string(abi.encodePacked(
            "{\n",
            '  "chainId": ', vm.toString(block.chainid), ',\n',
            '  "contracts": {\n',
            '    "VolatilityOracle": "', vm.toString(address(volatilityOracle)), '",\n',
            '    "OptionsProtocol": "', vm.toString(address(optionsProtocol)), '",\n',
            '    "ConcentratedLiquidityHook": "', vm.toString(address(liquidityHook)), '",\n',
            '    "TWAPEngine": "', vm.toString(address(twapEngine)), '",\n',
            '    "AdvancedStrategyRouter": "', vm.toString(address(router)), '"\n',
            '  },\n',
            '  "deployer": "', vm.toString(deployer), '",\n',
            '  "timestamp": ', vm.toString(block.timestamp), '\n',
            '}'
        ));
        
        string memory filename = string(abi.encodePacked(
            "deployments/",
            vm.toString(block.chainid),
            "-latest.json"
        ));
        
        vm.writeFile(filename, deploymentInfo);
    }
}

contract DeployTestnet is DeployScript {
    function setUp() public override {
        // Override for testnet deployment
        feeCollector = address(0x9999);
    }
}

contract VerifyContracts is Script {
    function run() public {
        // Read deployment addresses from file
        string memory deploymentFile = vm.readFile(
            string(abi.encodePacked("deployments/", vm.toString(block.chainid), "-latest.json"))
        );
        
        console.log("Verifying contracts...");
        console.log("Deployment info:", deploymentFile);
        
        // Verification commands would be executed here
        // forge verify-contract <address> <contract> --chain <chain> --etherscan-api-key <key>
    }
}