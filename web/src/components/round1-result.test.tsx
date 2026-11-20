import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Round1ResultBlock } from "./round1-result";

describe("Round1ResultBlock", () => {
  afterEach(() => {
    window.location.hash = "";
  });

  it("shows a Round 1 Result button with a closed panel", () => {
    render(<Round1ResultBlock />);
    const button = screen.getByRole("button", { name: "Round 1 Result" });
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(button).toHaveAttribute("aria-controls", "round-1-result");
    expect(document.getElementById("round-1-result")).not.toBeVisible();
  });

  it("opens and closes the panel", async () => {
    const user = userEvent.setup();
    render(<Round1ResultBlock />);
    const button = screen.getByRole("button", { name: "Round 1 Result" });
    await user.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("region", { name: "Round 1 result" })).toBeVisible();
    await user.click(button);
    expect(button).toHaveAttribute("aria-expanded", "false");
  });

  it("says results are not published when there is no data", async () => {
    const user = userEvent.setup();
    render(<Round1ResultBlock />);
    await user.click(screen.getByRole("button", { name: "Round 1 Result" }));
    expect(screen.getByText(/not published here yet/i)).toBeInTheDocument();
  });

  it("lists shortlisted teams when data is given", async () => {
    const user = userEvent.setup();
    render(
      <Round1ResultBlock
        results={[{ teamName: "Alpha", college: "AJIET" }, { teamName: "Beta" }]}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Round 1 Result" }));
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.queryByText(/not published/i)).not.toBeInTheDocument();
  });

  it("opens on the #round-1-result hash", () => {
    window.location.hash = "#round-1-result";
    render(<Round1ResultBlock />);
    expect(screen.getByRole("button", { name: "Round 1 Result" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });
});
