import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { Countdown } from "./countdown";

// Mock config to control the target date
vi.mock("@/lib/config", () => ({
  siteConfig: {
    name: "Sankalp’26",
    dates: { eventStart: "2026-11-27T10:30:00+05:30" },
  },
}));

describe("Countdown", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the countdown dials with computed d/h/m/s values", () => {
    vi.setSystemTime(new Date("2026-11-17T08:25:55+05:30"));
    render(<Countdown />);
    expect(screen.getByTestId("countdown")).toBeInTheDocument();
    expect(document.getElementById("cd-d")).toHaveTextContent("10");
    expect(document.getElementById("cd-h")).toHaveTextContent("02");
    expect(document.getElementById("cd-m")).toHaveTextContent("04");
    expect(document.getElementById("cd-s")).toHaveTextContent("05");
  });

  it("updates every second via interval", () => {
    vi.setSystemTime(new Date("2026-11-27T10:29:55+05:30"));
    render(<Countdown />);
    expect(document.getElementById("cd-s")).toHaveTextContent("05");

    act(() => {
      vi.advanceTimersByTime(2_000);
    });
    expect(document.getElementById("cd-s")).toHaveTextContent("03");
  });

  it("shows 'has begun' when the event date is past", () => {
    vi.setSystemTime(new Date("2026-11-28T12:00:00+05:30"));
    render(<Countdown />);
    expect(screen.getByTestId("countdown-begun")).toBeInTheDocument();
    expect(screen.getByText(/has begun/i)).toBeInTheDocument();
  });

  it("does not show 'has begun' when in the future", () => {
    vi.setSystemTime(new Date("2026-11-17T10:00:00+05:30"));
    render(<Countdown />);
    expect(screen.queryByTestId("countdown-begun")).not.toBeInTheDocument();
  });

  it("transitions to begun state when time runs out", () => {
    // Start 2 seconds before the event
    vi.setSystemTime(new Date("2026-11-27T10:29:58+05:30"));
    render(<Countdown />);
    expect(screen.queryByTestId("countdown-begun")).not.toBeInTheDocument();

    // Advance past the event start
    act(() => {
      vi.advanceTimersByTime(3_000);
    });
    expect(screen.getByTestId("countdown-begun")).toBeInTheDocument();
  });

  it("labels the timer for assistive tech and each ring", () => {
    vi.setSystemTime(new Date("2026-11-17T10:00:00+05:30"));
    render(<Countdown />);
    expect(
      screen.getByRole("timer", { name: /until the hackathon starts/i }),
    ).toBeInTheDocument();
    for (const label of ["Days", "Hours", "Minutes", "Seconds"]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it("fills each ring in proportion to its unit", () => {
    // 10 days 2 h 4 min 5 s left: seconds ring is 5/60 full
    vi.setSystemTime(new Date("2026-11-17T08:25:55+05:30"));
    const { container } = render(<Countdown />);
    const arcs = container.querySelectorAll<SVGCircleElement>("circle.pg");
    expect(arcs).toHaveLength(4);
    const c = 2 * Math.PI * 44;
    expect(Number(arcs[3].style.strokeDashoffset)).toBeCloseTo(c * (1 - 5 / 60), 2);
  });
});
