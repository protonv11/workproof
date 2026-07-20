import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 0.2,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    environment: process.env.NODE_ENV,
  });
} else if (process.env.NODE_ENV === "development") {
  console.warn("[sentry] NEXT_PUBLIC_SENTRY_DSN not set — client error monitoring disabled.");
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
