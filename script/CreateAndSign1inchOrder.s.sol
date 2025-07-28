// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Script.sol";
import "../src/interfaces/I1inchLimitOrderProtocol.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract CreateAndSign1inchOrder is Script {
    // Polygon addresses
    address constant WMATIC = 0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270;
    address constant USDC = 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174;
    address constant ONEINCH_PROTOCOL = 0x111111125421cA6dc452d289314280a0f8842A65;
    address constant ROUTER = 0x49f3cF9680ed21857FCDe27B5C163FAae9e22F66;
    
    // EIP-712 Domain
    bytes32 constant DOMAIN_TYPEHASH = keccak256(
        "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
    );
    
    bytes32 constant ORDER_TYPEHASH = keccak256(
        "Order(uint256 salt,address makerAsset,address takerAsset,address maker,address receiver,address allowedSender,uint256 makingAmount,uint256 takingAmount,uint256 offsets,bytes interactions)"
    );
    
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("=== Creating and Signing 1inch Order ===");
        console.log("Maker:", deployer);
        
        // Create order parameters
        I1inchLimitOrderProtocol.Order memory order;
        
        // Basic order info
        order.salt = uint256(keccak256(abi.encodePacked(block.timestamp, deployer)));
        order.makerAsset = WMATIC;
        order.takerAsset = USDC;
        order.maker = deployer;
        order.receiver = address(0); // Default to maker
        order.allowedSender = address(0); // Anyone can fill
        order.makingAmount = 1 ether; // 1 WMATIC
        order.takingAmount = 500000; // 0.5 USDC (6 decimals)
        
        // TWAP configuration - encode the router as predicate
        bytes32 configId = bytes32(uint256(13884288811308243207566789887791616121132891762130265049947650537877068275382)); // Config ID from previous script
        order.offsets = buildOffsets(
            true, // use permit
            false, // unwrap WETH
            true, // allow multiple fills
            false, // allow partial fill
            true, // need epoch check
            false, // has extension
            true, // use predicate
            false, // need withdraw
            960 // predicate offset (after main order data)
        );
        
        // Interactions: predicate call to router
        bytes memory predicateCall = abi.encodeWithSelector(
            bytes4(keccak256("checkOrderPredicate(address,bytes32)")),
            deployer,
            configId
        );
        order.interactions = predicateCall;
        
        // Sign the order
        bytes32 orderHash = hashOrder(order);
        bytes32 domainSeparator = buildDomainSeparator();
        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", domainSeparator, orderHash));
        
        console.log("\nOrder Details:");
        console.log("- Order Hash:", uint256(orderHash));
        console.log("- Domain Separator:", uint256(domainSeparator));
        console.log("- Digest to Sign:", uint256(digest));
        
        // Sign with private key
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(deployerPrivateKey, digest);
        bytes memory signature = abi.encodePacked(r, s, v);
        
        console.log("\nSignature:");
        console.log("- v:", v);
        console.log("- r:", uint256(r));
        console.log("- s:", uint256(s));
        
        // Prepare API submission data
        console.log("\n=== API Submission Data ===");
        console.log("POST https://api.1inch.dev/orderbook/v4.0/137/order");
        console.log("\nRequest Body:");
        console.log("{");
        console.log('  "orderHash": "', toHexString(orderHash), '",');
        console.log('  "signature": "', toHexString(signature), '",');
        console.log('  "data": {');
        console.log('    "makerAsset": "', WMATIC, '",');
        console.log('    "takerAsset": "', USDC, '",');
        console.log('    "makingAmount": "', order.makingAmount, '",');
        console.log('    "takingAmount": "', order.takingAmount, '",');
        console.log('    "salt": "', order.salt, '",');
        console.log('    "maker": "', deployer, '",');
        console.log('    "receiver": "0x0000000000000000000000000000000000000000",');
        console.log('    "allowedSender": "0x0000000000000000000000000000000000000000",');
        console.log('    "offsets": "', order.offsets, '",');
        console.log('    "interactions": "', toHexString(order.interactions), '"');
        console.log("  }");
        console.log("}");
        
        console.log("\n[SUCCESS] Order created and signed!");
        console.log("\nNext steps:");
        console.log("1. Copy the API request data above");
        console.log("2. Submit to 1inch API with proper headers");
        console.log("3. Monitor the order on https://app.1inch.io/#/137/limit-order/history");
    }
    
    function buildOffsets(
        bool usePermit,
        bool unwrapWETH,
        bool allowMultipleFills,
        bool allowPartialFill,
        bool needEpochCheck,
        bool hasExtension,
        bool usePredicate,
        bool needWithdraw,
        uint256 predicateOffset
    ) internal pure returns (uint256) {
        uint256 offsets;
        if (usePermit) offsets |= 1 << 255;
        if (unwrapWETH) offsets |= 1 << 254;
        if (allowMultipleFills) offsets |= 1 << 253;
        if (allowPartialFill) offsets |= 1 << 252;
        if (needEpochCheck) offsets |= 1 << 251;
        if (hasExtension) offsets |= 1 << 250;
        if (usePredicate) offsets |= 1 << 249;
        if (needWithdraw) offsets |= 1 << 248;
        offsets |= predicateOffset;
        return offsets;
    }
    
    function hashOrder(I1inchLimitOrderProtocol.Order memory order) internal pure returns (bytes32) {
        return keccak256(abi.encode(
            ORDER_TYPEHASH,
            order.salt,
            order.makerAsset,
            order.takerAsset,
            order.maker,
            order.receiver,
            order.allowedSender,
            order.makingAmount,
            order.takingAmount,
            order.offsets,
            keccak256(order.interactions)
        ));
    }
    
    function buildDomainSeparator() internal pure returns (bytes32) {
        return keccak256(abi.encode(
            DOMAIN_TYPEHASH,
            keccak256("1inch Limit Order Protocol"),
            keccak256("4"),
            137, // Polygon chain ID
            ONEINCH_PROTOCOL
        ));
    }
    
    function toHexString(bytes32 data) internal pure returns (string memory) {
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(2 + 64);
        str[0] = "0";
        str[1] = "x";
        for (uint256 i = 0; i < 32; i++) {
            str[2 + i * 2] = alphabet[uint8(data[i] >> 4)];
            str[3 + i * 2] = alphabet[uint8(data[i] & 0x0f)];
        }
        return string(str);
    }
    
    function toHexString(bytes memory data) internal pure returns (string memory) {
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(2 + data.length * 2);
        str[0] = "0";
        str[1] = "x";
        for (uint256 i = 0; i < data.length; i++) {
            str[2 + i * 2] = alphabet[uint8(data[i] >> 4)];
            str[3 + i * 2] = alphabet[uint8(data[i] & 0x0f)];
        }
        return string(str);
    }
}