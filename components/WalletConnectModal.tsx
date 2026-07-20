"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Wallet, X, Loader2 } from "lucide-react";
import { useWallet } from "@/lib/wallet-context";

export function WalletConnectModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { connect, connecting, error, address } = useWallet();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            className="glass gradient-border relative w-full max-w-sm rounded-2xl p-6"
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 12 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-text-muted hover:text-text-primary transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-accent-violet via-accent-cyan to-accent-magenta shadow-[0_0_30px_rgba(124,58,237,0.5)]">
              <Wallet size={26} className="text-white" />
            </div>

            <h3 className="mt-4 text-center text-xl font-heading font-semibold">
              Connect Freighter
            </h3>
            <p className="mt-1 text-center text-sm text-text-muted">
              Connect your Stellar wallet to fund milestones and release payments.
            </p>

            {error && (
              <p className="mt-3 rounded-lg border border-accent-amber/30 bg-accent-amber/10 px-3 py-2 text-center text-xs text-accent-amber">
                {error}
              </p>
            )}

            {address ? (
              <div className="mt-5 rounded-xl border border-glass-border bg-glass-fill px-4 py-3 text-center text-sm text-accent-green">
                Connected
              </div>
            ) : (
              <button
                onClick={connect}
                disabled={connecting}
                className="relative mt-5 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-accent-violet via-accent-cyan to-accent-magenta py-3 text-sm font-medium text-white transition-transform hover:scale-[1.02] disabled:opacity-60"
              >
                {connecting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Connecting…
                  </>
                ) : (
                  "Connect Wallet"
                )}
              </button>
            )}

            <p className="mt-4 text-center text-xs text-text-muted">
              Don&apos;t have Freighter?{" "}
              <a
                href="https://www.freighter.app/"
                target="_blank"
                rel="noreferrer"
                className="text-accent-cyan hover:underline"
              >
                Install it
              </a>
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
