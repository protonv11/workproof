"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import Link from "next/link";
import { ShieldCheck, Wallet, FileCheck2, Sparkles } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientButton } from "@/components/ui/GradientButton";
import { WalletConnectModal } from "@/components/WalletConnectModal";
import { useWallet } from "@/lib/wallet-context";

const HeroScene = dynamic(() => import("@/components/HeroScene").then((m) => m.HeroScene), {
  ssr: false,
});

const steps = [
  {
    icon: Wallet,
    title: "Fund a milestone",
    desc: "Client locks funds into the Soroban escrow contract for a defined milestone.",
  },
  {
    icon: FileCheck2,
    title: "Deliver proof",
    desc: "Freelancer submits proof of work — link, hash, or file reference.",
  },
  {
    icon: ShieldCheck,
    title: "Approve & release",
    desc: "Client approves, funds release instantly on-chain to the freelancer.",
  },
];

export default function Home() {
  const { address } = useWallet();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <HeroScene />
      <Navbar />

      <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col items-center px-6 pb-32 pt-28 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 14, delay: 0.1 }}
          className="flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs text-text-muted"
        >
          <Sparkles size={14} className="text-accent-cyan" />
          Trustless milestone escrow on Stellar
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 14, delay: 0.2 }}
          className="mt-6 font-heading text-5xl font-bold leading-tight sm:text-6xl"
        >
          Payment released
          <br />
          <span className="gradient-text">on proof of work.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 14, delay: 0.3 }}
          className="mt-6 max-w-xl text-lg text-text-muted"
        >
          A client funds a milestone, the freelancer delivers proof, the client approves —
          funds release on-chain instantly, transparently, with near-zero fees.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 14, delay: 0.4 }}
          className="mt-10 flex items-center gap-4"
        >
          {address ? (
            <Link href="/dashboard">
              <GradientButton className="!px-7 !py-3 text-base">
                Go to Dashboard
              </GradientButton>
            </Link>
          ) : (
            <GradientButton onClick={() => setModalOpen(true)} className="!px-7 !py-3 text-base">
              Connect Wallet
            </GradientButton>
          )}
          <Link href="/dashboard">
            <GradientButton variant="ghost" className="!px-7 !py-3 text-base">
              Explore Jobs
            </GradientButton>
          </Link>
        </motion.div>

        <div className="mt-28 grid w-full gap-6 sm:grid-cols-3">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 120, damping: 16, delay: i * 0.1 }}
            >
              <GlassCard hoverTilt glowBorder className="h-full p-6 text-left">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-accent-violet via-accent-cyan to-accent-magenta">
                  <step.icon size={20} className="text-white" />
                </div>
                <h3 className="mt-4 font-heading text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-text-muted">{step.desc}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </main>

      <WalletConnectModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
