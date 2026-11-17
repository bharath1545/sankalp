import { render, screen } from "@testing-library/react";
import Page from "./page";

describe("placeholder page", () => {
  it("renders the heading", () => {
    render(<Page />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Sankalp’26" }),
    ).toBeInTheDocument();
  });
});
