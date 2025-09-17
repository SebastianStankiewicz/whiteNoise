"use client";

import {
  AptosWalletAdapterProvider,
  useWallet,
} from "@aptos-labs/wallet-adapter-react";
import { Network } from "@aptos-labs/ts-sdk";
import React from "react";
import { Button } from "@/components/ui/button";
function WalletGate({ children }) {
  const { connect, connected } = useWallet();

  if (!connected) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Button
          size="sm"
          variant="outline"
          className="border-white/30 text-black hover:bg-white/10"
          onClick={connect}
        >
          Sign In with Wallet
        </Button>
      </div>
    );
  }

  return <main>{children}</main>;
}

export default function DashboardLayout({ children }) {
  return (
    <AptosWalletAdapterProvider
      autoConnect={true}
      dappConfig={{ network: Network.TESTNET }}
      onError={(error) => {
        alert(error.message || "Wallet error");
        console.error("Wallet error:", error);
      }}
    >
      <div className="min-h-screen bg-base-200">
        <WalletGate>{children}</WalletGate>
      </div>
    </AptosWalletAdapterProvider>
  );
}
