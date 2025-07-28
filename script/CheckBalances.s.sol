// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Script.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract CheckBalances is Script {
    address constant WMATIC = 0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270;
    address constant USDC = 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174;
    address constant ROUTER = 0x49f3cF9680ed21857FCDe27B5C163FAae9e22F66;
    address constant ONEINCH_PROTOCOL = 0x111111125421cA6dc452d289314280a0f8842A65;
    
    function run() external view {
        address wallet = 0x575E1D9DB08388356ceb2e91C8e30B4E24664a62; // Your deployed wallet
        
        console.log("=== Token Balances & Approvals ===");
        console.log("Wallet:", wallet);
        console.log("\nNative Balance:");
        console.log("- MATIC:", wallet.balance / 1e18);
        
        console.log("\nToken Balances:");
        uint256 wmaticBalance = IERC20(WMATIC).balanceOf(wallet);
        uint256 usdcBalance = IERC20(USDC).balanceOf(wallet);
        console.log("- WMATIC:", wmaticBalance / 1e18);
        console.log("- USDC:", usdcBalance / 1e6);
        
        console.log("\nApprovals to Router:");
        uint256 wmaticAllowance = IERC20(WMATIC).allowance(wallet, ROUTER);
        uint256 usdcAllowance = IERC20(USDC).allowance(wallet, ROUTER);
        console.log("- WMATIC:", wmaticAllowance / 1e18);
        console.log("- USDC:", usdcAllowance / 1e6);
        
        console.log("\nApprovals to 1inch Protocol:");
        uint256 wmaticAllowance1inch = IERC20(WMATIC).allowance(wallet, ONEINCH_PROTOCOL);
        uint256 usdcAllowance1inch = IERC20(USDC).allowance(wallet, ONEINCH_PROTOCOL);
        console.log("- WMATIC:", wmaticAllowance1inch / 1e18);
        console.log("- USDC:", usdcAllowance1inch / 1e6);
        
        if (wmaticBalance == 0) {
            console.log("\n[WARNING] No WMATIC balance!");
            console.log("You need to wrap some MATIC first:");
            console.log("1. Go to https://app.1inch.io/#/137/swap");
            console.log("2. Swap MATIC to WMATIC");
        }
    }
}