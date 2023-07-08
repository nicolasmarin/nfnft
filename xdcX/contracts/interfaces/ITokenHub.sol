//SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

/**
 * @title XDC TokenHub interface
 * @dev Helps in transfers of XDC and XRC20 tokens
 */
interface ITokenHub {
    function relayFee() external view returns (uint256);

    function transferOut(
        address contractAddr,
        address recipient,
        uint256 amount,
        uint64 expireTime
    ) external payable returns (bool);
}
