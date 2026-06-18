"use client";

import { useEffect, useState } from "react";
import { parseEther } from "viem";
import { useAccount, useReadContracts } from "wagmi";
import { NFTCard } from "~~/components/NFTCard";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { resolveIPFS } from "~~/utils/ipfs";
import { notification } from "~~/utils/scaffold-eth";

export default function MyNFTsPage() {
  const { address } = useAccount();
  const [nfts, setNfts] = useState<any[]>([]);
  const [loadingMetadata, setLoadingMetadata] = useState(false);

  // State for the modal
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);
  const [listPrice, setListPrice] = useState("");

  const { data: balance } = useScaffoldReadContract({
    contractName: "MyNFT",
    functionName: "balanceOf",
    args: [address],
  });

  const { data: myNftContractData } = useDeployedContractInfo({ contractName: "MyNFT" });
  const { data: marketplaceContractData } = useDeployedContractInfo({ contractName: "Marketplace" });

  // Create an array of indices [0, 1, 2, ... balance-1]
  const indices = balance ? Array.from({ length: Number(balance) }, (_, i) => BigInt(i)) : [];

  // Fetch token IDs
  const { data: tokenIdsData } = useReadContracts({
    contracts: indices.map(index => ({
      address: myNftContractData?.address,
      abi: myNftContractData?.abi as any,
      functionName: "tokenOfOwnerByIndex",
      args: [address, index],
    })),
  });

  // Fetch token URIs
  const tokenIds = tokenIdsData?.map(data => data.result as bigint).filter(Boolean) || [];

  const { data: tokenUrisData } = useReadContracts({
    contracts: tokenIds.map(tokenId => ({
      address: myNftContractData?.address,
      abi: myNftContractData?.abi as any,
      functionName: "tokenURI",
      args: [tokenId],
    })),
  });

  const { writeContractAsync: writeNftContract, isPending: isApproving } = useScaffoldWriteContract({
    contractName: "MyNFT",
  });

  const { writeContractAsync: writeMarketplaceContract, isPending: isListing } = useScaffoldWriteContract({
    contractName: "Marketplace",
  });

  useEffect(() => {
    const fetchMetadata = async () => {
      if (!tokenUrisData || tokenUrisData.length === 0) return;

      setLoadingMetadata(true);
      const fetchedNfts = [];

      for (let i = 0; i < tokenUrisData.length; i++) {
        const uri = tokenUrisData[i].result as string;
        const tokenId = tokenIds[i].toString();

        if (uri) {
          try {
            const httpUri = resolveIPFS(uri);
            const res = await fetch(httpUri);
            const metadata = await res.json();

            fetchedNfts.push({
              tokenId,
              name: metadata.name,
              description: metadata.description,
              image: resolveIPFS(metadata.image),
              owner: address,
            });
          } catch (e) {
            console.error("Error fetching metadata for token", tokenId, e);
          }
        }
      }

      setNfts(fetchedNfts);
      setLoadingMetadata(false);
    };

    fetchMetadata();
  }, [tokenUrisData]);

  const handleListForSale = async () => {
    if (!selectedTokenId || !listPrice || !marketplaceContractData?.address || !myNftContractData?.address) return;

    try {
      // 1. Approve Marketplace
      await writeNftContract({
        functionName: "approve",
        args: [marketplaceContractData.address, BigInt(selectedTokenId)],
      });

      // 2. List NFT
      const priceInWei = parseEther(listPrice);
      await writeMarketplaceContract({
        functionName: "listNFT",
        args: [myNftContractData.address, BigInt(selectedTokenId), priceInWei],
      });

      notification.success("NFT Listed successfully!");
      setSelectedTokenId(null);
      setListPrice("");
    } catch (e: any) {
      console.error(e);
      notification.error("Failed to list NFT: " + e.message);
    }
  };

  return (
    <div className="flex flex-col items-center pt-10 px-5">
      <h1 className="text-4xl font-bold mb-8">My NFTs</h1>

      {!address ? (
        <p>Please connect your wallet.</p>
      ) : loadingMetadata ? (
        <span className="loading loading-spinner loading-lg"></span>
      ) : nfts.length === 0 ? (
        <p>You don&apos;t own any NFTs yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-[100rem]">
          {nfts.map(nft => (
            <NFTCard key={nft.tokenId} nft={nft} onClick={() => setSelectedTokenId(nft.tokenId)} />
          ))}
        </div>
      )}

      {/* Detail / List Modal */}
      {selectedTokenId &&
        (() => {
          const selectedNft = nfts.find(n => n.tokenId === selectedTokenId);
          if (!selectedNft) return null;
          return (
            <div className="modal modal-open">
              <div className="modal-box max-w-5xl">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="w-full md:w-1/2 relative h-[32rem] rounded-xl overflow-hidden bg-base-200">
                    <img
                      src={selectedNft.image}
                      alt={selectedNft.name}
                      className="object-contain w-full h-full absolute inset-0"
                    />
                  </div>
                  <div className="w-full md:w-1/2 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-2xl">
                        {selectedNft.name} #{selectedNft.tokenId}
                      </h3>
                      <p className="py-4 text-sm opacity-80">{selectedNft.description}</p>

                      <div className="form-control w-full">
                        <label className="label">
                          <span className="label-text text-sm font-semibold">List Price (ETH)</span>
                        </label>
                        <input
                          type="number"
                          placeholder="0.01"
                          className="input input-bordered w-full"
                          value={listPrice}
                          onChange={e => setListPrice(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="modal-action mt-6">
                      <button className="btn" onClick={() => setSelectedTokenId(null)}>
                        Close
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={handleListForSale}
                        disabled={isApproving || isListing || !listPrice}
                      >
                        {isApproving || isListing ? <span className="loading loading-spinner"></span> : "List for Sale"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-backdrop" onClick={() => setSelectedTokenId(null)}></div>
            </div>
          );
        })()}
    </div>
  );
}
