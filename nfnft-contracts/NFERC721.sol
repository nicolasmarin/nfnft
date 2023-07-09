/// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/interfaces/IERC2981Upgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

bytes constant BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
bytes constant BASE64_TABLE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

error CollectionSoldOut();
error MintPriceMustBeGreaterThanZero();
error RoyaltyFeeTooHigh();
error TotalSupplyMustBeGreaterThanZero();
error InvalidPaymentAddress();
error WithdrawPenaltyTimeTooHigh();
error WithdrawPenaltyPercentageTooHigh();

/// NoFear NFT ERC721 Contract
/// Development done under the EthBarcelona hackathon 2023
contract NFERC721 is
    OwnableUpgradeable,
    ERC721Upgradeable
{
    event Withdraw(address indexed to, uint256 amount);    

    uint256 internal _mintPrice;
    string internal _tokenUriEndpoint;

    uint256 public totalAmountOfStakes;
    uint256 public totalStakedRaw;
    mapping(uint256 => uint256) public amountOfStakes;
    mapping(uint256 => uint256) public minimumMintFeeWhenMinting;
    mapping(uint256 => uint256) public stakedRaw;
    mapping(address => uint256) public rawPendingToWithdraw;
    mapping(address => uint256) public totalWithdrawn;
    mapping(uint256 => uint256) public mintingDate;

    address public erc20PaymentAddress;

    uint32 internal _soldTokens;
    uint16 public royaltyFee;
    uint16 public mintRoyaltyFee;
    uint16 public rewardsRoyaltyFee;
    uint32 public collectionSize;
    uint32 public burnedTokens;

    uint32 public withdrawPenaltyTime;
    uint16 public withdrawPenaltyPercentage;

    // To avoid using the implementation, as it is just intented to be used by proxies.
    constructor() {
        _disableInitializers();
    }    

    /// @notice To be called to create the collection. Can only be called once.
    function initialize(
        string memory tokenName,
        string memory tokenSymbol,
        uint256 iMintPrice,
        address iErc20PaymentAddress,
        uint32[] calldata integers,
        string memory tokenUriEndpoint,
        address owner
    ) public initializer {
        __ERC721_init(tokenName, tokenSymbol);

        // We need to set the owner here, since the msg.sender will be a contract and not the owner.
        _transferOwnership(owner);

        // Token URI endpoint basepath for the metadata.
        _tokenUriEndpoint = tokenUriEndpoint;

        // Finally the checks
        if (iErc20PaymentAddress == address(0)) revert InvalidPaymentAddress();
        erc20PaymentAddress = iErc20PaymentAddress;
        if (integers[4] > 365 days) revert WithdrawPenaltyTimeTooHigh();
        if (uint16(integers[5]) > 10_000) revert WithdrawPenaltyPercentageTooHigh();
        withdrawPenaltyTime = integers[4];
        withdrawPenaltyPercentage = uint16(integers[5]);

        if (integers[0] == 0) revert TotalSupplyMustBeGreaterThanZero();
        collectionSize = integers[0];

        if (uint16(integers[1]) > 10_00) revert RoyaltyFeeTooHigh();
        royaltyFee = uint16(integers[1]);

        if (uint16(integers[2]) > 10_00) revert RoyaltyFeeTooHigh();
        mintRoyaltyFee = uint16(integers[2]);

        if (uint16(integers[3]) > 10_00) revert RoyaltyFeeTooHigh();
        rewardsRoyaltyFee = uint16(integers[3]);

        if (iMintPrice == 0) revert MintPriceMustBeGreaterThanZero();
        _mintPrice = iMintPrice;

    }

    function _mint(bool firstMinting, address to, uint256 tokenId, uint256 mintPricePerToken)
        internal
    {
        // To keep track of the minting date
        mintingDate[tokenId] = block.timestamp;

        // The owner fee, which is deducted from the mint price
        uint ownerFee = (mintRoyaltyFee *  _mintPrice) / 100_00;
        uint mintPriceMinusFee = mintPricePerToken - ownerFee;

        minimumMintFeeWhenMinting[tokenId] = _mintPrice - ownerFee;
        rawPendingToWithdraw[owner()] += ownerFee;

        uint totalAmountWithRewards = getTotalAmountWithRewards();
        uint currentTokenStakes;

        if (firstMinting || totalStakedRaw == 0 || totalAmountOfStakes == 0 || totalAmountWithRewards == 0) {
            totalAmountOfStakes = 0;
            totalStakedRaw = 0;
            currentTokenStakes = mintPriceMinusFee;
        } else {
            uint newTotalStakes = (totalAmountWithRewards + mintPriceMinusFee) * totalAmountOfStakes / totalAmountWithRewards;
            currentTokenStakes = newTotalStakes - totalAmountOfStakes;
        }

        totalAmountOfStakes += currentTokenStakes;
        totalStakedRaw += mintPriceMinusFee;

        amountOfStakes[tokenId] = currentTokenStakes;
        stakedRaw[tokenId] = mintPriceMinusFee;

        super._mint(to, tokenId);
    }

    function getBurnableAmount(uint256 tokenId) public view returns (uint256 amountToWithdraw) {
        require(_exists(tokenId), "ERC721: burn of nonexistent token");

        uint totalAmountStaked = getTotalAmountWithRewards();
        uint unburnedTokens = collectionSize - burnedTokens;
        uint relativeStakes = amountOfStakes[tokenId];

        if (unburnedTokens <= 1) {
            amountToWithdraw = totalAmountStaked;
        } else {
            amountToWithdraw = (relativeStakes * totalAmountStaked) / totalAmountOfStakes;
            uint unburnedPercentagePenalty = (unburnedTokens * 100_00) / collectionSize;
            assert(unburnedPercentagePenalty <= 100_00);
            uint penaltyPercentage = unburnedPercentagePenalty;
            uint elapsed = block.timestamp - mintingDate[tokenId];

            if (elapsed < withdrawPenaltyTime) {
                uint remainingTime = withdrawPenaltyTime - elapsed;
                uint remainingTimePercentagePenalty = (remainingTime * 100_00) / withdrawPenaltyTime;
                assert(remainingTimePercentagePenalty <= 100_00);
                penaltyPercentage += remainingTimePercentagePenalty;
            }

            assert(penaltyPercentage <= 200_00);

            uint256 penaltiesAmount = (minimumMintFeeWhenMinting[tokenId] * penaltyPercentage * withdrawPenaltyPercentage) / 100_00 / 100_00;
            if (penaltiesAmount > amountToWithdraw) return 0;
            amountToWithdraw -= penaltiesAmount;

        }
    }

    modifier onlyNFTOwner(uint256 tokenId) {
        require(msg.sender == ownerOf(tokenId), "Caller must be owner");
        _;
    }

    function burnToWithdraw(uint256 tokenId) public onlyNFTOwner(tokenId) {
        uint amountToWithdraw = getBurnableAmount(tokenId);
        _burn(tokenId);
        burnedTokens++;
        totalAmountOfStakes -= amountOfStakes[tokenId];
        totalStakedRaw -= stakedRaw[tokenId];
        delete amountOfStakes[tokenId];
        delete stakedRaw[tokenId];
        _send(msg.sender, amountToWithdraw);
    }

    function totalPendingToWithdraw(address owner) public view returns (uint256 pendingToWithdraw, bool totallyUnbonded) {
        pendingToWithdraw = rawPendingToWithdraw[owner];
        totallyUnbonded = true;
    }

    function withdrawPending() public {
        uint amountToWithdraw = rawPendingToWithdraw[msg.sender];
        delete(rawPendingToWithdraw[msg.sender]);

        if (amountToWithdraw > 0) {
            _send(msg.sender, amountToWithdraw);
        } else {
            revert("No pending amount to withdraw");
        }

        totalWithdrawn[msg.sender] += amountToWithdraw;
        emit Withdraw(msg.sender, amountToWithdraw);
    }

    function getTotalAmountWithRewards() public view returns (uint256 amount) {
        return IERC20Upgradeable(erc20PaymentAddress).balanceOf(address(this));
    }

    /// @notice Returns the total amount staked by the contract. Not including rewards.
    function getContractStaked() public view returns (uint256 amount) {
        return IERC20Upgradeable(erc20PaymentAddress).balanceOf(address(this));

    }

    function unstakeableAmount(uint256 tokenId) public view returns (uint256 unstakeable) {
        uint256 totalValueBefore = getTotalAmountWithRewards();
        (unstakeable, ) = _unstakeableAmountAux(tokenId, totalValueBefore);
    }

    function _unstakeableAmountAux(uint256 tokenId, uint256 totalValueBefore) private view returns (uint256 unstakeable, uint256 tokenValueBefore) {

        uint256 unburnedTokens = collectionSize - burnedTokens;
        if (unburnedTokens <= 1) {
            tokenValueBefore = totalValueBefore;
        } else {
            tokenValueBefore = (amountOfStakes[tokenId] * totalValueBefore) / totalAmountOfStakes;
        }

        if (tokenValueBefore > minimumMintFeeWhenMinting[tokenId]) {
            unstakeable = tokenValueBefore - minimumMintFeeWhenMinting[tokenId];
        }
    }

    function decreaseStaking(uint256 tokenId, uint256 amountToDecrease) onlyNFTOwner(tokenId) external {
        require(amountToDecrease > 0, "Decrease amount must be higher than 0");
        uint256 totalValueBefore = getTotalAmountWithRewards();
        (uint256 unstakeable, uint256 tokenValueBefore) = _unstakeableAmountAux(tokenId, totalValueBefore);
        require(amountToDecrease <= unstakeable, "Decrease amount is higher than unstakeable amount");

        uint256 totalValueAfter = totalValueBefore - amountToDecrease;
        uint256 tokenValueAfter = tokenValueBefore - amountToDecrease;
        assert(tokenValueAfter >= minimumMintFeeWhenMinting[tokenId]);

        if (tokenValueAfter < stakedRaw[tokenId]) {

            uint256 differenceOfStaked = stakedRaw[tokenId] - tokenValueAfter;
            stakedRaw[tokenId] = tokenValueAfter;
            totalStakedRaw -= differenceOfStaked;
        }

        uint256 newAmountOfStakes = (totalAmountOfStakes * totalValueAfter) / totalValueBefore;
        uint256 differenceOfStakes = totalAmountOfStakes - newAmountOfStakes;
        amountOfStakes[tokenId] -= differenceOfStakes;
        totalAmountOfStakes -= differenceOfStakes;

        _send(msg.sender, amountToDecrease);

    }

    function _send(address to, uint256 amount) private {
        SafeERC20Upgradeable.safeTransfer(IERC20Upgradeable(erc20PaymentAddress), to, amount);
    }

    function increaseStaking(uint256 tokenId, uint256 amountToIncrease) payable external {
        require(amountToIncrease > 0, "Increase amount must be higher than 0");
        require(_exists(tokenId), "Increase of nonexistent token");
        uint256 totalValueBefore = getTotalAmountWithRewards();
        _requirePayment(amountToIncrease, 1);

        stakedRaw[tokenId] += amountToIncrease;
        totalStakedRaw += amountToIncrease;

        uint256 totalValueAfter = totalValueBefore + amountToIncrease;
        uint256 newAmountOfStakes = (totalAmountOfStakes * totalValueAfter) / totalValueBefore;
        uint256 differenceOfStakes = newAmountOfStakes - totalAmountOfStakes;
        amountOfStakes[tokenId] += differenceOfStakes;
        totalAmountOfStakes += differenceOfStakes;
    }


    function _requirePayment(uint256 p_mintPrice, uint256 amount) internal {

        if (p_mintPrice == 0) return;
        uint256 totalAmount = p_mintPrice * amount;

        SafeERC20Upgradeable.safeTransferFrom(
            IERC20Upgradeable(erc20PaymentAddress),
            msg.sender,
            address(this),
            totalAmount
        );
    }    

    function mint(uint256 price) external payable {
        require(price >= _mintPrice, "Price lower than mintPrice");
        bool firstMint = _soldTokens <= burnedTokens;
        unchecked {
            if ((++_soldTokens) > collectionSize) revert CollectionSoldOut();
        }
        _mint(firstMint, msg.sender, _soldTokens, price);
        _requirePayment(price, 1);
    }

    /// @notice Mints `amount` NFTs to the caller (msg.sender). Requires `minting type` to be `sequential` and the `mintPrice` to be send (if `Native payment`) or approved (if `ERC-20` payment).
    /// @param amount The number of NFTs to mint
    function mint(uint256 amount, uint256 price) external payable {
        require(price >= _mintPrice, "Price lower than mintPrice");
        _mintSequentialWithChecks(msg.sender, amount, price);
        _requirePayment(price, amount);
    }

    function _mintSequentialWithChecks(address to, uint256 amount, uint256 price) private {
        if ((_soldTokens + amount) > collectionSize) revert CollectionSoldOut();

        _mintSequential(to, amount, price);
    }

    function _mintSequential(address to, uint256 amount, uint256 price) internal virtual {
        for (uint256 i; i < amount; ) {
            bool firstMint = _soldTokens <= burnedTokens;
            unchecked {
                _mint(firstMint, to, ++_soldTokens, price);
                ++i;
            }
        }
    }

    /// @notice Returns the minting price of one NFT.
    /// @return Mint price for one NFT in native coin or ERC-20.
    function mintPrice() external view returns (uint256) {
        return _mintPrice;
    }


    /// @notice A distinct Uniform Resource Identifier (URI) for a given asset.
    /// @dev Throws if `_tokenId` is not a valid NFT. URIs are defined in RFC
    ///  3986. The URI may point to a JSON file that conforms to the "ERC721
    ///  Metadata JSON Schema".
    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        _requireMinted(tokenId);
        return string(abi.encodePacked(_tokenUriEndpoint, StringsUpgradeable.toString(block.chainid), "/", StringsUpgradeable.toString(tokenId), "/", StringsUpgradeable.toString(uint(uint160(address(this))))));
    }


    /// @notice Returns the current total supply.
    /// @return Current total supply.
    function totalSupply() external view returns (uint256) {
        return _soldTokens;
    }

    function royaltyInfo(
        uint256, 
        uint256 salePrice
    ) external view virtual returns (address receiver, uint256 royaltyAmount) {
        return (address(this), uint256((salePrice * royaltyFee) / 100_00));
    }


}
