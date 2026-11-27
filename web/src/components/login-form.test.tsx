import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "./login-form";

const email = () => screen.getByLabelText("Email");
const submit = (u: ReturnType<typeof userEvent.setup>) =>
  u.click(screen.getByRole("button", { name: "Continue" }));

describe("LoginForm", () => {
  it("renders an email field and a button", () => {
    render(<LoginForm />);
    expect(email()).toHaveAttribute("type", "email");
    expect(screen.getByRole("button", { name: "Continue" })).toBeEnabled();
  });

  it("requires an email and focuses the field", async () => {
    const u = userEvent.setup();
    const onLogin = vi.fn();
    render(<LoginForm onLogin={onLogin} />);
    await submit(u);
    expect(screen.getByText("Enter your email address.")).toBeInTheDocument();
    expect(email()).toHaveFocus();
    expect(email()).toHaveAttribute("aria-invalid", "true");
    expect(onLogin).not.toHaveBeenCalled();
  });

  it("rejects a malformed email", async () => {
    const u = userEvent.setup();
    const onLogin = vi.fn();
    render(<LoginForm onLogin={onLogin} />);
    await u.type(email(), "nope");
    await submit(u);
    expect(screen.getByText("Enter a valid email address.")).toBeInTheDocument();
    expect(onLogin).not.toHaveBeenCalled();
  });

  it("clears the error on edit", async () => {
    const u = userEvent.setup();
    render(<LoginForm onLogin={vi.fn()} />);
    await submit(u);
    await u.type(email(), "a");
    expect(screen.queryByText("Enter your email address.")).not.toBeInTheDocument();
  });

  it("calls onLogin with the trimmed email and shows success", async () => {
    const u = userEvent.setup();
    const onLogin = vi.fn().mockResolvedValue(undefined);
    render(<LoginForm onLogin={onLogin} />);
    await u.type(email(), "  asha@example.com ");
    await submit(u);
    expect(await screen.findByTestId("login-success")).toBeInTheDocument();
    expect(onLogin).toHaveBeenCalledWith({ email: "asha@example.com" });
  });

  it("disables the button while sending", async () => {
    const u = userEvent.setup();
    let resolve!: () => void;
    const onLogin = vi.fn(() => new Promise<void>((r) => (resolve = r)));
    render(<LoginForm onLogin={onLogin} />);
    await u.type(email(), "asha@example.com");
    await submit(u);
    expect(screen.getByRole("button", { name: "Logging in…" })).toBeDisabled();
    resolve();
    expect(await screen.findByTestId("login-success")).toBeInTheDocument();
  });

  it("shows the failure and keeps the email", async () => {
    const u = userEvent.setup();
    render(<LoginForm onLogin={vi.fn().mockRejectedValue(new Error("Bad."))} />);
    await u.type(email(), "asha@example.com");
    await submit(u);
    expect(await screen.findByText("Login failed: Bad.")).toBeInTheDocument();
    expect(email()).toHaveValue("asha@example.com");
  });

  it("fails honestly with the default handler", async () => {
    const u = userEvent.setup();
    render(<LoginForm />);
    await u.type(email(), "asha@example.com");
    await submit(u);
    expect(await screen.findByText(/not connected yet/i)).toBeInTheDocument();
    expect(screen.queryByTestId("login-success")).not.toBeInTheDocument();
  });
});
