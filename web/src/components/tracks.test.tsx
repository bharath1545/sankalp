import { render, screen, within } from "@testing-library/react";
import { Tracks } from "./tracks";
import { tracks } from "@/lib/tracks";

describe("Tracks", () => {
  it("is Section 3 with id themes", () => {
    render(<Tracks />);
    expect(screen.getByTestId("tracks")).toHaveAttribute("id", "themes");
    expect(
      screen.getByRole("heading", { level: 2, name: /seven real-world challenges/i }),
    ).toBeInTheDocument();
  });

  it("shows all seven problem statements in order", () => {
    render(<Tracks />);
    const cards = screen.getAllByTestId("track");
    expect(cards).toHaveLength(7);
    const titles = cards.map(
      (c) => within(c).getByRole("heading", { level: 3 }).textContent,
    );
    expect(titles).toEqual(tracks.map((t) => t.title));
    expect(titles[0]).toBe("AI-Enabled Drone & Counter-Drone Threat Simulation Trainer");
    expect(titles[6]).toBe("Supply Chain Intelligence & Coastal Chain Intelligence");
  });

  it("numbers tracks 01 to 07", () => {
    render(<Tracks />);
    for (const n of ["01", "02", "03", "04", "05", "06", "07"]) {
      expect(screen.getByText(`TRACK ${n}`)).toBeInTheDocument();
    }
  });

  it("shows a description and a domain tag on every card", () => {
    render(<Tracks />);
    for (const t of tracks) {
      expect(screen.getByText(t.text)).toBeInTheDocument();
    }
    expect(screen.getByText("Healthcare")).toBeInTheDocument();
  });

  it("gives every track its own icon, hidden from assistive tech", () => {
    const { container } = render(<Tracks />);
    const icons = container.querySelectorAll("li svg");
    expect(icons).toHaveLength(7);
    icons.forEach((svg) => expect(svg).toHaveAttribute("aria-hidden", "true"));
    const shapes = tracks.map((t) => t.icon.join("|"));
    expect(new Set(shapes).size).toBe(7);
  });
});
