import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AbstractFormGate } from "./abstract-form-gate";

function at(iso: string) {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(iso));
}

describe("AbstractFormGate", () => {
  afterEach(() => vi.useRealTimers());

  it("leaves the form open before the deadline ends", () => {
    at("2026-11-15T23:30:00+05:30");
    render(
      <AbstractFormGate>
        <input aria-label="field" />
      </AbstractFormGate>,
    );
    expect(screen.getByTestId("abstract-gate")).toHaveAttribute("data-state", "open");
    expect(screen.queryByTestId("abstract-closed")).not.toBeInTheDocument();
    expect(screen.getByLabelText("field")).toBeEnabled();
  });

  it("covers and disables the form after the deadline", () => {
    at("2026-11-16T00:00:00+05:30");
    render(
      <AbstractFormGate>
        <input aria-label="field" />
      </AbstractFormGate>,
    );
    expect(screen.getByTestId("abstract-gate")).toHaveAttribute("data-state", "closed");
    expect(screen.getByTestId("abstract-closed")).toHaveTextContent(
      "Abstract registration closed. Submissions are no longer accepted.",
    );
    const body = document.querySelector(".af-gate-body")!;
    expect(body).toHaveAttribute("inert");
    expect(body).toHaveAttribute("aria-hidden", "true");
  });

  it("renders the tape text twice for a seamless loop and hides it from assistive tech", () => {
    at("2026-11-19T10:00:00+05:30");
    render(
      <AbstractFormGate>
        <p>form</p>
      </AbstractFormGate>,
    );
    const tape = document.querySelector(".af-tape")!;
    expect(tape).toHaveAttribute("aria-hidden", "true");
    expect(tape.querySelectorAll(".af-tape-group")).toHaveLength(2);
    expect(tape.querySelectorAll("span")).toHaveLength(12);
  });
});
