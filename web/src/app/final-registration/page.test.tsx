import { render, screen } from "@testing-library/react";
import FinalRegistrationPage, { metadata } from "./page";

describe("final registration page", () => {
  it("has a title and heading", () => {
    render(<FinalRegistrationPage />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Final Registration",
    );
    expect(String(metadata.title)).toContain("Final Registration");
  });

  it("shows the Round 1 Result button and the team form", () => {
    render(<FinalRegistrationPage />);
    expect(screen.getByRole("button", { name: "Round 1 Result" })).toBeInTheDocument();
    expect(screen.getByTestId("team-form")).toBeInTheDocument();
  });

  it("states the fee from config", () => {
    render(<FinalRegistrationPage />);
    expect(screen.getAllByText(/₹600/).length).toBeGreaterThan(0);
  });
});
