"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { AlertTriangle } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientButton } from "@/components/ui/GradientButton";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-24">
      <GlassCard glowBorder className="max-w-sm p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-accent-amber to-red-500">
          <AlertTriangle size={22} className="text-white" />
        </div>
        <h2 className="mt-4 font-heading text-xl font-semibold">Something went wrong</h2>
        <p className="mt-2 text-sm text-text-muted">
          The error has been reported. Try again, or head back to the dashboard.
        </p>
        <GradientButton onClick={reset} className="mt-5">
          Try again
        </GradientButton>
      </GlassCard>
    </div>
  );
}
