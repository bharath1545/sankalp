import { render, screen, within } from "@testing-library/react";
import { About } from "./about";

describe("About", () => {
  it("is Section 2 with id about", () => {
    render(<About />);
    expect(screen.getByTestId("about")).toHaveAttribute("id", "about");
    expect(
      screen.getByRole("heading", { level: 2, name: /bold ideas/i }),
    ).toBeInTheDocument();
  });

  it("introduces the event, organiser, edition and venue", () => {
    render(<About />);
    const intro = screen.getByText(/national-level 24-hour hackathon/i);
    expect(intro).toHaveTextContent("Sankalp’26");
    expect(intro).toHaveTextContent("3rd edition");
    expect(intro).toHaveTextContent("IEEE Student Branch");
    expect(intro).toHaveTextContent("A.J. Institute of Engineering and Technology");
    expect(intro).toHaveTextContent("Mangaluru");
  });

  it("lists the four expectations from the live site", () => {
    render(<About />);
    const list = screen.getByRole("list");
    const titles = within(list)
      .getAllByRole("heading", { level: 4 })
      .map((h) => h.textContent);
    expect(titles).toEqual([
      "Rapid prototyping",
      "Mentor support",
      "Real-world impact",
      "Exposure & rewards",
    ]);
  });

  it("takes the prize pool from config", () => {
    render(<About />);
    expect(screen.getByText(/compete for a ₹75,000 prize pool/)).toBeInTheDocument();
  });

  it("hides decorative icons from assistive tech", () => {
    const { container } = render(<About />);
    const icons = container.querySelectorAll("li svg");
    expect(icons).toHaveLength(4);
    icons.forEach((svg) => expect(svg).toHaveAttribute("aria-hidden", "true"));
  });
});
