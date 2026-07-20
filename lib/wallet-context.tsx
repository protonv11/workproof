"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import * as Sentry from "@sentry/nextjs";
import { connectFreighter, isFreighterInstalled, tryRestoreFreighterSession } from "@/lib/wallet";
import { toast } from "@/lib/toast-store";
import { analytics } from "@/lib/analytics";

type WalletState = {
  address: string | null;
  connecting: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
};

const WalletContext = createContext<WalletState | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    tryRestoreFreighterSession().then((addr) => {
      if (addr) setAddress(addr);
    });
  }, []);

  const connect = useCallback(async () => {
    setConnecting(true);
    setError(null);
    try {
      const installed = await isFreighterInstalled();
      if (!installed) {
        throw new Error("Freighter wallet not detected. Install it from freighter.app.");
      }
      const addr = await connectFreighter();
      setAddress(addr);
      toast.success("Wallet connected.");
      analytics.walletConnected(addr);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to connect wallet";
      setError(message);
      toast.error(message);
      Sentry.captureException(e, { tags: { flow: "wallet_connect" } });
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
  }, []);

  return (
    <WalletContext.Provider value={{ address, connecting, error, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}
