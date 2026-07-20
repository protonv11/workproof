"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { WalletProvider } from "@/lib/wallet-context";
import { Toaster } from "@/components/ui/Toaster";
import { PostHogProvider } from "@/components/PostHogProvider";
import { FeedbackWidget } from "@/components/FeedbackWidget";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 15_000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <PostHogProvider>
        <WalletProvider>
          {children}
          <Toaster />
          <FeedbackWidget />
        </WalletProvider>
      </PostHogProvider>
    </QueryClientProvider>
  );
}
