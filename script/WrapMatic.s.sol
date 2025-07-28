// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Script.sol";

interface IWMATIC {
    function deposit() external payable;
    function withdraw(uint256) external;
    function balanceOf(address) external view returns (uint256);
}

contract WrapMatic is Script {
    address constant WMATIC = 0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270;
    
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("=== Wrapping MATIC to WMATIC ===");
        console.log("Wallet:", deployer);
        console.log("MATIC Balance:", deployer.balance / 1e18);
        
        uint256 amountToWrap = 2 ether; // Wrap 2 MATIC
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Wrap MATIC to WMATIC
        IWMATIC(WMATIC).deposit{value: amountToWrap}();
        
        vm.stopBroadcast();
        
        uint256 wmaticBalance = IWMATIC(WMATIC).balanceOf(deployer);
        console.log("\n[SUCCESS] Wrapped", amountToWrap / 1e18, "MATIC");
        console.log("New WMATIC Balance:", wmaticBalance / 1e18);
        console.log("Remaining MATIC:", deployer.balance / 1e18);
    }
}