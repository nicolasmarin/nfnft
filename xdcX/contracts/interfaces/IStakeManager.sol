//SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

interface IStakeManager {
    struct BotDelegateRequest {
        uint256 startTime;
        uint256 endTime;
        uint256 amount;
    }

    struct BotUndelegateRequest {
        uint256 startTime;
        uint256 endTime;
        uint256 amount;
        uint256 amountInXdcX;
    }

    struct WithdrawalRequest {
        uint256 uuid;
        uint256 amountInXdcX;
        uint256 startTime;
    }

    function initialize(
        address _xdcX,
        address _admin,
        address _manager,
        address _tokenHub,
        address _bot
    ) external;

    function deposit() external payable;

    function delegateXdc()
        external
        returns (uint256 _uuid, uint256 _amount);

    function requestWithdraw(uint256 _amountInXdcX) external;

    function claimWithdraw(uint256 _idx) external;

    function startUndelegation()
        external
        returns (uint256 _uuid, uint256 _amount);

    function undelegationStarted(uint256 _uuid) external;

    function completeUndelegation(uint256 _uuid) external payable;

    function proposeNewManager(address _address) external;

    function acceptNewManager() external;

    function setBotRole(address _address) external;

    function revokeBotRole(address _address) external;

    function setMinDelegateThreshold(uint256 _minDelegateThreshold) external;

    function setMinUndelegateThreshold(uint256 _minUndelegateThreshold)
        external;

    function setRedirectAddress(address _address) external;

    function getTotalPooledXdc() external view returns (uint256);

    function getContracts()
        external
        view
        returns (
            address _manager,
            address _xdcX,
            address _tokenHub
        );

    function getBotDelegateRequest(uint256 _uuid)
        external
        view
        returns (BotDelegateRequest memory);

    function getBotUndelegateRequest(uint256 _uuid)
        external
        view
        returns (BotUndelegateRequest memory);

    function getUserWithdrawalRequests(address _address)
        external
        view
        returns (WithdrawalRequest[] memory);

    function getUserRequestStatus(address _user, uint256 _idx)
        external
        view
        returns (bool _isClaimable, uint256 _amount);

    function getXdcXWithdrawLimit()
        external
        view
        returns (uint256 _xdcXWithdrawLimit);

    function convertXdcToXdcX(uint256 _amount) external view returns (uint256);

    function convertXdcXToXdc(uint256 _amountInXdcX)
        external
        view
        returns (uint256);

    event Delegate(uint256 _uuid, uint256 _amount);
    event TransferOut(uint256 _amount);
    event RequestWithdraw(address indexed _account, uint256 _amountInXdcX);
    event ClaimWithdrawal(
        address indexed _account,
        uint256 _idx,
        uint256 _amount
    );
    event Undelegate(uint256 _uuid, uint256 _amount);
    event Redelegate(uint256 _rewardsId, uint256 _amount);
    event SetManager(address indexed _address);
    event ProposeManager(address indexed _address);
    event SetBotRole(address indexed _address);
    event RevokeBotRole(address indexed _address);
    event SetMinDelegateThreshold(uint256 _minDelegateThreshold);
    event SetMinUndelegateThreshold(uint256 _minUndelegateThreshold);
    event SetRedirectAddress(address indexed _address);
}
