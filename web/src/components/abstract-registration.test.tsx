import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { AbstractRegistration } from "./abstract-registration";

describe("AbstractRegistration", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-10T10:00:00+05:30"));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("is Section 6 with id registration", () => {
    render(<AbstractRegistration />);
    expect(screen.getByTestId("abstract-registration")).toHaveAttribute(
      "id",
      "registration",
    );
    expect(
      screen.getByRole("heading", { level: 2, name: "Team and abstract registration" }),
    ).toBeInTheDocument();
  });

  it("explains the three steps with dates and fee from config", () => {
    render(<AbstractRegistration />);
    const steps = screen.getAllByTestId("step");
    expect(steps).toHaveLength(3);
    expect(steps[0]).toHaveTextContent("15 November 2026");
    expect(steps[1]).toHaveTextContent("Round 1 result");
    expect(steps[1]).toHaveTextContent("20 November 2026");
    expect(steps[2]).toHaveTextContent("₹600");
    expect(steps[2]).toHaveTextContent("25 November 2026");
  });

  it("lists what to submit, including formats and size limit", () => {
    render(<AbstractRegistration />);
    expect(screen.getByText(/PDF, DOC, DOCX file, up to 3 MB/)).toBeInTheDocument();
    expect(screen.getByText(/Up to 3 members/)).toBeInTheDocument();
    expect(screen.getByText(/seven problem statements/)).toBeInTheDocument();
  });

  it("has a button to the Final Registration page", () => {
    render(<AbstractRegistration />);
    expect(
      screen.getByRole("link", { name: "Go to Final Registration" }),
    ).toHaveAttribute("href", "/final-registration");
  });

  it("renders a form slot when children are given", () => {
    render(
      <AbstractRegistration>
        <form aria-label="Abstract form" />
      </AbstractRegistration>,
    );
    expect(
      within(screen.getByTestId("abstract-registration")).getByRole("form", {
        name: "Abstract form",
      }),
    ).toBeInTheDocument();
  });

  it("shows submission as open before the deadline", () => {
    render(<AbstractRegistration />);
    const badge = screen.getByTestId("deadline");
    expect(badge).toHaveAttribute("data-state", "open");
    expect(badge).toHaveTextContent("Open until 15 November 2026");
  });

  it("shows submission as closed after the deadline day ends", () => {
    vi.setSystemTime(new Date("2026-11-16T00:00:00+05:30"));
    render(<AbstractRegistration />);
    const badge = screen.getByTestId("deadline");
    expect(badge).toHaveAttribute("data-state", "closed");
    expect(badge).toHaveTextContent("Closed on 15 November 2026");
  });

  it("still counts the deadline day itself as open", () => {
    vi.setSystemTime(new Date("2026-11-15T23:30:00+05:30"));
    render(<AbstractRegistration />);
    expect(screen.getByTestId("deadline")).toHaveAttribute("data-state", "open");
  });
});
