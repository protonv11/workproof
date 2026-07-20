"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import * as Sentry from "@sentry/nextjs";
import { Plus, Trash2, ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientButton } from "@/components/ui/GradientButton";
import { useWallet } from "@/lib/wallet-context";
import { escrowContract } from "@/lib/contract";
import { NATIVE_TESTNET_TOKEN } from "@/lib/wallet";
import { toast } from "@/lib/toast-store";

type DraftMilestone = { title: string; description: string; amount: string };

const steps = ["Job details", "Milestones", "Review"];

export default function NewJobPage() {
  const router = useRouter();
  const { address } = useWallet();
  const [step, setStep] = useState(0);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [freelancer, setFreelancer] = useState("");
  const [milestones, setMilestones] = useState<DraftMilestone[]>([
    { title: "", description: "", amount: "" },
  ]);

  const addMilestone = () =>
    setMilestones((m) => [...m, { title: "", description: "", amount: "" }]);
  const removeMilestone = (i: number) =>
    setMilestones((m) => m.filter((_, idx) => idx !== i));
  const updateMilestone = (i: number, field: keyof DraftMilestone, value: string) =>
    setMilestones((m) => m.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)));

  const total = milestones.reduce((sum, m) => sum + (parseFloat(m.amount) || 0), 0);

  const canNext =
    step === 0
      ? title.trim() && freelancer.trim()
      : step === 1
      ? milestones.every((m) => m.title.trim() && parseFloat(m.amount) > 0)
      : true;

  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!address) return;
    setCreating(true);
    try {
      await escrowContract.createJob(address, {
        client: address,
        freelancer,
        token: NATIVE_TESTNET_TOKEN,
        milestone_titles: milestones.map((m) => m.title),
        // amounts are stroops (1 XLM = 10_000_000 stroops) on the native SAC
        milestone_amounts: milestones.map((m) => BigInt(Math.round(parseFloat(m.amount) * 10_000_000))),
      });
      toast.success("Job created on-chain.");
      router.push("/dashboard");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create job on-chain");
      Sentry.captureException(e, {
        tags: { flow: "contract_call", action: "create_job" },
        extra: { freelancer, milestoneCount: milestones.length },
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
        <h1 className="font-heading text-3xl font-bold">New Job</h1>

        <div className="mt-8 flex items-center gap-3">
          {steps.map((s, i) => (
            <div key={s} className="flex flex-1 items-center gap-3">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                    i <= step
                      ? "bg-gradient-to-br from-accent-violet via-accent-cyan to-accent-magenta text-white shadow-[0_0_16px_rgba(124,58,237,0.5)]"
                      : "glass text-text-muted"
                  }`}
                >
                  {i < step ? <Check size={14} /> : i + 1}
                </div>
                <span className="text-[11px] text-text-muted">{s}</span>
              </div>
              {i < steps.length - 1 && (
                <div className="h-px flex-1 bg-glass-border relative overflow-hidden">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-accent-violet to-accent-cyan"
                    initial={{ width: 0 }}
                    animate={{ width: i < step ? "100%" : "0%" }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <GlassCard glowBorder className="mt-8 p-6">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="step-0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-4"
              >
                <Field label="Job title">
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Landing page redesign"
                    className="glass-input"
                  />
                </Field>
                <Field label="Description">
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What needs to get done?"
                    rows={3}
                    className="glass-input resize-none"
                  />
                </Field>
                <Field label="Freelancer wallet address">
                  <input
                    value={freelancer}
                    onChange={(e) => setFreelancer(e.target.value)}
                    placeholder="G..."
                    className="glass-input font-mono text-sm"
                  />
                </Field>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-4"
              >
                {milestones.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-text-muted">
                        Milestone {i + 1}
                      </span>
                      {milestones.length > 1 && (
                        <button
                          onClick={() => removeMilestone(i)}
                          className="text-text-muted hover:text-accent-amber transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    <div className="mt-2 flex flex-col gap-2">
                      <input
                        value={m.title}
                        onChange={(e) => updateMilestone(i, "title", e.target.value)}
                        placeholder="Milestone title"
                        className="glass-input"
                      />
                      <input
                        value={m.description}
                        onChange={(e) => updateMilestone(i, "description", e.target.value)}
                        placeholder="Description"
                        className="glass-input"
                      />
                      <input
                        value={m.amount}
                        onChange={(e) => updateMilestone(i, "amount", e.target.value)}
                        placeholder="Amount (USDC)"
                        type="number"
                        className="glass-input"
                      />
                    </div>
                  </motion.div>
                ))}
                <button
                  onClick={addMilestone}
                  className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-glass-border py-3 text-sm text-text-muted hover:text-text-primary hover:border-accent-cyan/50 transition-colors"
                >
                  <Plus size={14} /> Add milestone
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-4"
              >
                <div>
                  <h3 className="font-heading text-lg font-semibold">{title}</h3>
                  <p className="mt-1 text-sm text-text-muted">{description}</p>
                  <p className="mt-2 text-xs text-text-muted font-mono">To: {freelancer}</p>
                </div>
                <div className="flex flex-col gap-2">
                  {milestones.map((m, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg border border-glass-border px-3 py-2 text-sm"
                    >
                      <span>{m.title}</span>
                      <span className="gradient-text font-semibold">${m.amount}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between border-t border-glass-border pt-3 text-sm">
                  <span className="text-text-muted">Total escrow</span>
                  <span className="gradient-text text-lg font-bold">${total.toLocaleString()}</span>
                </div>
                {!address && (
                  <p className="text-xs text-accent-amber">
                    Connect your wallet to create this job on-chain.
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>

        <div className="mt-6 flex items-center justify-between">
          <GradientButton
            variant="ghost"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={14} /> Back
          </GradientButton>

          {step < steps.length - 1 ? (
            <GradientButton
              onClick={() => setStep((s) => s + 1)}
              disabled={!canNext}
              className="flex items-center gap-2"
            >
              Next <ArrowRight size={14} />
            </GradientButton>
          ) : (
            <GradientButton
              variant="success"
              onClick={handleCreate}
              disabled={!address || creating}
              className="flex items-center gap-2"
            >
              {creating ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Creating…
                </>
              ) : (
                <>
                  Create Job <Check size={14} />
                </>
              )}
            </GradientButton>
          )}
        </div>
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="text-text-muted">{label}</span>
      {children}
    </label>
  );
}
