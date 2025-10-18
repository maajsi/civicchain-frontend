"use client";

import React from "react";
import { toast } from "sonner";

/**
 * showTxToast - standardized toast for actions that may include a blockchain tx hash
 * @param message - short action message (e.g. 'Upvoted successfully!')
 * @param txHash - optional blockchain transaction hash
 */
export function showTxToast(message: string, txHash?: string) {
  if (txHash) {
    const short = txHash.length > 20 ? `${txHash.substring(0, 20)}...` : txHash;
    const url = `https://explorer.solana.com/tx/${txHash}?cluster=devnet`;
    const node: React.ReactNode = (
      <span className="flex flex-col">
        <span>{message}</span>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline font-medium mt-1 break-all"
        >
          View on Solana Explorer → {short}
        </a>
      </span>
    );
    toast.success(node);
  } else {
    toast.success(message);
  }
}

export default showTxToast;
