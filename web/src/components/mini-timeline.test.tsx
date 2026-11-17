import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MiniTimeline } from "./mini-timeline";

describe("MiniTimeline", () => {
  it("renders the timeline container", () => {
    render(<MiniTimeline />);
    expect(screen.getByTestId("mini-timeline")).toBeInTheDocument();
  });

  it("renders all four milestones", () => {
    render(<MiniTimeline />);
    expect(screen.getByText("Idea submission closes")).toBeInTheDocument();
    expect(screen.getByText("Acceptance notifications")).toBeInTheDocument();
    expect(screen.getByText("Last date of team registration")).toBeInTheDocument();
    expect(screen.getByText(/Sankalp/)).toBeInTheDocument();
  });

  it("renders formatted dates from config", () => {
    render(<MiniTimeline />);
    // The dates come from dateText which uses formatDate on the config strings
    expect(screen.getByText("15 November 2026")).toBeInTheDocument();
    expect(screen.getByText("20 November 2026")).toBeInTheDocument();
    expect(screen.getByText("25 November 2026")).toBeInTheDocument();
    expect(screen.getByText("27–28 November 2026")).toBeInTheDocument();
  });

  it("shows fee amount on the registration milestone", () => {
    render(<MiniTimeline />);
    expect(screen.getByText("₹600 per team")).toBeInTheDocument();
  });
});
