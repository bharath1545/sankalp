import { render, screen } from "@testing-library/react";
import LoginPage, { metadata } from "./page";

describe("login page", () => {
  it("has a heading, title and the form", () => {
    render(<LoginPage />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Log in");
    expect(String(metadata.title)).toContain("Log in");
    expect(screen.getByTestId("login-form")).toBeInTheDocument();
  });

  it("does not offer a separate admin login", () => {
    render(<LoginPage />);
    expect(screen.queryByText(/admin login/i)).not.toBeInTheDocument();
  });
});
