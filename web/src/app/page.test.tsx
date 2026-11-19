import { render, screen } from "@testing-library/react";
import Page from "./page";

// Mock Countdown to avoid timer issues in this smoke test
vi.mock("@/components/countdown", () => ({
  Countdown: () => <div data-testid="countdown">mocked</div>,
}));

describe("home page", () => {
  it("renders the hero heading", () => {
    render(<Page />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Sankalp’26");
  });

  it("mounts the abstract form inside the registration section", () => {
    render(<Page />);
    const section = screen.getByTestId("abstract-registration");
    expect(section).toContainElement(screen.getByTestId("abstract-form"));
  });
});
