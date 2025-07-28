// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface I1inchLimitOrderProtocol {
    struct Order {
        uint256 salt;
        address makerAsset;
        address takerAsset;
        address maker;
        address receiver;
        address allowedSender;
        uint256 makingAmount;
        uint256 takingAmount;
        uint256 offsets;
        bytes interactions;
    }
    
    function fillOrder(
        Order calldata order,
        bytes calldata signature,
        bytes calldata interaction,
        uint256 makingAmount,
        uint256 takingAmount,
        uint256 skipPermitAndThresholdAmount
    ) external payable returns (uint256 actualMakingAmount, uint256 actualTakingAmount, bytes32 orderHash);
    
    function cancelOrder(Order calldata order) external returns (uint256 orderRemaining, bytes32 orderHash);
    
    function remaining(bytes32 orderHash) external view returns (uint256);
    
    function rawRemainingInvalidatorForOrder(address maker, bytes32 orderHash) external view returns (uint256);
}