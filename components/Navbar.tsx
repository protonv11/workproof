"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Zap, Menu, X, LogOut } from "lucide-react";
import { useWallet } from "@/lib/wallet-context";
import { truncateAddress } from "@/lib/wallet";
import { WalletConnectModal } from "@/components/WalletConnectModal";
import { GradientButton } from "@/components/ui/GradientButton";

export function Navbar() {
  const { address, disconnect } = useWallet();
  const [modalOpen, setModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 16 }}
        className="sticky top-4 z-40 mx-auto mt-4 flex w-[min(96%,900px)] items-center justify-between rounded-full px-4 py-3 glass gradient-border sm:px-5"
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

        <div className="flex items-center gap-2">
          {address ? (
            <div className="flex items-center gap-1.5">
              <Link
                href="/profile"
                className="rounded-full border border-glass-border bg-glass-fill px-3 py-1.5 text-xs text-accent-cyan sm:px-4 sm:text-sm"
              >
                {truncateAddress(address)}
              </Link>
              <button
                onClick={disconnect}
                className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted hover:text-accent-amber transition-colors"
                aria-label="Disconnect wallet"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <GradientButton onClick={() => setModalOpen(true)} className="!px-3 !py-1.5 text-xs sm:!px-4">
              Connect Wallet
            </GradientButton>
          )}

          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-text-muted hover:text-text-primary transition-colors sm:hidden"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="glass gradient-border fixed left-1/2 top-[4.75rem] z-40 flex w-[min(92%,320px)] -translate-x-1/2 flex-col gap-1 rounded-2xl p-2 sm:hidden"
          >
            <Link
              href="/dashboard"
              onClick={() => setMenuOpen(false)}
              className="rounded-xl px-4 py-3 text-sm text-text-primary hover:bg-glass-fill transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/profile"
              onClick={() => setMenuOpen(false)}
              className="rounded-xl px-4 py-3 text-sm text-text-primary hover:bg-glass-fill transition-colors"
            >
              Profile
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      <WalletConnectModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
