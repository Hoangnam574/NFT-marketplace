// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MyNFT
 * @dev Simple ERC721 Token with URI storage for NFT Marketplace
 */
contract MyNFT is ERC721, ERC721Enumerable, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    event NFTMinted(address indexed recipient, uint256 indexed tokenId, string tokenURI);

    constructor(address initialOwner) ERC721("MyNFT", "MNFT") Ownable(initialOwner) {
        _nextTokenId = 1;
    }

    function mintNFT(address recipient, string memory _tokenURI) public returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        
        _mint(recipient, tokenId);
        _setTokenURI(tokenId, _tokenURI);

        emit NFTMinted(recipient, tokenId, _tokenURI);

        return tokenId;
    }

    function mintBatch(address recipient, string[] memory _tokenURIs) public {
        require(_tokenURIs.length > 0, "Must mint at least one NFT");
        for (uint256 i = 0; i < _tokenURIs.length; i++) {
            uint256 tokenId = _nextTokenId++;
            _mint(recipient, tokenId);
            _setTokenURI(tokenId, _tokenURIs[i]);
            emit NFTMinted(recipient, tokenId, _tokenURIs[i]);
        }
    }

    // The following functions are overrides required by Solidity.
    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
