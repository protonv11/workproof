"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { AlertTriangle } from "lucide-react";

export default function GlobalError({
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
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-bg-base px-6">
        <div className="glass gradient-border max-w-sm rounded-2xl p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-accent-amber to-red-500">
            <AlertTriangle size={22} className="text-white" />
          </div>
          <h1 className="mt-4 font-heading text-xl font-semibold text-text-primary">
            Something went wrong
          </h1>
          <p className="mt-2 text-sm text-text-muted">
            The error has been reported. Try again, or come back in a moment.
          </p>
          <button
            onClick={reset}
            className="mt-5 rounded-xl bg-gradient-to-r from-accent-violet via-accent-cyan to-accent-magenta px-5 py-2.5 text-sm font-medium text-white"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
