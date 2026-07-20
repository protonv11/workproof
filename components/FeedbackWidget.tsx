"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import * as Sentry from "@sentry/nextjs";
import { MessageCircle, X, Star, PartyPopper } from "lucide-react";
import { GradientButton } from "@/components/ui/GradientButton";
import { useWallet } from "@/lib/wallet-context";
import { useSubmitFeedback } from "@/lib/hooks";
import { toast } from "@/lib/toast-store";
import { cn } from "@/lib/utils";

export function FeedbackWidget() {
  const { address } = useWallet();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const mutation = useSubmitFeedback();

  const close = () => {
    setOpen(false);
    setTimeout(() => {
      setSubmitted(false);
      setRating(0);
      setText("");
    }, 300);
  };

  const handleSubmit = () => {
    mutation.mutate(
      { userAddress: address, rating, feedbackText: text },
      {
        onSuccess: () => setSubmitted(true),
        onError: (e) => {
          toast.error(e instanceof Error ? e.message : "Failed to submit feedback");
          Sentry.captureException(e, { tags: { flow: "feedback_submit" } });
        },
      }
    );
  };

  return (
    <>
      <motion.button
        onClick={() => setOpen(true)}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="glass gradient-border fixed bottom-4 left-4 z-50 flex h-12 w-12 items-center justify-center rounded-full sm:bottom-6 sm:left-6"
        aria-label="Give feedback"
      >
        <MessageCircle size={20} className="text-accent-cyan" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={close} />

            <motion.div
              className="glass gradient-border relative w-full max-w-sm overflow-hidden rounded-2xl p-6"
              initial={{ opacity: 0, scale: 0.92, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 12 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
            >
              <button
                onClick={close}
                className="absolute right-4 top-4 text-text-muted hover:text-text-primary transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>

              {submitted ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="relative flex flex-col items-center gap-3 py-8 text-center"
                >
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-accent-violet via-accent-cyan to-accent-magenta">
                    <PartyPopper size={24} className="text-white" />
                    {Array.from({ length: 12 }).map((_, i) => (
                      <motion.span
                        key={i}
                        className="absolute h-1.5 w-1.5 rounded-full bg-accent-cyan"
                        initial={{ x: 0, y: 0, opacity: 1 }}
                        animate={{
                          x: Math.cos((i / 12) * Math.PI * 2) * 80,
                          y: Math.sin((i / 12) * Math.PI * 2) * 80,
                          opacity: 0,
                        }}
                        transition={{ duration: 0.9, ease: "easeOut" }}
                      />
                    ))}
                  </div>
                  <h3 className="font-heading text-lg font-semibold">Feedback submitted!</h3>
                  <p className="text-sm text-text-muted">Thanks for helping improve Workproof.</p>
                  <GradientButton onClick={close} className="mt-2">
                    Close
                  </GradientButton>
                </motion.div>
              ) : (
                <>
                  <h3 className="font-heading text-lg font-semibold">How's your experience?</h3>
                  <p className="mt-1 text-sm text-text-muted">
                    Tell us what's working and what isn't.
                  </p>

                  <div className="mt-5 flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((n) => {
                      const active = n <= (hoverRating || rating);
                      return (
                        <motion.button
                          key={n}
                          onClick={() => setRating(n)}
                          onMouseEnter={() => setHoverRating(n)}
                          onMouseLeave={() => setHoverRating(0)}
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-1"
                          aria-label={`Rate ${n} star${n > 1 ? "s" : ""}`}
                        >
                          <Star
                            size={28}
                            className={cn(
                              "transition-colors",
                              active ? "text-accent-cyan" : "text-text-muted"
                            )}
                            fill={active ? "currentColor" : "none"}
                            style={active ? { filter: "drop-shadow(0 0 6px var(--accent-cyan))" } : undefined}
                          />
                        </motion.button>
                      );
                    })}
                  </div>

                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Optional — what should we fix or build next?"
                    rows={4}
                    className="glass-input mt-5 w-full resize-none text-sm"
                  />

                  <GradientButton
                    onClick={handleSubmit}
                    disabled={rating === 0 || mutation.isPending}
                    className="mt-5 w-full"
                  >
                    {mutation.isPending ? "Submitting…" : "Submit feedback"}
                  </GradientButton>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
