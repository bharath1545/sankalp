import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { tracks } from "@/lib/tracks";
import { AbstractForm } from "./abstract-form";

afterEach(() => vi.unstubAllGlobals());

async function fillValid(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Team name"), "Team Spark");
  await user.type(screen.getByLabelText("College"), "AJIET");
  await user.type(screen.getByLabelText("Leader phone"), "9876543210");
  await user.selectOptions(screen.getByLabelText("Challenge theme"), tracks[0].title);
  await user.type(screen.getByLabelText("Member 1 Name"), "Asha Rao");
  await user.type(screen.getByLabelText("Member 1 USN"), "4AJ22EC001");
  await user.type(screen.getByLabelText("Member 1 Email"), "asha@example.com");
  await user.upload(
    screen.getByLabelText(/Abstract file/),
    new File(["x"], "idea.pdf", { type: "application/pdf" }),
  );
}

describe("AbstractForm", () => {
  it("offers the seven themes", () => {
    render(<AbstractForm />);
    expect(
      screen.getByLabelText("Challenge theme").querySelectorAll("option"),
    ).toHaveLength(8);
  });

  it("has three member groups, only the first required", () => {
    render(<AbstractForm />);
    expect(screen.getByText(/Member 1 · required/)).toBeInTheDocument();
    expect(screen.getAllByText(/optional/)).toHaveLength(2);
  });

  it("hides the honeypot from assistive tech and keyboard", () => {
    render(<AbstractForm />);
    const honey = document.getElementById("af-website")!;
    expect(honey).toHaveAttribute("tabindex", "-1");
    expect(honey.closest("[aria-hidden='true']")).not.toBeNull();
  });

  it("shows errors, focuses the first bad field and does not call fetch", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    render(<AbstractForm />);
    await user.click(screen.getByRole("button", { name: "Submit registration details" }));
    expect(screen.getByLabelText("Team name")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText("Team name")).toHaveFocus();
    expect(screen.getByText("Enter your team name.")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(
      /Complete the required team details/,
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("clears a field error when the user edits it", async () => {
    const user = userEvent.setup();
    render(<AbstractForm />);
    await user.click(screen.getByRole("button", { name: "Submit registration details" }));
    await user.type(screen.getByLabelText("Team name"), "A");
    expect(screen.queryByText("Enter your team name.")).not.toBeInTheDocument();
  });

  it("rejects a wrong file type", async () => {
    const user = userEvent.setup({ applyAccept: false });
    render(<AbstractForm />);
    await fillValid(user);
    await user.upload(
      screen.getByLabelText(/Abstract file/),
      new File(["x"], "idea.txt", { type: "text/plain" }),
    );
    await user.click(screen.getByRole("button", { name: "Submit registration details" }));
    expect(screen.getByText(/Attach a PDF, DOC, or DOCX abstract/)).toBeInTheDocument();
  });

  it("submits the payload and shows the thank-you view", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => ({ success: true }) });
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    render(<AbstractForm />);
    await fillValid(user);
    await user.click(screen.getByRole("button", { name: "Submit registration details" }));
    await waitFor(() =>
      expect(screen.getByTestId("abstract-success")).toBeInTheDocument(),
    );
    expect(screen.getByText("Thank you!")).toBeInTheDocument();
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/submit");
    const body = JSON.parse(init.body);
    expect(body.teamName).toBe("Team Spark");
    expect(body.members[0].usn).toBe("4AJ22EC001");
    expect(body.website).toBe("");
    expect(body.attachment.name).toBe("idea.pdf");
    expect(body.attachment.content).toBe("eA==");
  });

  it("shows the server error and keeps the form filled", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: "Email service down." }),
      }),
    );
    const user = userEvent.setup();
    render(<AbstractForm />);
    await fillValid(user);
    await user.click(screen.getByRole("button", { name: "Submit registration details" }));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Your registration was not sent: Email service down.",
      ),
    );
    expect(screen.getByLabelText("Team name")).toHaveValue("Team Spark");
    expect(
      screen.getByRole("button", { name: "Submit registration details" }),
    ).toBeEnabled();
  });

  it("disables the button while sending", async () => {
    let release!: (v: unknown) => void;
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(new Promise((r) => (release = r))));
    const user = userEvent.setup();
    render(<AbstractForm />);
    await fillValid(user);
    await user.click(screen.getByRole("button", { name: "Submit registration details" }));
    const btn = await screen.findByRole("button", { name: "Submitting…" });
    expect(btn).toBeDisabled();
    release({ ok: true, json: async () => ({ success: true }) });
    await waitFor(() => expect(screen.getByText("Thank you!")).toBeInTheDocument());
  });
});
