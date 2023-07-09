/// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./NFERC721.sol";

// Factory contract to create new NFT collections
// Save gas as we just deploy proxies instead of the whole contract every time.
contract ContractsFactory is Ownable {
    address immutable IMPLEMENTATION_ADDRESS;

    constructor(address implementation) {
        IMPLEMENTATION_ADDRESS = implementation;
    }

    // This is used by the UI to predict the address of the new collection
    function predictDeterministicAddress(
        bytes32 salt
    ) public view returns (address) {
        return
            Clones.predictDeterministicAddress(
                IMPLEMENTATION_ADDRESS,
                salt
            );
    }


    function createCollection(
        string calldata tokenName,
        string calldata tokenSymbol,
        uint256 mintPrice,
        address erc20PaymentAddress,
        bytes32 salt,
        uint32[] calldata integers,
        string calldata tokenUriEndpoint
    ) external payable {
        address clone = Clones.cloneDeterministic(
            IMPLEMENTATION_ADDRESS,
            salt
        );

        NFERC721(payable(clone)).initialize(
            tokenName,
            tokenSymbol,
            mintPrice,
            erc20PaymentAddress,
            integers,
            tokenUriEndpoint,
            msg.sender
        );

    }



}
