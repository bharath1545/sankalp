import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Hero } from "./hero";

// Mock the Countdown since it uses timers
vi.mock("./countdown", () => ({
  Countdown: () => <div data-testid="countdown">mocked</div>,
}));

describe("Hero", () => {
  it("renders the hero section", () => {
    render(<Hero />);
    expect(screen.getByTestId("hero")).toBeInTheDocument();
  });

  it("renders the wordmark", () => {
    render(<Hero />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Sankalp’26");
  });

  it("renders the tagline", () => {
    render(<Hero />);
    expect(screen.getByText(/national-level 24-hour hackathon/i)).toBeInTheDocument();
  });

  it("makes Final Registration the primary CTA and links to abstract registration", () => {
    render(<Hero />);
    expect(screen.getByRole("link", { name: "Final Registration" })).toHaveAttribute(
      "href",
      "/final-registration",
    );
    expect(screen.getByRole("link", { name: /abstract registration/i })).toHaveAttribute(
      "href",
      "#registration",
    );
  });

  it("renders the four facts", () => {
    render(<Hero />);
    expect(screen.getByText("24")).toBeInTheDocument();
    expect(screen.getByText("₹75,000")).toBeInTheDocument();
    expect(screen.getAllByText("03")).toHaveLength(2); // index and value
    expect(screen.getByText("₹600")).toBeInTheDocument();
  });

  it("shows the event date, time and city under the countdown", () => {
    render(<Hero />);
    expect(screen.getByText(/10:30 AM IST/)).toHaveTextContent("27–28 November 2026");
    expect(screen.getByText(/10:30 AM IST/)).toHaveTextContent("Mangaluru");
  });

  it("numbers the facts 01 to 04", () => {
    const { container } = render(<Hero />);
    const indexes = [...container.querySelectorAll(".lp-fact .ix")].map(
      (el) => el.textContent,
    );
    expect(indexes).toEqual(["01", "02", "03", "04"]);
  });

  it("renders the pill with edition and submission date", () => {
    render(<Hero />);
    expect(screen.getByText(/3rd edition/)).toBeInTheDocument();
  });

  it("renders the mini timeline", () => {
    render(<Hero />);
    expect(screen.getByTestId("mini-timeline")).toBeInTheDocument();
  });

  it("renders the countdown", () => {
    render(<Hero />);
    expect(screen.getByTestId("countdown")).toBeInTheDocument();
  });
});
