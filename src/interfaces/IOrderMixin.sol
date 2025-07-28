// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title IOrderMixin - 1inch Limit Order Protocol Interface
 * @notice Core interface for 1inch limit orders
 */
interface IOrderMixin {
    struct Order {
        uint256 salt;
        uint256 maker;      // Address packed as uint256
        uint256 receiver;   // Address packed as uint256
        uint256 makerAsset; // Address packed as uint256
        uint256 takerAsset; // Address packed as uint256
        uint256 makingAmount;
        uint256 takingAmount;
        uint256 makerTraits; // MakerTraits packed as uint256
    }

    function fillOrder(
        Order calldata order,
        bytes calldata signature,
        bytes calldata interaction,
        uint256 makingAmount,
        uint256 takingAmount
    ) external payable returns (
        uint256 actualMakingAmount,
        uint256 actualTakingAmount,
        bytes32 orderHash
    );

    function cancelOrder(uint256 orderInfo) external;
    function hashOrder(Order calldata order) external view returns (bytes32);
}