import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusRing } from "./StatusRing";

describe("StatusRing", () => {
  it("renders the label for each milestone status", () => {
    render(<StatusRing status="funded" />);
    expect(screen.getByText("Funded")).toBeInTheDocument();
  });

  it("renders the disputed label", () => {
    render(<StatusRing status="disputed" />);
    expect(screen.getByText("Disputed")).toBeInTheDocument();
  });
});
