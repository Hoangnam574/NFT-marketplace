"use client";

import { useEffect, useState } from "react";
import { useAccount, useReadContracts } from "wagmi";
import { NFTCard } from "~~/components/NFTCard";
import { useDeployedContractInfo, useScaffoldEventHistory, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { resolveIPFS } from "~~/utils/ipfs";
import { notification } from "~~/utils/scaffold-eth";

export default function MarketplacePage() {
  const { address } = useAccount();
  const [activeListings, setActiveListings] = useState<any[]>([]);
  const [loadingMetadata, setLoadingMetadata] = useState(false);

  const { data: marketplaceContractData } = useDeployedContractInfo({ contractName: "Marketplace" });
  const { data: myNftContractData } = useDeployedContractInfo({ contractName: "MyNFT" });

  // Get all NFTListed events
  const { data: listedEvents, isLoading: isLoadingEvents } = useScaffoldEventHistory({
    contractName: "Marketplace",
    eventName: "NFTListed",
    fromBlock: 0n,
  });

  // Since an NFT might be listed multiple times or bought/canceled,
  // we need to read the current state of each listing from the contract.
  // We extract unique (nftContract, tokenId) pairs from the events.
  const uniqueListingsMap = new Map<string, { nftContract: string; tokenId: bigint }>();

  if (listedEvents) {
    for (const event of listedEvents) {
      const { nftContract, tokenId } = event.args;
      if (nftContract && tokenId !== undefined) {
        uniqueListingsMap.set(`${nftContract}-${tokenId}`, { nftContract, tokenId });
      }
    }
  }

  const uniqueListings = Array.from(uniqueListingsMap.values());

  // Check the current listing state for each unique pair
  const { data: currentListingsState } = useReadContracts({
    contracts: uniqueListings.map(({ nftContract, tokenId }) => ({
      address: marketplaceContractData?.address,
      abi: marketplaceContractData?.abi as any,
      functionName: "listings",
      args: [nftContract, tokenId],
    })),
  });

  // Filter only active listings
  const activeListingsPairs: any[] = [];
  if (currentListingsState) {
    for (let i = 0; i < currentListingsState.length; i++) {
      const result = currentListingsState[i].result as any;
      if (result && result[2] === true) {
        // result[2] is 'active' boolean
        activeListingsPairs.push({
          ...uniqueListings[i],
          seller: result[0],
          price: result[1],
        });
      }
    }
  }

  // Now fetch the token URI for each active listing
  const { data: tokenUrisData } = useReadContracts({
    contracts: activeListingsPairs.map(({ nftContract, tokenId }) => ({
      address: nftContract,
      abi: myNftContractData?.abi as any, // Assuming all NFTs follow the same ABI for tokenURI
      functionName: "tokenURI",
      args: [tokenId],
    })),
  });

  const { writeContractAsync: writeMarketplaceContract, isPending: isBuying } = useScaffoldWriteContract({
    contractName: "Marketplace",
  });

  useEffect(() => {
    const fetchMetadata = async () => {
      if (!tokenUrisData || tokenUrisData.length === 0) {
        setActiveListings([]);
        return;
      }

      setLoadingMetadata(true);
      const fetchedListings = [];

      for (let i = 0; i < tokenUrisData.length; i++) {
        const uriResult = tokenUrisData[i];
        if (uriResult.status === "success") {
          const uri = uriResult.result as string;
          const listingPair = activeListingsPairs[i];

          try {
            const httpUri = resolveIPFS(uri);
            const res = await fetch(httpUri);
            const metadata = await res.json();

            fetchedListings.push({
              nftContract: listingPair.nftContract,
              tokenId: listingPair.tokenId.toString(),
              name: metadata.name,
              description: metadata.description,
              image: resolveIPFS(metadata.image),
              seller: listingPair.seller,
              price: listingPair.price,
            });
          } catch (e) {
            console.error("Error fetching metadata for listing", listingPair, e);
          }
        }
      }

      setActiveListings(fetchedListings);
      setLoadingMetadata(false);
    };

    if (activeListingsPairs.length > 0) {
      fetchMetadata();
    } else {
      setActiveListings([]);
    }
  }, [tokenUrisData]);

  const handleBuy = async (nftContract: string, tokenId: string, price: bigint) => {
    try {
      await writeMarketplaceContract({
        functionName: "buyNFT",
        args: [nftContract, BigInt(tokenId)],
        value: price,
      });
      notification.success("Successfully bought NFT!");
    } catch (e: any) {
      console.error(e);
      notification.error("Failed to buy NFT: " + e.message);
    }
  };

  return (
    <div className="flex flex-col items-center pt-10 px-5">
      <h1 className="text-4xl font-bold mb-8">NFT Marketplace</h1>

      {isLoadingEvents || loadingMetadata ? (
        <span className="loading loading-spinner loading-lg"></span>
      ) : activeListings.length === 0 ? (
        <p>No NFTs are currently listed for sale.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl">
          {activeListings.map(listing => (
            <NFTCard
              key={`${listing.nftContract}-${listing.tokenId}`}
              nft={{
                tokenId: listing.tokenId,
                image: listing.image,
                name: listing.name,
                description: listing.description,
                price: listing.price,
                seller: listing.seller,
              }}
              actionText={listing.seller === address ? "Your Listing" : "Buy NFT"}
              onAction={
                listing.seller === address
                  ? undefined
                  : () => handleBuy(listing.nftContract, listing.tokenId, listing.price)
              }
              isPending={isBuying}
            />
          ))}
        </div>
      )}
    </div>
  );
}
