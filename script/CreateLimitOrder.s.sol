// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Script.sol";
import "../src/interfaces/IOrderMixin.sol";

contract CreateLimitOrder is Script {
    // 1inch Limit Order Protocol V4
    address constant ONEINCH_PROTOCOL = 0x111111125421cA6dc452d289314280a0f8842A65;
    
    // Domain separator for EIP-712 signing
    bytes32 constant LIMIT_ORDER_TYPEHASH = keccak256(
        "Order(uint256 salt,address maker,address receiver,address makerAsset,address takerAsset,uint256 makingAmount,uint256 takingAmount,uint256 makerTraits)"
    );
    
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address maker = vm.addr(deployerPrivateKey);
        
        // Token addresses (update based on chain)
        address makerAsset = vm.envAddress("MAKER_ASSET"); // e.g., WMATIC
        address takerAsset = vm.envAddress("TAKER_ASSET"); // e.g., USDC
        
        // Create order
        IOrderMixin.Order memory order = IOrderMixin.Order({
            salt: uint256(keccak256(abi.encode(block.timestamp, block.number))),
            maker: uint256(uint160(maker)),
            receiver: uint256(uint160(maker)), // Receive funds to same address
            makerAsset: uint256(uint160(makerAsset)),
            takerAsset: uint256(uint160(takerAsset)),
            makingAmount: 1 ether, // 1 token (adjust decimals as needed)
            takingAmount: 2000 * 1e6, // 2000 USDC (6 decimals)
            makerTraits: 0 // No special traits for basic order
        });
        
        // Get domain separator for the chain
        bytes32 domainSeparator = _buildDomainSeparator();
        
        // Hash the order
        bytes32 orderHash = _hashOrder(order, domainSeparator);
        
        // Sign the order
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(deployerPrivateKey, orderHash);
        bytes memory signature = abi.encodePacked(r, s, v);
        
        console.log("\n=== 1inch Limit Order Created ===");
        console.log("Order Hash:", vm.toString(orderHash));
        console.log("Maker:", maker);
        console.log("Maker Asset:", makerAsset);
        console.log("Taker Asset:", takerAsset);
        console.log("Making Amount:", order.makingAmount);
        console.log("Taking Amount:", order.takingAmount);
        console.log("\nSignature:", vm.toString(signature));
        
        // Save order data for later use
        string memory orderJson = _formatOrderJson(order, signature);
        vm.writeFile("./order.json", orderJson);
        console.log("\nOrder saved to ./order.json");
    }
    
    function _buildDomainSeparator() internal view returns (bytes32) {
        return keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256("1inch Limit Order Protocol"),
                keccak256("4"),
                block.chainid,
                ONEINCH_PROTOCOL
            )
        );
    }
    
    function _hashOrder(IOrderMixin.Order memory order, bytes32 domainSeparator) internal pure returns (bytes32) {
        bytes32 structHash = keccak256(
            abi.encode(
                LIMIT_ORDER_TYPEHASH,
                order.salt,
                order.maker,
                order.receiver,
                order.makerAsset,
                order.takerAsset,
                order.makingAmount,
                order.takingAmount,
                order.makerTraits
            )
        );
        
        return keccak256(abi.encodePacked("\x19\x01", domainSeparator, structHash));
    }
    
    function _formatOrderJson(IOrderMixin.Order memory order, bytes memory signature) internal pure returns (string memory) {
        return string(abi.encodePacked(
            '{\n',
            '  "salt": "', vm.toString(order.salt), '",\n',
            '  "maker": "', vm.toString(address(uint160(order.maker))), '",\n',
            '  "receiver": "', vm.toString(address(uint160(order.receiver))), '",\n',
            '  "makerAsset": "', vm.toString(address(uint160(order.makerAsset))), '",\n',
            '  "takerAsset": "', vm.toString(address(uint160(order.takerAsset))), '",\n',
            '  "makingAmount": "', vm.toString(order.makingAmount), '",\n',
            '  "takingAmount": "', vm.toString(order.takingAmount), '",\n',
            '  "makerTraits": "', vm.toString(order.makerTraits), '",\n',
            '  "signature": "', vm.toString(signature), '"\n',
            '}'
        ));
    }
}