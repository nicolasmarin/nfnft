# Integration guide

Liquid staking is achieved through `StakeManager` contract and the yield-bearing ERC-20 token `XdcX` is given to the user.

## 1. Stake XDC

Send XDC and receive liquid staking XdcX token.

```SOLIDITY
IStakeManager stakeManager = IStakeManager(STAKE_MANAGER_ADDRESS);
IStakeManager.deposit{value: msg.value}();
uint256 amountInXdcX = IXdcX(XDCX_ADDRESS).balanceOf(msg.sender);

emit StakeEvent(msg.sender, msg.value, amountInXdcX);
```

## 2. Unstake XDC

Send XdcX and create a withdrawal request.  
_XdcX approval should be given._

```SOLIDITY
require(
    IXdcX(XDCX_ADDRESS).approve(STAKE_MANAGER_ADDRESS, amount),
    "Not approved"
);
IStakeManager stakeManager = IStakeManager(STAKE_MANAGER_ADDRESS);
IStakeManager.requestWithdraw(amount);

emit UnstakeEvent(msg.sender, amount);
```

## 3. Claim XDC

After 7-15 days, XDC can be withdrawn.

```SOLIDITY
IStakeManager stakeManager = IStakeManager(STAKE_MANAGER_ADDRESS);
(bool isClaimable, uint256 amount) = getUserRequestStatus(
    msg.sender,
    _idx
);
require(isClaimable, "Not ready yet");

IStakeManager.claimWithdraw(_idx);
uint256 amount = address(msg.sender).balance;

emit ClaimEvent(msg.sender, amount);
```

## Full example:

```SOLIDITY
pragma solidity ^0.8.0;

import "IXdcX.sol";
import "IStakeManager.sol";

contract Example {
    event StakeEvent(
        address indexed _address,
        uint256 amountInXdc,
        uint256 amountInXdcX
    );
    event UnstakeEvent(address indexed _address, uint256 amountInXdcX);
    event ClaimEvent(address indexed _address, uint256 amountInXdc);

    address private STAKE_MANAGER_ADDRESS =
        "0x7276241a669489E4BBB76f63d2A43Bfe63080F2"; //mainnet address
    address private XDCX_ADDRESS = "0x1bdd3Cf7F79cfB8EdbB955f20ad99211551BA275"; //mainnet address

    function stake() external payable {
        IStakeManager stakeManager = IStakeManager(STAKE_MANAGER_ADDRESS);
        IStakeManager.deposit{value: msg.value}();
        uint256 amountInXdcX = IXdcX(XDCX_ADDRESS).balanceOf(msg.sender);

        emit StakeEvent(msg.sender, msg.value, amountInXdcX);
    }

    function unstake(uint256 _amount) external {
        require(
            IXdcX(XDCX_ADDRESS).approve(STAKE_MANAGER_ADDRESS, _amount),
            "Not approved"
        );
        IStakeManager stakeManager = IStakeManager(STAKE_MANAGER_ADDRESS);
        IStakeManager.requestWithdraw(_amount);

        emit UnstakeEvent(msg.sender, _amount);
    }

    function claim(uint256 _idx) external {
        IStakeManager stakeManager = IStakeManager(STAKE_MANAGER_ADDRESS);
        (bool isClaimable, uint256 amount) = getUserRequestStatus(
            msg.sender,
            _idx
        );
        require(isClaimable, "Not ready yet");

        IStakeManager.claimWithdraw(_idx);
        uint256 amount = address(msg.sender).balance;

        emit ClaimEvent(msg.sender, amount);
    }
}

```
