import Image from "next/image";
import { Address } from "@scaffold-ui/components";
import { formatEther } from "viem";

interface NFTCardProps {
  nft: {
    tokenId: string;
    image: string;
    name: string;
    description: string;
    price?: bigint;
    seller?: string;
    owner?: string;
  };
  onAction?: () => void;
  actionText?: string;
  isPending?: boolean;
}

export const NFTCard = ({ nft, onAction, actionText, isPending }: NFTCardProps) => {
  return (
    <div className="card bg-base-100 shadow-xl border border-base-300">
      <figure className="relative h-64 w-full">
        <Image src={nft.image} alt={nft.name} fill className="object-cover" />
      </figure>
      <div className="card-body">
        <h2 className="card-title">
          {nft.name} <div className="badge badge-secondary">#{nft.tokenId}</div>
        </h2>
        <p className="text-sm line-clamp-2">{nft.description}</p>

        {nft.price && (
          <div className="mt-2">
            <span className="text-lg font-bold">{formatEther(nft.price)} ETH</span>
          </div>
        )}

        {nft.seller && (
          <div className="mt-2 text-sm">
            Seller: <Address address={nft.seller} />
          </div>
        )}

        {nft.owner && (
          <div className="mt-2 text-sm">
            Owner: <Address address={nft.owner} />
          </div>
        )}

        {onAction && actionText && (
          <div className="card-actions justify-end mt-4">
            <button className="btn btn-primary w-full" onClick={onAction} disabled={isPending}>
              {isPending ? <span className="loading loading-spinner"></span> : actionText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
