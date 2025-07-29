// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Script.sol";
import "../src/AdvancedStrategyRouter.sol";
import "../src/interfaces/IAdvancedStrategy.sol";

contract DemoScript is Script {
    AdvancedStrategyRouter public router;
    address public user = address(0x1234);
    
    // Mock 1inch order for demo
    IOrderMixin.Order public mockOrder;

    function setUp() public {
        // Load deployed router address
        router = AdvancedStrategyRouter(0x0000000000000000000000000000000000000000); // Replace with actual
        
        // Create mock order
        mockOrder = IOrderMixin.Order({
            salt: 1,
            maker: uint256(uint160(user)),
            receiver: uint256(uint160(user)),
            makerAsset: uint256(uint160(address(0x123))), // Mock USDC
            takerAsset: uint256(uint160(address(0x456))), // Mock WETH
            makingAmount: 10000 * 1e6, // 10,000 USDC
            takingAmount: 3 * 1e18,    // 3 ETH
            makerTraits: 0
        });
    }

    function run() public {
        console.log("=== 1inch Advanced Strategies Demo ===\n");
        
        // Demo 1: Options Trading
        _demoOptionsTrading();
        
        // Demo 2: Concentrated Liquidity
        _demoConcentratedLiquidity();
        
        // Demo 3: TWAP Execution
        _demoTWAPExecution();
        
        // Demo 4: Combined Strategy
        _demoCombinedStrategy();
        
        console.log("\n=== Demo Complete ===");
    }

    function _demoOptionsTrading() internal {
        console.log("1. OPTIONS TRADING DEMO");
        console.log("------------------------");
        
        vm.startBroadcast();
        
        // Configure options strategy
        IAdvancedStrategy.StrategyConfig memory optionsConfig = IAdvancedStrategy.StrategyConfig({
            strategyType: IAdvancedStrategy.StrategyType.Options,
            isActive: true,
            minExecutionAmount: 100 * 1e6,
            maxExecutionAmount: 5000 * 1e6,
            oracle: address(0),
            additionalData: abi.encode(
                2200 * 1e18,          // Strike price: $2200
                block.timestamp + 7 days, // Expiration: 1 week
                50 * 1e18,            // Premium: $50
                true                  // Call option
            )
        });
        
        bytes32 configId = router.configureStrategy(optionsConfig);
        console.log("- Created call option with strike $2200");
        console.log("- Config ID:", vm.toString(configId));
        
        // Simulate option execution
        bytes memory strategyData = abi.encode(
            IAdvancedStrategy.StrategyType.Options,
            abi.encode(configId)
        );
        
        uint256 makingAmount = router.getMakingAmount(
            mockOrder,
            "",
            keccak256("test_order"),
            user,
            1 * 1e18,
            mockOrder.makingAmount,
            strategyData
        );
        
        console.log("- Making amount for 1 ETH taking:", makingAmount / 1e6, "USDC");
        
        vm.stopBroadcast();
    }

    function _demoConcentratedLiquidity() internal {
        console.log("\n2. CONCENTRATED LIQUIDITY DEMO");
        console.log("--------------------------------");
        
        vm.startBroadcast();
        
        // Configure concentrated liquidity
        IAdvancedStrategy.StrategyConfig memory liquidityConfig = IAdvancedStrategy.StrategyConfig({
            strategyType: IAdvancedStrategy.StrategyType.ConcentratedLiquidity,
            isActive: true,
            minExecutionAmount: 100 * 1e6,
            maxExecutionAmount: 10000 * 1e6,
            oracle: address(0),
            additionalData: abi.encode(
                int24(-887220),  // Lower tick (~$1900)
                int24(887220),   // Upper tick (~$2100)
                uint24(3000),    // 0.3% fee tier
                5000 * 1e6,      // Amount0 desired: 5000 USDC
                1.5 * 1e18,      // Amount1 desired: 1.5 ETH
                4900 * 1e6,      // Amount0 min
                1.4 * 1e18,      // Amount1 min
                user,            // Recipient
                block.timestamp + 1 hours // Deadline
            )
        });
        
        bytes32 configId = router.configureStrategy(liquidityConfig);
        console.log("- Created concentrated liquidity position");
        console.log("- Price range: $1900 - $2100");
        console.log("- Fee tier: 0.3%");
        console.log("- Config ID:", vm.toString(configId));
        
        vm.stopBroadcast();
    }

    function _demoTWAPExecution() internal {
        console.log("\n3. TWAP EXECUTION DEMO");
        console.log("------------------------");
        
        vm.startBroadcast();
        
        // Configure TWAP strategy
        IAdvancedStrategy.StrategyConfig memory twapConfig = IAdvancedStrategy.StrategyConfig({
            strategyType: IAdvancedStrategy.StrategyType.TWAP,
            isActive: true,
            minExecutionAmount: 10 * 1e6,
            maxExecutionAmount: 1000 * 1e6,
            oracle: address(0),
            additionalData: abi.encode(
                10000 * 1e6,     // Total amount: 10,000 USDC
                24,              // 24 intervals
                24 hours,        // Duration: 24 hours
                500,             // Max price deviation: 5%
                true             // Enable randomization
            )
        });
        
        bytes32 configId = router.configureStrategy(twapConfig);
        console.log("- Created TWAP order for 10,000 USDC");
        console.log("- Intervals: 24 (hourly execution)");
        console.log("- MEV Protection: Enabled (+/-15% randomization)");
        console.log("- Config ID:", vm.toString(configId));
        
        vm.stopBroadcast();
    }

    function _demoCombinedStrategy() internal {
        console.log("\n4. COMBINED STRATEGY DEMO");
        console.log("---------------------------");
        
        vm.startBroadcast();
        
        // Configure combined strategy
        AdvancedStrategyRouter.CombinedStrategyConfig memory combinedConfig = AdvancedStrategyRouter.CombinedStrategyConfig({
            useOptions: true,
            useConcentratedLiquidity: true,
            useTWAP: true,
            useVolatilityAdjustment: true,
            optionsData: abi.encode(bytes32("option_config_id")),
            liquidityData: abi.encode(bytes32("liquidity_config_id")),
            twapData: abi.encode(bytes32("twap_config_id")),
            maxGasPrice: 100 gwei
        });
        
        bytes32 configId = router.configureCombinedStrategy(combinedConfig);
        console.log("- Created combined strategy using:");
        console.log("  - Options trading");
        console.log("  - Concentrated liquidity");
        console.log("  - TWAP execution");
        console.log("  - Volatility adjustment");
        console.log("- Config ID:", vm.toString(configId));
        
        // Get user statistics
        (
            uint256 totalExecutions,
            uint256 totalVolume,
            uint256 averageGasUsed,
            uint256 successRate
        ) = router.getUserStats(user);
        
        console.log("\nUser Statistics:");
        console.log("- Total Executions:", totalExecutions);
        console.log("- Total Volume:", totalVolume / 1e6, "USDC");
        console.log("- Average Gas Used:", averageGasUsed);
        console.log("- Success Rate:", successRate, "%");
        
        vm.stopBroadcast();
    }
}