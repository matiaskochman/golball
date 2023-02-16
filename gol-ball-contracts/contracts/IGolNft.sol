// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v4.8.0) (token/ERC721/IERC721.sol)

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/**
 * @dev Required interface of an ERC721 compliant contract.
 */
interface IGolNft is IERC721 {
  function burn(uint256 tokenId) external;
  function getTokenIdListForAddress(address to) external;
  function exists(uint256 tokenId) external view returns (bool);
}
