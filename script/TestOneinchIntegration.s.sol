// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Script.sol";
import "../src/AdvancedStrategyRouter.sol";
import "../src/strategies/TWAPEngine.sol";
import "../src/strategies/ConcentratedLiquidityHook.sol";
import "../src/strategies/OptionsProtocol.sol";
import "../src/oracles/VolatilityOracle.sol";
import "../src/interfaces/IOrderMixin.sol";

interface I1inchLimitOrderProtocol {
    function fillOrder(
        IOrderMixin.Order calldata order,
        bytes calldata signature,
        bytes calldata interaction,
        uint256 makingAmount,
        uint256 takingAmount,
        uint256 skipPermitAndThresholdAmount
    ) external payable returns (uint256, uint256, bytes32);
    
    function checkPredicate(IOrderMixin.Order calldata order) external view returns (bool);
}

contract TestOneinchIntegration is Script {
    // 1inch Limit Order Protocol V4 address (same on most chains)
    address constant ONEINCH_PROTOCOL = 0x111111125421cA6dc452d289314280a0f8842A65;
    
    // Popular token addresses on Polygon
    address constant POLYGON_USDC = 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174;
    address constant POLYGON_WETH = 0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619;
    address constant POLYGON_WMATIC = 0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270;
    
    // Deployed contracts
    AdvancedStrategyRouter public router;
    TWAPEngine public twapEngine;
    ConcentratedLiquidityHook public liquidityHook;
    OptionsProtocol public optionsProtocol;
    VolatilityOracle public volatilityOracle;
    
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Testing 1inch integration on chain:", block.chainid);
        console.log("Deployer address:", deployer);
        console.log("1inch Protocol:", ONEINCH_PROTOCOL);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy our contracts
        _deployContracts();
        
        // Test basic 1inch interaction
        _test1inchConnection();
        
        // Create a test TWAP order
        _createTestTWAPOrder();
        
        vm.stopBroadcast();
    }
    
    function _deployContracts() internal {
        console.log("\n=== Deploying Advanced Strategy Contracts ===");
        
        // Deploy oracles and strategies
        volatilityOracle = new VolatilityOracle();
        console.log("VolatilityOracle:", address(volatilityOracle));
        
        twapEngine = new TWAPEngine(address(volatilityOracle));
        console.log("TWAPEngine:", address(twapEngine));
        
        liquidityHook = new ConcentratedLiquidityHook();
        console.log("ConcentratedLiquidityHook:", address(liquidityHook));
        
        optionsProtocol = new OptionsProtocol(msg.sender, address(volatilityOracle));
        console.log("OptionsProtocol:", address(optionsProtocol));
        
        // Deploy router
        router = new AdvancedStrategyRouter(
            address(optionsProtocol),
            address(liquidityHook),
            address(twapEngine),
            address(volatilityOracle),
            msg.sender
        );
        console.log("AdvancedStrategyRouter:", address(router));
    }
    
    function _test1inchConnection() internal view {
        console.log("\n=== Testing 1inch Protocol Connection ===");
        
        // Check if 1inch protocol exists at the address
        uint256 codeSize;
        assembly {
            codeSize := extcodesize(ONEINCH_PROTOCOL)
        }
        
        if (codeSize > 0) {
            console.log("[OK] 1inch Protocol found at address");
            console.log("  Code size:", codeSize, "bytes");
        } else {
            console.log("[FAIL] No contract found at 1inch Protocol address");
            revert("1inch Protocol not found");
        }
    }
    
    function _createTestTWAPOrder() internal {
        console.log("\n=== Creating Test TWAP Order ===");
        
        // Configure TWAP for small test amount
        uint256 totalAmount = 0.001 ether; // Small test amount
        uint256 intervals = 5;
        uint256 duration = 1 hours;
        
        bytes32 configId = twapEngine.configureTWAP(
            totalAmount,
            intervals,
            duration,
            500, // 5% max price deviation
            false // no randomization for testing
        );
        
        console.log("TWAP Config created:");
        console.log("  Config ID:", vm.toString(configId));
        console.log("  Total Amount:", totalAmount);
        console.log("  Intervals:", intervals);
        console.log("  Duration:", duration, "seconds");
        
        // Create a sample order structure (would be signed off-chain in real usage)
        IOrderMixin.Order memory order = IOrderMixin.Order({
            salt: uint256(keccak256(abi.encode(block.timestamp))),
            maker: uint256(uint160(msg.sender)),
            receiver: uint256(uint160(msg.sender)),
            makerAsset: uint256(uint160(POLYGON_WMATIC)),
            takerAsset: uint256(uint160(POLYGON_USDC)),
            makingAmount: totalAmount,
            takingAmount: totalAmount * 2000 / 1e18, // Assuming 1 MATIC = $2
            makerTraits: 0
        });
        
        console.log("\nSample Order created:");
        console.log("  Maker:", address(uint160(order.maker)));
        console.log("  Maker Asset:", address(uint160(order.makerAsset)));
        console.log("  Taker Asset:", address(uint160(order.takerAsset)));
        console.log("  Making Amount:", order.makingAmount);
        console.log("  Taking Amount:", order.takingAmount);
        
        // Get making amount for first interval
        bytes memory strategyData = abi.encode(
            IAdvancedStrategy.StrategyType.TWAP,
            configId
        );
        
        uint256 intervalAmount = router.getMakingAmount(
            order,
            "",
            keccak256(abi.encode(order)),
            msg.sender,
            0,
            0,
            strategyData
        );
        
        console.log("\nFirst interval amount:", intervalAmount);
        console.log("Expected:", totalAmount / intervals);
    }
}

// Deployment script for Polygon
contract DeployPolygon is TestOneinchIntegration {
    function setUp() public {
        // Polygon-specific setup if needed
    }
}

// Deployment script for Arbitrum
contract DeployArbitrum is TestOneinchIntegration {
    function setUp() public {
        // Arbitrum-specific setup if needed
    }
}