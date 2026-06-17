// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Marketplace
 * @dev NFT Marketplace for listing and buying NFTs
 */
contract Marketplace is ReentrancyGuard, Ownable {
    uint256 public feePercentage = 1; // 1% fee

    struct Listing {
        address seller;
        uint256 price;
        bool active;
    }

    // nftContract => tokenId => Listing
    mapping(address => mapping(uint256 => Listing)) public listings;

    event NFTListed(address indexed seller, address indexed nftContract, uint256 indexed tokenId, uint256 price);
    event NFTBought(address indexed buyer, address indexed nftContract, uint256 indexed tokenId, uint256 price);
    event ListingCanceled(address indexed seller, address indexed nftContract, uint256 indexed tokenId);

    constructor(address initialOwner) Ownable(initialOwner) {}

    /**
     * @dev Sets a new fee percentage
     * @param _newFee The new fee percentage (e.g., 1 for 1%)
     */
    function setFeePercentage(uint256 _newFee) external onlyOwner {
        require(_newFee <= 10, "Fee too high"); // Max 10%
        feePercentage = _newFee;
    }

    /**
     * @dev Lists an NFT for sale on the marketplace
     * @param nftContract The address of the NFT contract
     * @param tokenId The ID of the NFT
     * @param price The sale price in wei
     */
    function listNFT(address nftContract, uint256 tokenId, uint256 price) external nonReentrant {
        require(price > 0, "Price must be greater than zero");
        
        IERC721 nft = IERC721(nftContract);
        require(nft.ownerOf(tokenId) == msg.sender, "Not the owner");
        require(nft.getApproved(tokenId) == address(this) || nft.isApprovedForAll(msg.sender, address(this)), "Marketplace not approved");

        listings[nftContract][tokenId] = Listing({
            seller: msg.sender,
            price: price,
            active: true
        });

        emit NFTListed(msg.sender, nftContract, tokenId, price);
    }

    /**
     * @dev Buys an active listing
     * @param nftContract The address of the NFT contract
     * @param tokenId The ID of the NFT
     */
    function buyNFT(address nftContract, uint256 tokenId) external payable nonReentrant {
        Listing memory listing = listings[nftContract][tokenId];
        require(listing.active, "Listing is not active");
        require(msg.value == listing.price, "Incorrect price");

        listings[nftContract][tokenId].active = false; // Mark as inactive

        // Calculate fee
        uint256 feeAmount = (listing.price * feePercentage) / 100;
        uint256 sellerAmount = listing.price - feeAmount;

        // Transfer funds to seller
        (bool success, ) = payable(listing.seller).call{value: sellerAmount}("");
        require(success, "Transfer to seller failed");

        // The fee stays in this contract balance until withdrawn by owner

        // Transfer NFT to buyer
        IERC721(nftContract).safeTransferFrom(listing.seller, msg.sender, tokenId);

        emit NFTBought(msg.sender, nftContract, tokenId, listing.price);
    }

    /**
     * @dev Cancels an active listing
     * @param nftContract The address of the NFT contract
     * @param tokenId The ID of the NFT
     */
    function cancelListing(address nftContract, uint256 tokenId) external nonReentrant {
        Listing memory listing = listings[nftContract][tokenId];
        require(listing.active, "Listing is not active");
        require(listing.seller == msg.sender, "Not the seller");

        listings[nftContract][tokenId].active = false;

        emit ListingCanceled(msg.sender, nftContract, tokenId);
    }

    /**
     * @dev Withdraws accumulated marketplace fees to the owner
     */
    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Transfer failed");
    }
}
