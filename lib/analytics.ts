"use client";

import posthog from "posthog-js";

const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

let initialized = false;

export function initAnalytics() {
  if (initialized || typeof window === "undefined") return;
  if (!key) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[posthog] NEXT_PUBLIC_POSTHOG_KEY not set — analytics disabled.");
    }
    return;
  }
  posthog.init(key, {
    api_host: host,
    capture_pageview: false, // manual pageview tracking, see PostHogPageview
    person_profiles: "identified_only",
  });
  initialized = true;
}

function track(event: string, properties?: Record<string, unknown>) {
  if (!initialized) return;
  posthog.capture(event, properties);
}

export const analytics = {
  pageview: (url: string) => track("$pageview", { $current_url: url }),

  walletConnected: (address: string, walletType = "freighter") =>
    track("wallet_connected", { address_truncated: `${address.slice(0, 4)}…${address.slice(-4)}`, wallet_type: walletType }),

  jobCreated: (milestoneCount: number, totalXlm: number) =>
    track("job_created", { milestone_count: milestoneCount, total_xlm_locked: totalXlm }),

  milestoneFunded: (jobId: string, milestoneIndex: number, amountXlm: number) =>
    track("milestone_funded", { job_id: jobId, milestone_index: milestoneIndex, amount_xlm: amountXlm }),

  milestoneDelivered: (jobId: string, milestoneIndex: number) =>
    track("milestone_delivered", { job_id: jobId, milestone_index: milestoneIndex }),

  milestoneApproved: (jobId: string, milestoneIndex: number) =>
    track("milestone_approved", { job_id: jobId, milestone_index: milestoneIndex }),

  milestoneDisputed: (jobId: string, milestoneIndex: number) =>
    track("milestone_disputed", { job_id: jobId, milestone_index: milestoneIndex }),
};
