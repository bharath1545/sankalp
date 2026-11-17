import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider, THEME_STORAGE_KEY } from "./theme-provider";
import { ThemeToggle } from "./theme-toggle";

function setup() {
  return render(
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>,
  );
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
});

describe("ThemeToggle", () => {
  it("defaults to dark and offers light", () => {
    setup();
    expect(
      screen.getByRole("button", { name: "Switch to light mode" }),
    ).toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
  });

  it("switches to light and stores it under the sankalp-theme key", async () => {
    setup();
    await act(async () => {
      await userEvent.click(screen.getByRole("button", { name: "Switch to light mode" }));
    });
    expect(document.documentElement).toHaveAttribute("data-theme", "light");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
    expect(screen.getByRole("button", { name: "Switch to dark mode" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("restores a saved light theme on load", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "light");
    setup();
    expect(document.documentElement).toHaveAttribute("data-theme", "light");
  });
});
