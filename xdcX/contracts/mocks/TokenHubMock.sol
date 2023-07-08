// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import {ITokenHub} from "../interfaces/ITokenHub.sol";

contract TokenHubMock is ITokenHub {
    uint256 public constant TEN_DECIMALS = 1e10;

    function transferOut(
        address /*recipient*/,
        uint256 /*amount*/
    ) external payable override returns (bool) {
        require(
            msg.value % TEN_DECIMALS == 0,
            "invalid received XDC amount: precision loss in amount conversion"
        );
        return true;
    }

    function undelegate(
        uint256 /*amount*/
    ) external pure override returns (bool) {
        return true;
    }

}
