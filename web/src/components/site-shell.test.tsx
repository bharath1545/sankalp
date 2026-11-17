import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "./theme-provider";
import { SiteShell } from "./site-shell";

vi.mock("lenis", () => ({
  default: vi.fn(function () {
    return { raf: vi.fn(), destroy: vi.fn() };
  }),
}));

function setup() {
  return render(
    <ThemeProvider>
      <SiteShell>
        <h1>Page content</h1>
      </SiteShell>
    </ThemeProvider>,
  );
}

describe("SiteShell", () => {
  it("puts the skip link first and points it at main", () => {
    setup();
    const skip = screen.getByRole("link", { name: "Skip to content" });
    expect(skip).toHaveAttribute("href", "#main");
    expect(document.body.querySelector("a")).toBe(skip);
    expect(screen.getByRole("main")).toHaveAttribute("id", "main");
  });

  it("shows the Login button and theme toggle in the header", () => {
    setup();
    const header = screen.getByRole("banner");
    expect(header).toContainElement(screen.getByRole("button", { name: "Login" }));
    expect(header).toContainElement(screen.getByRole("button", { name: /Switch to/ }));
  });

  it("links the site name to home", () => {
    setup();
    expect(screen.getByRole("link", { name: "Sankalp’26" })).toHaveAttribute("href", "/");
  });

  it("renders the footer with venue and dates", () => {
    setup();
    const footer = screen.getByRole("contentinfo");
    expect(footer).toHaveTextContent("27–28 November 2026");
    expect(footer).toHaveTextContent("A.J. Institute of Engineering and Technology");
  });

  it("renders page content inside main", () => {
    setup();
    expect(screen.getByRole("main")).toContainElement(
      screen.getByRole("heading", { name: "Page content" }),
    );
  });
});
