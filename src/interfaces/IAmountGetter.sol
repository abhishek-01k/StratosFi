// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./IOrderMixin.sol";

/**
 * @title IAmountGetter - 1inch Dynamic Amount Calculator Interface
 * @notice Interface for dynamic amount calculation hooks
 */
interface IAmountGetter {
    function getMakingAmount(
        IOrderMixin.Order calldata order,
        bytes calldata extension,
        bytes32 orderHash,
        address taker,
        uint256 takingAmount,
        uint256 remainingMakingAmount,
        bytes calldata extraData
    ) external view returns (uint256);

    function getTakingAmount(
        IOrderMixin.Order calldata order,
        bytes calldata extension,
        bytes32 orderHash,
        address taker,
        uint256 makingAmount,
        uint256 remainingMakingAmount,
        bytes calldata extraData
    ) external view returns (uint256);
}