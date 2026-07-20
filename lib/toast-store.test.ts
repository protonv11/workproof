import { describe, it, expect } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { toast, useToasts } from "./toast-store";

describe("toast-store", () => {
  it("adds a toast that subscribers can see", async () => {
    const { result } = renderHook(() => useToasts());
    expect(result.current).toHaveLength(0);

    act(() => {
      toast.success("Wallet connected.");
    });

    await waitFor(() => expect(result.current).toHaveLength(1));
    expect(result.current[0]).toMatchObject({ variant: "success", message: "Wallet connected." });
  });

  it("removes a toast on dismiss", async () => {
    const { result } = renderHook(() => useToasts());

    let id = "";
    act(() => {
      id = toast.error("Something failed");
    });
    await waitFor(() => expect(result.current.some((t) => t.id === id)).toBe(true));

    act(() => {
      toast.dismiss(id);
    });
    await waitFor(() => expect(result.current.some((t) => t.id === id)).toBe(false));
  });
});
