// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract GolNft is ERC721, ERC721Burnable, AccessControl {
    using Counters for Counters.Counter;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant ADMIN_CONTRACT = keccak256("ADMIN_CONTRACT");
    Counters.Counter private _tokenIdCounter;
    mapping(address => uint[]) private tokenIdListForAddress;

    constructor(address admin) ERC721("GolToken", "GOL") {
        _setupRole(ADMIN_CONTRACT, admin);
        _grantRole(MINTER_ROLE, msg.sender);
    }

    function safeMint(address to) public onlyRole(MINTER_ROLE) {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        tokenIdListForAddress[msg.sender].push(tokenId); 
    }

    function burn(uint256 tokenId) public override onlyRole(ADMIN_CONTRACT) {
      _burn(tokenId);
    }

    function getTokenIdListForAddress(address to) external view returns(uint[] memory){
        require(to != address(0), "invalid address");
        return tokenIdListForAddress[to];
    }

    function exists(uint256 tokenId) external view returns (bool) {
        return _exists(tokenId);
    }
    // The following functions are overrides required by Solidity.
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}