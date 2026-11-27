import { render, screen } from "@testing-library/react";
import { HeaderAccount } from "./header-account";
import { SessionContext } from "@/lib/session";

describe("HeaderAccount", () => {
  it("shows a Login link to /login when signed out", () => {
    render(<HeaderAccount />);
    expect(screen.getByRole("link", { name: "Login" })).toHaveAttribute("href", "/login");
    expect(screen.queryByTestId("profile-menu")).not.toBeInTheDocument();
  });

  it("replaces Login with the profile menu when signed in", () => {
    render(
      <SessionContext.Provider
        value={{ user: { email: "a@b.co", role: "user" }, signOut: vi.fn() }}
      >
        <HeaderAccount />
      </SessionContext.Provider>,
    );
    expect(screen.getByTestId("profile-menu")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Login" })).not.toBeInTheDocument();
  });
});
