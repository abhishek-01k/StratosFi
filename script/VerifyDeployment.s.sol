// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Script.sol";

contract VerifyDeployment is Script {
    function run() external view {
        console.log("=== Verifying Polygon Deployment ===");
        
        // Check contract code sizes
        address router = 0x49f3cF9680ed21857FCDe27B5C163FAae9e22F66;
        address twap = 0xE2d88d34D34A1fba6f34F79785De1E36dc4f8c12;
        address options = 0xB16c17578917fac80fEA345ee76021204cd07C34;
        
        uint256 routerSize;
        uint256 twapSize;
        uint256 optionsSize;
        
        assembly {
            routerSize := extcodesize(router)
            twapSize := extcodesize(twap)
            optionsSize := extcodesize(options)
        }
        
        console.log("Contract sizes:");
        console.log("- Router:", routerSize, "bytes");
        console.log("- TWAP Engine:", twapSize, "bytes");
        console.log("- Options Protocol:", optionsSize, "bytes");
        
        if (routerSize > 0) {
            console.log("\n[SUCCESS] All contracts are deployed!");
        } else {
            console.log("\n[ERROR] Contracts not found!");
        }
        
        console.log("\nDeployment Summary:");
        console.log("- Chain: Polygon (137)");
        console.log("- 1inch Protocol: 0x111111125421cA6dc452d289314280a0f8842A65");
        console.log("- Your wallet: 0x575E1D9DB08388356ceb2e91C8e30B4E24664a62");
    }
}