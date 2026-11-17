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

  it("renders the CTA buttons", () => {
    render(<Hero />);
    expect(screen.getByRole("link", { name: /submit your abstract/i })).toHaveAttribute(
      "href",
      "#registration",
    );
    expect(screen.getByRole("link", { name: /problem statements/i })).toHaveAttribute(
      "href",
      "#themes",
    );
  });

  it("renders the four facts", () => {
    render(<Hero />);
    expect(screen.getByText("24")).toBeInTheDocument();
    expect(screen.getByText("₹75,000")).toBeInTheDocument();
    expect(screen.getByText("3 members")).toBeInTheDocument();
    expect(screen.getByText("₹600")).toBeInTheDocument();
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
