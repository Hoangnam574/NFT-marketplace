"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { parseEther } from "viem";
import { useAccount } from "wagmi";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { uploadFileToIPFS, uploadJSONToIPFS } from "~~/utils/ipfs";
import { notification } from "~~/utils/scaffold-eth";

type NftForm = {
  file: File | null;
  name: string;
  description: string;
};

export default function MintPage() {
  const { address } = useAccount();
  const [nfts, setNfts] = useState<NftForm[]>([{ file: null, name: "", description: "" }]);
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  const { writeContractAsync, isPending } = useScaffoldWriteContract({
    contractName: "MyNFT",
  });

  const addNftForm = () => {
    setNfts([...nfts, { file: null, name: "", description: "" }]);
  };

  const removeNftForm = (index: number) => {
    setNfts(nfts.filter((_, i) => i !== index));
  };

  const updateNftForm = (index: number, field: keyof NftForm, value: any) => {
    const updated = [...nfts];
    updated[index] = { ...updated[index], [field]: value };
    setNfts(updated);
  };

  const handleMint = async () => {
    // Validation
    for (const nft of nfts) {
      if (!nft.file || !nft.name || !nft.description) {
        notification.error("Please fill all fields and select an image for every NFT.");
        return;
      }
    }

    if (!address) {
      notification.error("Please connect your wallet first.");
      return;
    }

    try {
      setIsUploading(true);
      const tokenURIs: string[] = [];

      for (let i = 0; i < nfts.length; i++) {
        const nft = nfts[i];
        const notificationId = notification.loading(`Uploading image ${i + 1} to IPFS...`);
        const imageURI = await uploadFileToIPFS(nft.file!);
        notification.remove(notificationId);

        const metadataNotificationId = notification.loading(`Uploading metadata ${i + 1} to IPFS...`);
        const metadata = {
          name: nft.name,
          description: nft.description,
          image: imageURI,
          attributes: [],
        };
        const tokenURI = await uploadJSONToIPFS(metadata);
        notification.remove(metadataNotificationId);
        tokenURIs.push(tokenURI);
      }

      setIsUploading(false);

      // Mint Batch
      await writeContractAsync({
        functionName: "mintBatch",
        args: [address, tokenURIs],
      });

      notification.success("NFT(s) Minted successfully!");

      // Reset form
      setNfts([{ file: null, name: "", description: "" }]);

      // Redirect to My NFTs page
      router.push("/my-nfts");
    } catch (e: any) {
      setIsUploading(false);
      console.error(e);
      notification.error("Error minting NFT: " + e.message);
    }
  };

  return (
    <div className="flex flex-col items-center pt-10 pb-20">
      <h1 className="text-4xl font-bold mb-8">Mint Multiple NFTs</h1>

      <div className="w-full max-w-7xl px-5 flex flex-wrap gap-6 justify-center">
        {nfts.map((nft, index) => (
          <div key={index} className="card w-96 bg-base-100 shadow-xl border border-base-300 relative">
            {nfts.length > 1 && (
              <button
                className="btn btn-circle btn-sm btn-error absolute top-2 right-2"
                onClick={() => removeNftForm(index)}
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            )}
            <div className="card-body">
              <h2 className="card-title text-sm opacity-50 mb-2">NFT #{index + 1}</h2>
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">NFT Image</span>
                </label>
                <input
                  type="file"
                  className="file-input file-input-bordered w-full"
                  accept="image/*"
                  onChange={e => updateNftForm(index, "file", e.target.files?.[0] || null)}
                />
              </div>

              <div className="form-control w-full mt-4">
                <label className="label">
                  <span className="label-text">Name</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cool Ape"
                  className="input input-bordered w-full"
                  value={nft.name}
                  onChange={e => updateNftForm(index, "name", e.target.value)}
                />
              </div>

              <div className="form-control w-full mt-4">
                <label className="label">
                  <span className="label-text">Description</span>
                </label>
                <textarea
                  className="textarea textarea-bordered h-24"
                  placeholder="Describe your NFT"
                  value={nft.description}
                  onChange={e => updateNftForm(index, "description", e.target.value)}
                ></textarea>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-4 mt-8">
        <button className="btn btn-outline" onClick={addNftForm} disabled={isUploading || isPending}>
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Another NFT
        </button>
        <button
          className="btn btn-primary"
          onClick={handleMint}
          disabled={isUploading || isPending || nfts.length === 0}
        >
          {isUploading || isPending ? <span className="loading loading-spinner"></span> : `Mint ${nfts.length} NFT(s)`}
        </button>
      </div>
    </div>
  );
}
