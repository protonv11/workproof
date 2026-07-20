"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { toast, useToasts, type ToastVariant } from "@/lib/toast-store";

const variantMeta: Record<ToastVariant, { icon: typeof CheckCircle2; color: string }> = {
  error: { icon: XCircle, color: "var(--accent-amber)" },
  success: { icon: CheckCircle2, color: "var(--accent-green)" },
  info: { icon: Info, color: "var(--accent-cyan)" },
};

export function Toaster() {
  const toasts = useToasts();

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-[min(92vw,360px)] flex-col gap-2 sm:bottom-6 sm:right-6">
      <AnimatePresence>
        {toasts.map((t) => {
          const meta = variantMeta[t.variant];
          const Icon = meta.icon;
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
              className="glass gradient-border pointer-events-auto flex items-start gap-3 rounded-xl px-4 py-3"
            >
              <Icon size={18} style={{ color: meta.color }} className="mt-0.5 shrink-0" />
              <p className="flex-1 text-sm text-text-primary">{t.message}</p>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="text-text-muted hover:text-text-primary transition-colors"
                aria-label="Dismiss"
              >
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
