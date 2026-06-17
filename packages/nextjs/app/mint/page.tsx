"use client";

import { useState } from "react";
import { parseEther } from "viem";
import { useAccount } from "wagmi";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { uploadFileToIPFS, uploadJSONToIPFS } from "~~/utils/ipfs";
import { notification } from "~~/utils/scaffold-eth";

export default function MintPage() {
  const { address } = useAccount();
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const { writeContractAsync, isPending } = useScaffoldWriteContract({
    contractName: "MyNFT",
  });

  const handleMint = async () => {
    if (!file || !name || !description) {
      notification.error("Please fill all fields and select an image.");
      return;
    }

    if (!address) {
      notification.error("Please connect your wallet first.");
      return;
    }

    try {
      setIsUploading(true);
      const notificationId = notification.loading("Uploading image to IPFS...");

      // 1. Upload image to IPFS
      const imageURI = await uploadFileToIPFS(file);

      notification.remove(notificationId);
      const metadataNotificationId = notification.loading("Uploading metadata to IPFS...");

      // 2. Upload metadata to IPFS
      const metadata = {
        name,
        description,
        image: imageURI,
        attributes: [], // Can add custom attributes if needed
      };
      const tokenURI = await uploadJSONToIPFS(metadata);

      notification.remove(metadataNotificationId);
      setIsUploading(false);

      // 3. Mint NFT
      await writeContractAsync({
        functionName: "mintNFT",
        args: [address, tokenURI],
      });

      notification.success("NFT Minted successfully!");

      // Reset form
      setFile(null);
      setName("");
      setDescription("");
    } catch (e: any) {
      setIsUploading(false);
      console.error(e);
      notification.error("Error minting NFT: " + e.message);
    }
  };

  return (
    <div className="flex flex-col items-center pt-10">
      <h1 className="text-4xl font-bold mb-8">Mint Your NFT</h1>

      <div className="card w-96 bg-base-100 shadow-xl border border-base-300">
        <div className="card-body">
          <div className="form-control w-full max-w-xs">
            <label className="label">
              <span className="label-text">NFT Image</span>
            </label>
            <input
              type="file"
              className="file-input file-input-bordered w-full max-w-xs"
              accept="image/*"
              onChange={e => setFile(e.target.files?.[0] || null)}
            />
          </div>

          <div className="form-control w-full max-w-xs mt-4">
            <label className="label">
              <span className="label-text">Name</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Cool Ape"
              className="input input-bordered w-full max-w-xs"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          <div className="form-control w-full max-w-xs mt-4">
            <label className="label">
              <span className="label-text">Description</span>
            </label>
            <textarea
              className="textarea textarea-bordered h-24"
              placeholder="Describe your NFT"
              value={description}
              onChange={e => setDescription(e.target.value)}
            ></textarea>
          </div>

          <div className="card-actions justify-end mt-6">
            <button className="btn btn-primary w-full" onClick={handleMint} disabled={isUploading || isPending}>
              {isUploading || isPending ? <span className="loading loading-spinner"></span> : "Mint NFT"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
