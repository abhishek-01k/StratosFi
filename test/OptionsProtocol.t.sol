// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../src/strategies/OptionsProtocol.sol";
import "../src/interfaces/IOrderMixin.sol";

contract OptionsProtocolTest is Test {
    OptionsProtocol public optionsProtocol;
    address public feeCollector = address(0x123);
    address public priceOracle = address(0x456);
    address public alice = address(0x1);
    address public bob = address(0x2);

    function setUp() public {
        optionsProtocol = new OptionsProtocol(feeCollector, priceOracle);
        
        // Fund test accounts
        vm.deal(alice, 100 ether);
        vm.deal(bob, 100 ether);
    }

    function testCreateCallOption() public {
        vm.startPrank(alice);
        
        bytes32 orderHash = keccak256("test_order");
        uint256 strikePrice = 2200 * 1e18;
        uint256 expiration = block.timestamp + 7 days;
        uint256 premium = 50 * 1e18;
        
        bytes32 optionId = optionsProtocol.createCallOption{value: premium}(
            orderHash,
            strikePrice,
            expiration,
            premium
        );
        
        assertEq(optionId != bytes32(0), true);
        vm.stopPrank();
    }

    function testCreatePutOption() public {
        vm.startPrank(alice);
        
        bytes32 orderHash = keccak256("test_order");
        uint256 strikePrice = 1800 * 1e18;
        uint256 expiration = block.timestamp + 7 days;
        uint256 premium = 30 * 1e18;
        
        bytes32 optionId = optionsProtocol.createPutOption{value: premium}(
            orderHash,
            strikePrice,
            expiration,
            premium
        );
        
        assertEq(optionId != bytes32(0), true);
        vm.stopPrank();
    }

    function testCannotCreateOptionWithInvalidParameters() public {
        vm.startPrank(alice);
        
        bytes32 orderHash = keccak256("test_order");
        
        // Test zero strike price
        vm.expectRevert(OptionsProtocol.InvalidStrikePrice.selector);
        optionsProtocol.createCallOption{value: 1 ether}(
            orderHash,
            0, // Invalid strike price
            block.timestamp + 1 days,
            1 ether
        );
        
        // Test invalid expiration
        vm.expectRevert(OptionsProtocol.InvalidExpiration.selector);
        optionsProtocol.createCallOption{value: 1 ether}(
            orderHash,
            2000 * 1e18,
            block.timestamp + 1 minutes, // Too soon
            1 ether
        );
        
        vm.stopPrank();
    }

    function testCalculateOptionPremium() public {
        bytes32 orderHash = keccak256("test_order");
        uint256 strikePrice = 2000 * 1e18;
        uint256 expiration = block.timestamp + 7 days;
        uint256 currentVolatility = 8000; // 80%
        
        uint256 premium = optionsProtocol.calculateOptionPremium(
            orderHash,
            strikePrice,
            expiration,
            true, // Call option
            currentVolatility
        );
        
        // Premium should be greater than 0
        assertGt(premium, 0);
    }

    function testDepositAndWithdrawCollateral() public {
        vm.startPrank(alice);
        
        uint256 depositAmount = 10 ether;
        
        // Deposit collateral
        optionsProtocol.depositCollateral{value: depositAmount}();
        assertEq(optionsProtocol.collateralBalances(alice), depositAmount);
        
        // Withdraw half
        uint256 withdrawAmount = 5 ether;
        uint256 balanceBefore = alice.balance;
        optionsProtocol.withdrawCollateral(withdrawAmount);
        
        assertEq(optionsProtocol.collateralBalances(alice), depositAmount - withdrawAmount);
        assertEq(alice.balance, balanceBefore + withdrawAmount);
        
        vm.stopPrank();
    }

    function testGetMakingAmount() public {
        // Create a test option
        vm.startPrank(alice);
        bytes32 orderHash = keccak256("test_order");
        uint256 strikePrice = 2200 * 1e18;
        uint256 expiration = block.timestamp + 7 days;
        uint256 premium = 50 * 1e18;
        
        bytes32 optionId = optionsProtocol.createCallOption{value: premium}(
            orderHash,
            strikePrice,
            expiration,
            premium
        );
        vm.stopPrank();
        
        // Create test order
        IOrderMixin.Order memory order = IOrderMixin.Order({
            salt: 1,
            maker: uint256(uint160(alice)),
            receiver: uint256(uint160(alice)),
            makerAsset: uint256(uint160(address(0x123))), // Mock token
            takerAsset: uint256(uint160(address(0x456))), // Mock token
            makingAmount: 1000 * 1e18,
            takingAmount: 1 * 1e18,
            makerTraits: 0
        });
        
        // Test getMakingAmount
        uint256 makingAmount = optionsProtocol.getMakingAmount(
            order,
            "",
            orderHash,
            alice,
            0.5 * 1e18,
            1000 * 1e18,
            abi.encode(optionId)
        );
        
        // Should return 0 as option is not in exercise window
        assertEq(makingAmount, 0);
    }
}