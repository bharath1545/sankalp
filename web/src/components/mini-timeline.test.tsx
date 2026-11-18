import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MiniTimeline } from "./mini-timeline";

describe("MiniTimeline", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-18T09:00:00+05:30"));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the timeline container", () => {
    render(<MiniTimeline />);
    expect(screen.getByTestId("mini-timeline")).toBeInTheDocument();
  });

  it("keeps all four milestones with their titles and notes", () => {
    render(<MiniTimeline />);
    expect(screen.getByText("Idea submission closes")).toBeInTheDocument();
    expect(screen.getByText("Acceptance notifications")).toBeInTheDocument();
    expect(screen.getByText("Last date of team registration")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Sankalp’26" })).toBeInTheDocument();
    expect(
      screen.getByText("Submit one-page abstract using the registration form"),
    ).toBeInTheDocument();
    expect(screen.getByText("Shortlisted teams informed")).toBeInTheDocument();
  });

  it("renders formatted dates from config", () => {
    render(<MiniTimeline />);
    expect(screen.getByText("15 November 2026")).toBeInTheDocument();
    expect(screen.getByText("20 November 2026")).toBeInTheDocument();
    expect(screen.getByText("25 November 2026")).toBeInTheDocument();
    expect(screen.getByText("27–28 November 2026")).toBeInTheDocument();
  });

  it("shows fee amount on the registration milestone", () => {
    render(<MiniTimeline />);
    expect(screen.getByText("₹600 per team")).toBeInTheDocument();
  });

  it("lights passed milestones and marks the next one (18 Nov)", () => {
    const { container } = render(<MiniTimeline />);
    const steps = [...container.querySelectorAll("li")];
    expect(steps.map((s) => s.dataset.passed)).toEqual([
      "true",
      "false",
      "false",
      "false",
    ]);
    expect(steps.map((s) => s.dataset.next)).toEqual(["false", "true", "false", "false"]);
  });

  it("has no next milestone once the event has started", () => {
    vi.setSystemTime(new Date("2026-11-28T12:00:00+05:30"));
    const { container } = render(<MiniTimeline />);
    const steps = [...container.querySelectorAll("li")];
    expect(steps.every((s) => s.dataset.passed === "true")).toBe(true);
    expect(steps.some((s) => s.dataset.next === "true")).toBe(false);
  });
});
