import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TeamRegistration } from "./team-registration";
import { tracks } from "@/lib/tracks";

type UE = ReturnType<typeof userEvent.setup>;

async function fillValid(user: UE) {
  await user.type(screen.getByLabelText("Team name"), "Alpha");
  await user.type(screen.getByLabelText("College"), "AJIET");
  await user.type(screen.getByLabelText("Leader phone"), "9876543210");
  await user.selectOptions(screen.getByLabelText("Challenge theme"), tracks[0].title);
  await user.type(screen.getByLabelText("Team ID"), "SNK26-0001");
  await user.type(screen.getByLabelText("Member 1 Name"), "Asha");
  await user.type(screen.getByLabelText("Member 1 USN"), "4AL22CS001");
  await user.type(screen.getByLabelText("Member 1 Email"), "asha@example.com");
}

const submit = (user: UE) =>
  user.click(screen.getByRole("button", { name: "Register team" }));

describe("TeamRegistration", () => {
  it("renders the fields and a submit button", () => {
    render(<TeamRegistration />);
    expect(screen.getByLabelText("Team name")).toBeInTheDocument();
    expect(screen.getByLabelText("Member 3 Email")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Register team" })).toBeEnabled();
  });

  it("puts the Team ID field after the leader phone", () => {
    render(<TeamRegistration />);
    const phone = screen.getByLabelText("Leader phone");
    const id = screen.getByLabelText("Team ID");
    expect(
      phone.compareDocumentPosition(id) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("requires a Team ID and does not call onRegister without it", async () => {
    const user = userEvent.setup();
    const onRegister = vi.fn();
    render(<TeamRegistration onRegister={onRegister} />);
    await fillValid(user);
    await user.clear(screen.getByLabelText("Team ID"));
    await submit(user);
    expect(
      screen.getByText("Enter the Team ID from your Round 1 email."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Team ID")).toHaveFocus();
    expect(onRegister).not.toHaveBeenCalled();
  });

  it("rejects a malformed Team ID", async () => {
    const user = userEvent.setup();
    render(<TeamRegistration onRegister={vi.fn()} />);
    await fillValid(user);
    await user.clear(screen.getByLabelText("Team ID"));
    await user.type(screen.getByLabelText("Team ID"), "a b!");
    await submit(user);
    expect(screen.getByText(/4 to 24 letters, numbers or hyphens/)).toBeInTheDocument();
  });

  it("sends the Team ID to onRegister", async () => {
    const user = userEvent.setup();
    const onRegister = vi.fn().mockResolvedValue({ teamId: "SNK26-0001" });
    render(<TeamRegistration onRegister={onRegister} />);
    await fillValid(user);
    await submit(user);
    await screen.findByTestId("team-success");
    expect(onRegister.mock.calls[0][0]).toMatchObject({ teamId: "SNK26-0001" });
  });

  it("keeps theme option labels short and the value full", () => {
    render(<TeamRegistration />);
    const options = screen.getAllByRole("option").slice(1);
    expect(options).toHaveLength(tracks.length);
    options.forEach((o, i) => {
      expect(o).toHaveValue(tracks[i].title);
      expect((o.textContent ?? "").length).toBeLessThanOrEqual(52);
    });
  });

  it("shows errors and focuses the first invalid field on empty submit", async () => {
    const user = userEvent.setup();
    const onRegister = vi.fn();
    render(<TeamRegistration onRegister={onRegister} />);
    await submit(user);
    expect(screen.getByText("Enter your team name.")).toBeInTheDocument();
    expect(screen.getByLabelText("Team name")).toHaveFocus();
    expect(screen.getByLabelText("Team name")).toHaveAttribute("aria-invalid", "true");
    expect(onRegister).not.toHaveBeenCalled();
  });

  it("requires all three fields for an optional member", async () => {
    const user = userEvent.setup();
    const onRegister = vi.fn();
    render(<TeamRegistration onRegister={onRegister} />);
    await fillValid(user);
    await user.type(screen.getByLabelText("Member 2 Name"), "Ravi");
    await submit(user);
    expect(screen.getAllByText(/complete all three fields/i).length).toBeGreaterThan(0);
    expect(onRegister).not.toHaveBeenCalled();
  });

  it("rejects a duplicate USN", async () => {
    const user = userEvent.setup();
    render(<TeamRegistration onRegister={vi.fn()} />);
    await fillValid(user);
    await user.type(screen.getByLabelText("Member 2 Name"), "Ravi");
    await user.type(screen.getByLabelText("Member 2 USN"), "4AL22CS001");
    await user.type(screen.getByLabelText("Member 2 Email"), "ravi@example.com");
    await submit(user);
    expect(
      screen.getByText("This USN is already used by another member."),
    ).toBeInTheDocument();
  });

  it("calls onRegister and shows the Team ID on success", async () => {
    const user = userEvent.setup();
    const onRegister = vi.fn().mockResolvedValue({ teamId: "SNK-TEST-0001" });
    render(<TeamRegistration onRegister={onRegister} />);
    await fillValid(user);
    await submit(user);
    expect(await screen.findByTestId("team-success")).toBeInTheDocument();
    expect(screen.getByTestId("team-id")).toHaveTextContent("SNK-TEST-0001");
    expect(onRegister).toHaveBeenCalledTimes(1);
    expect(onRegister.mock.calls[0][0]).toMatchObject({
      teamName: "Alpha",
      leaderPhone: "9876543210",
    });
  });

  it("disables the button while sending", async () => {
    const user = userEvent.setup();
    let resolve!: (v: { teamId: string }) => void;
    const onRegister = vi.fn(() => new Promise<{ teamId: string }>((r) => (resolve = r)));
    render(<TeamRegistration onRegister={onRegister} />);
    await fillValid(user);
    await submit(user);
    expect(screen.getByRole("button", { name: "Registering…" })).toBeDisabled();
    resolve({ teamId: "X-1" });
    await waitFor(() => expect(screen.getByTestId("team-id")).toBeInTheDocument());
  });

  it("shows the error and keeps the form when registration fails", async () => {
    const user = userEvent.setup();
    const onRegister = vi.fn().mockRejectedValue(new Error("Server is down."));
    render(<TeamRegistration onRegister={onRegister} />);
    await fillValid(user);
    await submit(user);
    expect(
      await screen.findByText("Your registration was not sent: Server is down."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Team name")).toHaveValue("Alpha");
    expect(screen.queryByTestId("team-success")).not.toBeInTheDocument();
  });

  it("clears the failure message on edit", async () => {
    const user = userEvent.setup();
    render(
      <TeamRegistration onRegister={vi.fn().mockRejectedValue(new Error("Nope."))} />,
    );
    await fillValid(user);
    await submit(user);
    await screen.findByText(/was not sent/);
    await user.type(screen.getByLabelText("Team name"), "x");
    expect(screen.queryByText(/was not sent/)).not.toBeInTheDocument();
  });

  it("fails honestly with the default handler and never shows a Team ID", async () => {
    const user = userEvent.setup();
    render(<TeamRegistration />);
    await fillValid(user);
    await submit(user);
    expect(await screen.findByText(/not connected yet/i)).toBeInTheDocument();
    expect(screen.queryByTestId("team-id")).not.toBeInTheDocument();
  });
});
