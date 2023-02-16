// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./IGolNft.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/metatx/ERC2771Context.sol";
// import "hardhat/console.sol";

contract GolBallAdmin is AccessControl, ERC721Holder, ERC2771Context {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    mapping(address => bool) private _collections;

    event ItemBurned(address indexed sender, uint256 indexed tokenId, address indexed collectionAddress);
    event CollectionAdded(address indexed collectionAddress);
    event CollectionRemoved(address indexed collectionAddress);

    constructor(address trustedForwarder, address adminRole) ERC2771Context(trustedForwarder) {
        _setupRole(ADMIN_ROLE, adminRole);
    }

    function addCollection(address collectionAddress) external {
        require(!_collections[collectionAddress], "Collection already added");
        _collections[collectionAddress] = true;
        emit CollectionAdded(collectionAddress);
    }

    function removeCollection(address collectionAddress) external onlyRole(ADMIN_ROLE) {
        require(_collections[collectionAddress], "Collection not found");
        _collections[collectionAddress] = false;
        emit CollectionRemoved(collectionAddress);
    }

    function checkCollection(address collectionAddress) external view returns (bool) {
        return _collections[collectionAddress];
    }

    function swap(address collectionAddress, uint256 tokenId) external {
        require(_collections[collectionAddress], "Collection not found");
        require(IGolNft(collectionAddress).ownerOf(tokenId) == _msgSender(), "incorrect owner");
        IGolNft(collectionAddress).safeTransferFrom(_msgSender(), address(this), tokenId);
    }

    function burnItem(address collectionAddress, uint256 tokenId) external onlyRole(ADMIN_ROLE){
        require(_collections[collectionAddress], "Collection not found");
        require(IGolNft(collectionAddress).exists(tokenId), "tokenId does not exist");
        IGolNft(collectionAddress).burn(tokenId);
        
        emit ItemBurned(_msgSender(), tokenId, collectionAddress);
    }

    function ownerOfToken(address collectionAddress, uint256 tokenId) public view returns (address) {
        return IGolNft(collectionAddress).ownerOf(tokenId);
    }

    function _msgSender() internal view virtual override(ERC2771Context, Context) returns (address sender) {
        return ERC2771Context._msgSender();
    }

    function _msgData() internal view virtual override(ERC2771Context, Context) returns (bytes calldata) {
        return ERC2771Context._msgData();
    }
}

/*
Se ha heredado el contrato de ERC2771Context para poder trabajar con meta-transacciones. 
La función constructor ahora toma como argumento la dirección del forwarder de confianza.

Los métodos _msgSender y _msgData han sido sobrescritos para llamar a las funciones correspondientes de ERC2771Context.

Cabe destacar que el contrato también deberá ser adaptado a las necesidades específicas del caso de uso, 
y se deben realizar las debidas pruebas y auditorías de seguridad antes de su implementación.
*/