import { describe, it, expect } from "vitest";
import { truncateAddress } from "./wallet";

describe("truncateAddress", () => {
  it("truncates a long address to head…tail", () => {
    expect(truncateAddress("GABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890")).toBe("GABC…7890");
  });

  it("respects a custom character count", () => {
    expect(truncateAddress("GABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890", 6)).toBe("GABCDE…567890");
  });

  it("returns an empty string for an empty address", () => {
    expect(truncateAddress("")).toBe("");
  });
});
