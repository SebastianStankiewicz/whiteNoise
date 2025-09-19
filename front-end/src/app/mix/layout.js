"use client";

import {
  AptosWalletAdapterProvider,
  useWallet,
} from "@aptos-labs/wallet-adapter-react";
import { Network } from "@aptos-labs/ts-sdk";
import React from "react";
import { Button } from "@/components/ui/button";

function WalletGate({ children }) {
  const { connect, connected, wallets } = useWallet();

  if (!connected) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        {wallets.map((wallet) => (
          <Button
            key={wallet.name}
            size="sm"
            variant="outline"
            className="border-white/30 text-black hover:bg-white/10"
            onClick={() => connect(wallet.name)} // <-- specify wallet
          >
            Connect {wallet.name}
          </Button>
        ))}
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
