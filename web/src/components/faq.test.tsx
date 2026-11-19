import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { faqItems } from "@/lib/faq";
import { Faq } from "./faq";

const buttons = () => screen.getAllByRole("button");

describe("Faq", () => {
  it("is Section 9 with id faq and a heading", () => {
    render(<Faq />);
    expect(screen.getByTestId("faq")).toHaveAttribute("id", "faq");
    expect(
      screen.getByRole("heading", { level: 2, name: "Frequently asked questions" }),
    ).toBeInTheDocument();
  });

  it("shows every question as a button inside a level 3 heading", () => {
    render(<Faq />);
    expect(buttons()).toHaveLength(faqItems.length);
    faqItems.forEach((item) => {
      const button = screen.getByRole("button", { name: item.question });
      expect(button.closest("h3")).not.toBeNull();
    });
  });

  it("starts with every answer collapsed", () => {
    render(<Faq />);
    buttons().forEach((b) => expect(b).toHaveAttribute("aria-expanded", "false"));
    expect(screen.queryAllByRole("region")).toHaveLength(0);
  });

  it("opens and closes an answer on click", async () => {
    const user = userEvent.setup();
    render(<Faq />);
    const button = screen.getByRole("button", { name: "Who can participate?" });
    await user.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.getByRole("region", { name: "Who can participate?" }),
    ).toHaveTextContent("B.E / B.Tech, MCA and Diploma students can participate.");
    await user.click(button);
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
  });

  it("works from the keyboard with Enter and Space", async () => {
    const user = userEvent.setup();
    render(<Faq />);
    const button = buttons()[0];
    button.focus();
    await user.keyboard("{Enter}");
    expect(button).toHaveAttribute("aria-expanded", "true");
    await user.keyboard(" ");
    expect(button).toHaveAttribute("aria-expanded", "false");
  });

  it("lets several answers stay open", async () => {
    const user = userEvent.setup();
    render(<Faq />);
    await user.click(buttons()[0]);
    await user.click(buttons()[1]);
    expect(screen.getAllByRole("region")).toHaveLength(2);
  });

  it("links each button to its panel with aria-controls", async () => {
    const user = userEvent.setup();
    render(<Faq />);
    const button = buttons()[2];
    await user.click(button);
    const panel = document.getElementById(button.getAttribute("aria-controls")!);
    expect(panel).not.toBeNull();
    expect(panel).toBeVisible();
  });

  it("moves focus with arrow keys, wrapping at both ends, and Home and End", async () => {
    const user = userEvent.setup();
    render(<Faq />);
    const list = buttons();
    list[0].focus();
    await user.keyboard("{ArrowDown}");
    expect(list[1]).toHaveFocus();
    await user.keyboard("{ArrowUp}{ArrowUp}");
    expect(list[list.length - 1]).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(list[0]).toHaveFocus();
    await user.keyboard("{End}");
    expect(list[list.length - 1]).toHaveFocus();
    await user.keyboard("{Home}");
    expect(list[0]).toHaveFocus();
  });
});

describe("faqItems content", () => {
  const byId = (id: string) => faqItems.find((i) => i.id === id)!.answer;

  it("takes facts from the config", () => {
    expect(byId("team-size")).toContain("1 to 3 members");
    expect(byId("fee")).toContain("₹600");
    expect(byId("fee")).toContain("UTR");
    expect(byId("prizes")).toContain("₹75,000");
    expect(byId("abstract")).toContain("PDF, DOC, DOCX");
    expect(byId("abstract")).toContain("3 MB");
    expect(byId("after-abstract")).toContain("15 November 2026");
    expect(byId("after-abstract")).toContain("20 November 2026");
    expect(byId("after-abstract")).toContain("25 November 2026");
    expect(byId("when-where")).toContain("27–28 November 2026");
    expect(byId("when-where")).toContain("Kottara Chowki");
    expect(byId("contact")).toContain("hackathon@ajiet.edu.in");
  });

  it("has unique ids and non-empty text", () => {
    expect(new Set(faqItems.map((i) => i.id)).size).toBe(faqItems.length);
    faqItems.forEach((i) => {
      expect(i.question.trim()).not.toBe("");
      expect(i.answer.trim()).not.toBe("");
    });
  });
});
