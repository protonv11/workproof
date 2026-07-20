"use client";

import { motion } from "framer-motion";
import { Wallet, LogOut } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientButton } from "@/components/ui/GradientButton";
import { useWallet } from "@/lib/wallet-context";
import { truncateAddress } from "@/lib/wallet";

export default function ProfilePage() {
  const { address, connect, disconnect } = useWallet();

  return (
    <div className="flex flex-1 flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
        <h1 className="font-heading text-3xl font-bold">Profile</h1>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
          <GlassCard glowBorder className="p-6">
            {address ? (
              <>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-accent-violet via-accent-cyan to-accent-magenta">
                      <Wallet size={18} className="text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-text-muted">Connected wallet</p>
                      <p className="font-mono text-sm">{truncateAddress(address, 6)}</p>
                    </div>
                  </div>
                  <button
                    onClick={disconnect}
                    className="flex items-center gap-1.5 rounded-full border border-glass-border px-3 py-1.5 text-xs text-text-muted hover:text-accent-amber hover:border-accent-amber/40 transition-colors"
                  >
                    <LogOut size={13} /> Disconnect
                  </button>
                </div>
                <p className="mt-4 text-xs text-text-muted">Network: Stellar Testnet</p>
              </>
            ) : (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <p className="text-text-muted">No wallet connected.</p>
                <GradientButton onClick={connect}>Connect Wallet</GradientButton>
              </div>
            )}
          </GlassCard>

          <GlassCard className="mt-6 p-6">
            <h2 className="font-heading text-lg font-semibold">Reputation</h2>
            <p className="mt-2 text-sm text-text-muted">
              Transaction history and reputation scoring coming soon.
            </p>
          </GlassCard>
        </motion.div>
      </main>
    </div>
  );
}
