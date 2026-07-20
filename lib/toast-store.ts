"use client";

import { useSyncExternalStore } from "react";

export type ToastVariant = "error" | "success" | "info";

export type Toast = {
  id: string;
  variant: ToastVariant;
  message: string;
};

let toasts: Toast[] = [];
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function push(variant: ToastVariant, message: string, durationMs = 5000) {
  const id = crypto.randomUUID();
  toasts = [...toasts, { id, variant, message }];
  emit();
  setTimeout(() => dismiss(id), durationMs);
  return id;
}

function dismiss(id: string) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

export const toast = {
  error: (message: string) => push("error", message),
  success: (message: string) => push("success", message),
  info: (message: string) => push("info", message),
  dismiss,
};

export function useToasts() {
  return useSyncExternalStore(
    (onChange) => {
      listeners.add(onChange);
      return () => listeners.delete(onChange);
    },
    () => toasts,
    () => toasts
  );
}
