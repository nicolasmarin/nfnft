//SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";

import {IStakeManager} from "./interfaces/IStakeManager.sol";
import {IXdcX} from "./interfaces/IXdcX.sol";
import {ITokenHub} from "./interfaces/ITokenHub.sol";

/**
 * @title Stake Manager Contract
 * @dev Handles Staking of XDC on XDC
 */
contract StakeManager is
    IStakeManager,
    Initializable,
    PausableUpgradeable,
    AccessControlUpgradeable
{
    using SafeERC20Upgradeable for IERC20Upgradeable;

    uint256 public depositsDelegated; // total XDC delegated to validators on Beacon Chain
    uint256 public depositsInContract; // total XDC deposited in contract but not yet transferred to relayer for moving to BC.
    uint256 public depositsBridgingOut; // total XDC in relayer while transfering XDC
    uint256 public totalXdcXToBurn;
    uint256 public totalClaimableXdc; // total XDC available to be claimed and resides in contract

    uint256 public nextDelegateUUID;
    uint256 public nextUndelegateUUID;
    uint256 public minDelegateThreshold;
    uint256 public minUndelegateThreshold;

    address private xdcX;
    address private bcDepositWallet;
    address private tokenHub;

    bool private isDelegationPending; // initial default value false

    mapping(uint256 => BotDelegateRequest) private uuidToBotDelegateRequestMap;
    mapping(uint256 => BotUndelegateRequest)
        private uuidToBotUndelegateRequestMap;
    mapping(address => WithdrawalRequest[]) private userWithdrawalRequests;

    uint256 public constant TEN_DECIMALS = 1e10;
    bytes32 public constant BOT = keccak256("BOT");

    address private manager;
    address private proposedManager;
    uint256 public feeBps; // range {0-10_000}
    mapping(uint256 => bool) public rewardsIdUsed;

    address public redirectAddress;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @param _xdcX - Address of XdcX Token on XDC Chain
     * @param _admin - Address of the admin
     * @param _manager - Address of the manager
     * @param _tokenHub - Address of the manager
     * @param _bcDepositWallet - Beck32 decoding of Address of deposit Bot Wallet on Beacon Chain with `0x` prefix
     * @param _bot - Address of the Bot
     * @param _feeBps - Fee Basis Points
     */
    function initialize(
        address _xdcX,
        address _admin,
        address _manager,
        address _tokenHub,
        address _bcDepositWallet,
        address _bot,
        uint256 _feeBps
    ) external override initializer {
        __AccessControl_init();
        __Pausable_init();

        require(
            ((_xdcX != address(0)) &&
                (_admin != address(0)) &&
                (_manager != address(0)) &&
                (_tokenHub != address(0)) &&
                (_bcDepositWallet != address(0)) &&
                (_bot != address(0))),
            "zero address provided"
        );
        require(_feeBps <= 10000, "_feeBps must not exceed 10000 (100%)");

        _setRoleAdmin(BOT, DEFAULT_ADMIN_ROLE);
        _setupRole(DEFAULT_ADMIN_ROLE, _admin);
        _setupRole(BOT, _bot);

        manager = _manager;
        xdcX = _xdcX;
        tokenHub = _tokenHub;
        bcDepositWallet = _bcDepositWallet;
        minDelegateThreshold = 1e18;
        minUndelegateThreshold = 1e18;
        feeBps = _feeBps;

        emit SetManager(_manager);
        emit SetBotRole(_bot);
        emit SetBCDepositWallet(bcDepositWallet);
        emit SetMinDelegateThreshold(minDelegateThreshold);
        emit SetMinUndelegateThreshold(minUndelegateThreshold);
        emit SetFeeBps(_feeBps);
    }

    ////////////////////////////////////////////////////////////
    /////                                                    ///
    /////              ***Deposit Flow***                    ///
    /////                                                    ///
    ////////////////////////////////////////////////////////////

    /**
     * @dev Allows user to deposit Xdc at XDC and mints XdcX for the user
     */
    function deposit() external payable override whenNotPaused {
        uint256 amount = msg.value;
        require(amount > 0, "Invalid Amount");

        uint256 xdcXToMint = convertXdcToXdcX(amount);

        depositsInContract += amount;

        IXdcX(xdcX).mint(msg.sender, xdcXToMint);
    }

    /**
     * @dev Allows bot to transfer users' funds from this contract to botDepositWallet at Beacon Chain
     * @return _uuid - unique id against which this transfer event was logged
     * @return _amount - Amount of funds transferred for staking
     * @notice Use `getBotDelegateRequest` function to get more details of the logged data
     */
    function startDelegation()
        external
        payable
        override
        whenNotPaused
        onlyRole(BOT)
        returns (uint256 _uuid, uint256 _amount)
    {
        require(!isDelegationPending, "Previous Delegation Pending");

        uint256 tokenHubRelayFee = getTokenHubRelayFee();
        uint256 relayFeeReceived = msg.value;
        _amount = depositsInContract - (depositsInContract % TEN_DECIMALS);

        require(relayFeeReceived >= tokenHubRelayFee, "Insufficient RelayFee");
        require(_amount >= minDelegateThreshold, "Insufficient Deposit Amount");

        _uuid = nextDelegateUUID++; // post-increment : assigns the current value first and then increments
        uuidToBotDelegateRequestMap[_uuid] = BotDelegateRequest({
            startTime: block.timestamp,
            endTime: 0,
            amount: _amount
        });
        depositsBridgingOut += _amount;
        depositsInContract -= _amount;

        isDelegationPending = true;

        // sends funds to BC
        _tokenHubTransferOut(_amount, relayFeeReceived);
    }

    function retryTransferOut(uint256 _uuid)
        external
        payable
        override
        whenNotPaused
        onlyManager
    {
        uint256 tokenHubRelayFee = getTokenHubRelayFee();
        uint256 relayFeeReceived = msg.value;
        require(relayFeeReceived >= tokenHubRelayFee, "Insufficient RelayFee");

        BotDelegateRequest
            storage botDelegateRequest = uuidToBotDelegateRequestMap[_uuid];

        require(
            isDelegationPending &&
                (botDelegateRequest.startTime != 0) &&
                (botDelegateRequest.endTime == 0),
            "Invalid UUID"
        );

        uint256 extraXDC = getExtraXdcInContract();
        require(
            (botDelegateRequest.amount == depositsBridgingOut) &&
                (depositsBridgingOut <= extraXDC),
            "Invalid BridgingOut Amount"
        );
        _tokenHubTransferOut(depositsBridgingOut, relayFeeReceived);
    }

    /**
     * @dev Allows bot to mark the delegateRequest as complete and update the state variables
     * @param _uuid - unique id for which the delgation was completed
     * @notice Use `getBotDelegateRequest` function to get more details of the logged data
     */
    function completeDelegation(uint256 _uuid)
        external
        override
        whenNotPaused
        onlyRole(BOT)
    {
        require(
            (uuidToBotDelegateRequestMap[_uuid].amount > 0) &&
                (uuidToBotDelegateRequestMap[_uuid].endTime == 0),
            "Invalid UUID"
        );

        uuidToBotDelegateRequestMap[_uuid].endTime = block.timestamp;
        uint256 amount = uuidToBotDelegateRequestMap[_uuid].amount;
        depositsBridgingOut -= amount;
        depositsDelegated += amount;

        isDelegationPending = false;
        emit Delegate(_uuid, amount);
    }

    /**
     * @dev Allows bot to update the contract regarding the rewards
     * @param _amount - Amount of reward
     */
    function addRestakingRewards(uint256 _id, uint256 _amount)
        external
        override
        whenNotPaused
        onlyRole(BOT)
    {
        require(_amount > 0, "No reward");
        require(depositsDelegated > 0, "No funds delegated");
        require(!rewardsIdUsed[_id], "Rewards ID already Used");

        depositsDelegated += _amount;
        rewardsIdUsed[_id] = true;

        emit Redelegate(_id, _amount);
    }

    ////////////////////////////////////////////////////////////
    /////                                                    ///
    /////              ***Withdraw Flow***                   ///
    /////                                                    ///
    ////////////////////////////////////////////////////////////

    /**
     * @dev Allows user to request for unstake/withdraw funds
     * @param _amountInXdcX - Amount of XdcX to swap for withdraw
     * @notice User must have approved this contract to spend XdcX
     */
    function requestWithdraw(uint256 _amountInXdcX)
        external
        override
        whenNotPaused
    {
        require(_amountInXdcX > 0, "Invalid Amount");

        totalXdcXToBurn += _amountInXdcX;
        uint256 totalXdcToWithdraw = convertXdcXToXdc(totalXdcXToBurn);
        require(
            totalXdcToWithdraw <= depositsDelegated,
            "Not enough XDC to withdraw"
        );

        userWithdrawalRequests[msg.sender].push(
            WithdrawalRequest({
                uuid: nextUndelegateUUID,
                amountInXdcX: _amountInXdcX,
                startTime: block.timestamp
            })
        );

        IERC20Upgradeable(xdcX).safeTransferFrom(
            msg.sender,
            address(this),
            _amountInXdcX
        );
        emit RequestWithdraw(msg.sender, _amountInXdcX);
    }

    function claimWithdraw(uint256 _idx) external override whenNotPaused {
        address user = msg.sender;
        WithdrawalRequest[] storage userRequests = userWithdrawalRequests[user];

        require(_idx < userRequests.length, "Invalid index");

        WithdrawalRequest storage withdrawRequest = userRequests[_idx];
        uint256 uuid = withdrawRequest.uuid;
        uint256 amountInXdcX = withdrawRequest.amountInXdcX;

        BotUndelegateRequest
            storage botUndelegateRequest = uuidToBotUndelegateRequestMap[uuid];
        require(botUndelegateRequest.endTime != 0, "Not able to claim yet");
        userRequests[_idx] = userRequests[userRequests.length - 1];
        userRequests.pop();

        uint256 totalXdcToWithdraw_ = botUndelegateRequest.amount;
        uint256 totalXdcXToBurn_ = botUndelegateRequest.amountInXdcX;
        uint256 amount = (totalXdcToWithdraw_ * amountInXdcX) /
            totalXdcXToBurn_;

        totalClaimableXdc -= amount;
        AddressUpgradeable.sendValue(payable(user), amount);

        emit ClaimWithdrawal(user, _idx, amount);
    }

    /**
     * @dev Bot uses this function to get amount of XDC to withdraw
     * @return _uuid - unique id against which this Undelegation event was logged
     * @return _amount - Amount of funds required to Unstake
     * @notice Use `getBotUndelegateRequest` function to get more details of the logged data
     */
    function startUndelegation()
        external
        override
        whenNotPaused
        onlyRole(BOT)
        returns (uint256 _uuid, uint256 _amount)
    {
        _uuid = nextUndelegateUUID++; // post-increment : assigns the current value first and then increments
        uint256 totalXdcXToBurn_ = totalXdcXToBurn; // To avoid Reentrancy attack
        _amount = convertXdcXToXdc(totalXdcXToBurn_);
        _amount -= _amount % TEN_DECIMALS;

        require(
            _amount >= minUndelegateThreshold,
            "Insufficient Withdraw Amount"
        );

        uuidToBotUndelegateRequestMap[_uuid] = BotUndelegateRequest({
            startTime: 0,
            endTime: 0,
            amount: _amount,
            amountInXdcX: totalXdcXToBurn_
        });

        depositsDelegated -= _amount;
        totalXdcXToBurn = 0;

        IXdcX(xdcX).burn(address(this), totalXdcXToBurn_);
    }

    /**
     * @dev Allows Bot to communicate regarding start of Undelegation Event at Beacon Chain
     * @param _uuid - unique id against which this Undelegation event was logged
     */
    function undelegationStarted(uint256 _uuid)
        external
        override
        whenNotPaused
        onlyRole(BOT)
    {
        BotUndelegateRequest
            storage botUndelegateRequest = uuidToBotUndelegateRequestMap[_uuid];
        require(
            (botUndelegateRequest.amount > 0) &&
                (botUndelegateRequest.startTime == 0),
            "Invalid UUID"
        );

        botUndelegateRequest.startTime = block.timestamp;
    }

    /**
     * @dev Bot uses this function to send unstaked funds to this contract and
     * communicate regarding completion of Undelegation Event
     * @param _uuid - unique id against which this Undelegation event was logged
     * @notice Use `getBotUndelegateRequest` function to get more details of the logged data
     * @notice send exact amount of XDC
     */
    function completeUndelegation(uint256 _uuid)
        external
        payable
        override
        whenNotPaused
        onlyRole(BOT)
    {
        BotUndelegateRequest
            storage botUndelegateRequest = uuidToBotUndelegateRequestMap[_uuid];
        require(
            (botUndelegateRequest.startTime != 0) &&
                (botUndelegateRequest.endTime == 0),
            "Invalid UUID"
        );

        uint256 amount = msg.value;
        require(
            amount == botUndelegateRequest.amount,
            "Send Exact Amount of Fund"
        );
        botUndelegateRequest.endTime = block.timestamp;
        totalClaimableXdc += botUndelegateRequest.amount;

        emit Undelegate(_uuid, amount);
    }

    ////////////////////////////////////////////////////////////
    /////                                                    ///
    /////                 ***Setters***                      ///
    /////                                                    ///
    ////////////////////////////////////////////////////////////

    function proposeNewManager(address _address) external override onlyManager {
        require(manager != _address, "Old address == new address");
        require(_address != address(0), "zero address provided");

        proposedManager = _address;

        emit ProposeManager(_address);
    }

    function acceptNewManager() external override {
        require(
            msg.sender == proposedManager,
            "Accessible only by Proposed Manager"
        );

        manager = proposedManager;
        proposedManager = address(0);

        emit SetManager(manager);
    }

    function setBotRole(address _address) external override onlyManager {
        require(_address != address(0), "zero address provided");

        _setupRole(BOT, _address);

        emit SetBotRole(_address);
    }

    function revokeBotRole(address _address) external override onlyManager {
        require(_address != address(0), "zero address provided");

        _revokeRole(BOT, _address);

        emit RevokeBotRole(_address);
    }

    /// @param _address - Beck32 decoding of Address of deposit Bot Wallet on Beacon Chain with `0x` prefix
    function setBCDepositWallet(address _address)
        external
        override
        onlyManager
    {
        require(bcDepositWallet != _address, "Old address == new address");
        require(_address != address(0), "zero address provided");

        bcDepositWallet = _address;

        emit SetBCDepositWallet(_address);
    }

    function setMinDelegateThreshold(uint256 _minDelegateThreshold)
        external
        override
        onlyManager
    {
        require(_minDelegateThreshold > 0, "Invalid Threshold");
        minDelegateThreshold = _minDelegateThreshold;

        emit SetMinDelegateThreshold(_minDelegateThreshold);
    }

    function setMinUndelegateThreshold(uint256 _minUndelegateThreshold)
        external
        override
        onlyManager
    {
        require(_minUndelegateThreshold > 0, "Invalid Threshold");
        minUndelegateThreshold = _minUndelegateThreshold;

        emit SetMinUndelegateThreshold(_minUndelegateThreshold);
    }

    function setFeeBps(uint256 _feeBps)
        external
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(_feeBps <= 10000, "_feeBps must not exceed 10000 (100%)");

        feeBps = _feeBps;

        emit SetFeeBps(_feeBps);
    }

    function setRedirectAddress(address _address)
        external
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(redirectAddress != _address, "Old address == new address");
        require(_address != address(0), "zero address provided");

        redirectAddress = _address;

        emit SetRedirectAddress(_address);
    }

    ////////////////////////////////////////////////////////////
    /////                                                    ///
    /////                 ***Getters***                      ///
    /////                                                    ///
    ////////////////////////////////////////////////////////////

    function getTotalPooledXdc() public view override returns (uint256) {
        return (depositsDelegated + depositsBridgingOut + depositsInContract);
    }

    function getContracts()
        external
        view
        override
        returns (
            address _manager,
            address _xdcX,
            address _tokenHub,
            address _bcDepositWallet
        )
    {
        _manager = manager;
        _xdcX = xdcX;
        _tokenHub = tokenHub;
        _bcDepositWallet = bcDepositWallet;
    }

    /**
     * @return relayFee required by TokenHub contract to transfer funds from XDC
     */
    function getTokenHubRelayFee() public view override returns (uint256) {
        return ITokenHub(tokenHub).relayFee();
    }

    function getBotDelegateRequest(uint256 _uuid)
        external
        view
        override
        returns (BotDelegateRequest memory)
    {
        return uuidToBotDelegateRequestMap[_uuid];
    }

    function getBotUndelegateRequest(uint256 _uuid)
        external
        view
        override
        returns (BotUndelegateRequest memory)
    {
        return uuidToBotUndelegateRequestMap[_uuid];
    }

    /**
     * @dev Retrieves all withdrawal requests initiated by the given address
     * @param _address - Address of an user
     * @return userWithdrawalRequests array of user withdrawal requests
     */
    function getUserWithdrawalRequests(address _address)
        external
        view
        override
        returns (WithdrawalRequest[] memory)
    {
        return userWithdrawalRequests[_address];
    }

    /**
     * @dev Checks if the withdrawRequest is ready to claim
     * @param _user - Address of the user who raised WithdrawRequest
     * @param _idx - index of request in UserWithdrawls Array
     * @return _isClaimable - if the withdraw is ready to claim yet
     * @return _amount - Amount of XDC user would receive on withdraw claim
     * @notice Use `getUserWithdrawalRequests` to get the userWithdrawlRequests Array
     */
    function getUserRequestStatus(address _user, uint256 _idx)
        external
        view
        override
        returns (bool _isClaimable, uint256 _amount)
    {
        WithdrawalRequest[] storage userRequests = userWithdrawalRequests[
            _user
        ];

        require(_idx < userRequests.length, "Invalid index");

        WithdrawalRequest storage withdrawRequest = userRequests[_idx];
        uint256 uuid = withdrawRequest.uuid;
        uint256 amountInXdcX = withdrawRequest.amountInXdcX;

        BotUndelegateRequest
            storage botUndelegateRequest = uuidToBotUndelegateRequestMap[uuid];

        // bot has triggered startUndelegation
        if (botUndelegateRequest.amount > 0) {
            uint256 totalXdcToWithdraw_ = botUndelegateRequest.amount;
            uint256 totalXdcXToBurn_ = botUndelegateRequest.amountInXdcX;
            _amount = (totalXdcToWithdraw_ * amountInXdcX) / totalXdcXToBurn_;
        }
        // bot has not triggered startUndelegation yet
        else {
            _amount = convertXdcXToXdc(amountInXdcX);
        }
        _isClaimable = (botUndelegateRequest.endTime != 0);
    }

    function getXdcXWithdrawLimit()
        external
        view
        override
        returns (uint256 _xdcXWithdrawLimit)
    {
        _xdcXWithdrawLimit =
            convertXdcToXdcX(depositsDelegated) -
            totalXdcXToBurn;
    }

    function getExtraXdcInContract()
        public
        view
        override
        returns (uint256 _extraXdc)
    {
        _extraXdc =
            address(this).balance -
            depositsInContract -
            totalClaimableXdc;
    }

    ////////////////////////////////////////////////////////////
    /////                                                    ///
    /////            ***Helpers & Utilities***               ///
    /////                                                    ///
    ////////////////////////////////////////////////////////////

    function _tokenHubTransferOut(uint256 _amount, uint256 _relayFee) private {
        // have experimented with 13 hours and it worked
        uint64 expireTime = uint64(block.timestamp + 1 hours);

        bool isTransferred = ITokenHub(tokenHub).transferOut{
            value: (_amount + _relayFee)
        }(address(0), bcDepositWallet, _amount, expireTime);

        require(isTransferred, "TokenHub TransferOut Failed");
        emit TransferOut(_amount);
    }

    /**
     * @dev Calculates amount of XdcX for `_amount` Xdc
     */
    function convertXdcToXdcX(uint256 _amount)
        public
        view
        override
        returns (uint256)
    {
        uint256 totalShares = IXdcX(xdcX).totalSupply();
        totalShares = totalShares == 0 ? 1 : totalShares;

        uint256 totalPooledXdc = getTotalPooledXdc();
        totalPooledXdc = totalPooledXdc == 0 ? 1 : totalPooledXdc;

        uint256 amountInXdcX = (_amount * totalShares) / totalPooledXdc;

        return amountInXdcX;
    }

    /**
     * @dev Calculates amount of Xdc for `_amountInXdcX` XdcX
     */
    function convertXdcXToXdc(uint256 _amountInXdcX)
        public
        view
        override
        returns (uint256)
    {
        uint256 totalShares = IXdcX(xdcX).totalSupply();
        totalShares = totalShares == 0 ? 1 : totalShares;

        uint256 totalPooledXdc = getTotalPooledXdc();
        totalPooledXdc = totalPooledXdc == 0 ? 1 : totalPooledXdc;

        uint256 amountInXdc = (_amountInXdcX * totalPooledXdc) / totalShares;

        return amountInXdc;
    }

    /**
     * @dev Flips the pause state
     */
    function togglePause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        paused() ? _unpause() : _pause();
    }

    receive() external payable {
        if (msg.sender != redirectAddress) {
            AddressUpgradeable.sendValue(payable(redirectAddress), msg.value);
        }
    }

    modifier onlyManager() {
        require(msg.sender == manager, "Accessible only by Manager");
        _;
    }
}
