"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { useWallet } from "@/lib/wallet-context";
import { truncateAddress } from "@/lib/wallet";
import { WalletConnectModal } from "@/components/WalletConnectModal";
import { GradientButton } from "@/components/ui/GradientButton";

export function Navbar() {
  const { address } = useWallet();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 16 }}
        className="sticky top-4 z-40 mx-auto mt-4 flex w-[min(96%,900px)] items-center justify-between rounded-full px-5 py-3 glass gradient-border"
      >
        <Link href="/" className="flex items-center gap-2 font-heading text-lg font-semibold">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-accent-violet via-accent-cyan to-accent-magenta">
            <Zap size={15} className="text-white" />
          </span>
          Workproof
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-text-muted sm:flex">
          <Link href="/dashboard" className="hover:text-text-primary transition-colors">
            Dashboard
          </Link>
          <Link href="/profile" className="hover:text-text-primary transition-colors">
            Profile
          </Link>
        </nav>

        {address ? (
          <Link
            href="/profile"
            className="rounded-full border border-glass-border bg-glass-fill px-4 py-1.5 text-sm text-accent-cyan"
          >
            {truncateAddress(address)}
          </Link>
        ) : (
          <GradientButton onClick={() => setModalOpen(true)} className="!px-4 !py-1.5 text-xs">
            Connect Wallet
          </GradientButton>
        )}
      </motion.header>
      <WalletConnectModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
