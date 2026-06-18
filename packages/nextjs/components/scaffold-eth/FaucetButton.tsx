"use client";

import { useState } from "react";
import { useWatchBalance } from "@scaffold-ui/hooks";
import { createWalletClient, http, parseEther } from "viem";
import { hardhat } from "viem/chains";
import { useAccount } from "wagmi";
import { BanknotesIcon } from "@heroicons/react/24/outline";
import { useTransactor } from "~~/hooks/scaffold-eth";

// Number of ETH faucet sends to an address
const NUM_OF_ETH = "1000";
const FAUCET_ADDRESS = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

const localWalletClient = createWalletClient({
  chain: hardhat,
  transport: http(),
});

/**
 * FaucetButton button which lets you grab eth.
 */
export const FaucetButton = () => {
  const { address, chain: ConnectedChain } = useAccount();

  const { data: balance } = useWatchBalance({ address, chain: hardhat });

  const [loading, setLoading] = useState(false);

  const faucetTxn = useTransactor(localWalletClient);

  const sendETH = async () => {
    if (!address) return;
    try {
      setLoading(true);
      await faucetTxn({
        account: FAUCET_ADDRESS,
        to: address,
        value: parseEther(NUM_OF_ETH),
      });
      setLoading(false);
    } catch (error) {
      console.error("⚡️ ~ file: FaucetButton.tsx:sendETH ~ error", error);
      setLoading(false);
    }
  };

  // Render only on local chain
  if (ConnectedChain?.id !== hardhat.id) {
    return null;
  }

  const isBalanceZero = balance && balance.value === 0n;

  return (
    <button
      className="h-8 btn-sm rounded-xl! flex gap-3 py-3 font-normal"
      type="button"
      onClick={sendETH}
      disabled={loading}
    >
      {!loading ? (
        <BanknotesIcon className="h-6 w-4 ml-2 sm:ml-0" />
      ) : (
        <span className="loading loading-spinner loading-xs h-6 w-4 ml-2 sm:ml-0"></span>
      )}
      <span className="whitespace-nowrap">Grab funds from faucet</span>
    </button>
  );
};
