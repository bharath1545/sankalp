import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProfileMenu } from "./profile-menu";
import type { SessionUser } from "@/lib/session";

const user: SessionUser = { name: "Asha Rao", email: "asha@example.com", role: "user" };

const trigger = () => screen.getByRole("button", { name: "Account menu" });

describe("ProfileMenu", () => {
  it("shows initials and a closed menu", () => {
    render(<ProfileMenu user={user} onSignOut={vi.fn()} />);
    expect(trigger()).toHaveTextContent("AS");
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("button", { name: "Log out" })).not.toBeInTheDocument();
  });

  it("falls back to the email for initials and name", () => {
    render(
      <ProfileMenu
        user={{ email: "zed@example.com", role: "user" }}
        onSignOut={vi.fn()}
      />,
    );
    expect(trigger()).toHaveTextContent("ZE");
  });

  it("opens and shows the name, email and Log out", async () => {
    const u = userEvent.setup();
    render(<ProfileMenu user={user} onSignOut={vi.fn()} />);
    await u.click(trigger());
    expect(trigger()).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Asha Rao")).toBeVisible();
    expect(screen.getByText("asha@example.com")).toBeVisible();
    expect(screen.getByRole("button", { name: "Log out" })).toBeVisible();
  });

  it("marks My profile as not available yet", async () => {
    const u = userEvent.setup();
    render(<ProfileMenu user={user} onSignOut={vi.fn()} />);
    await u.click(trigger());
    expect(screen.getByText("My profile").closest("[aria-disabled]")).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });

  it("shows an Admin label only for the admin role", async () => {
    const u = userEvent.setup();
    const { rerender } = render(<ProfileMenu user={user} onSignOut={vi.fn()} />);
    await u.click(trigger());
    expect(screen.queryByText("Admin")).not.toBeInTheDocument();
    rerender(<ProfileMenu user={{ ...user, role: "admin" }} onSignOut={vi.fn()} />);
    expect(screen.getByText("Admin")).toBeInTheDocument();
  });

  it("calls onSignOut and closes", async () => {
    const u = userEvent.setup();
    const onSignOut = vi.fn();
    render(<ProfileMenu user={user} onSignOut={onSignOut} />);
    await u.click(trigger());
    await u.click(screen.getByRole("button", { name: "Log out" }));
    expect(onSignOut).toHaveBeenCalledTimes(1);
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
  });

  it("closes on Escape and returns focus to the trigger", async () => {
    const u = userEvent.setup();
    render(<ProfileMenu user={user} onSignOut={vi.fn()} />);
    await u.click(trigger());
    await u.keyboard("{Escape}");
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
    expect(trigger()).toHaveFocus();
  });

  it("closes on an outside click", async () => {
    const u = userEvent.setup();
    render(
      <>
        <button type="button">outside</button>
        <ProfileMenu user={user} onSignOut={vi.fn()} />
      </>,
    );
    await u.click(trigger());
    await u.click(screen.getByRole("button", { name: "outside" }));
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
  });
});
