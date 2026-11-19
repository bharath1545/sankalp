import { render, screen } from "@testing-library/react";
import { Prizes } from "./prizes";
import { prizeCategories, prizeTotal, prizePoolInr } from "@/lib/prizes";

describe("Prizes", () => {
  it("is Section 4 with id prizes", () => {
    render(<Prizes />);
    expect(screen.getByTestId("prizes")).toHaveAttribute("id", "prizes");
    expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
  });

  it("shows the confirmed pool from config", () => {
    render(<Prizes />);
    expect(screen.getByTestId("prize-pool")).toHaveTextContent("₹75,000");
  });

  it("says the breakdown is coming when no categories are set", () => {
    render(<Prizes categories={[]} />);
    expect(screen.getByTestId("prizes-pending")).toHaveTextContent(/announced soon/i);
    expect(screen.queryAllByTestId("prize")).toHaveLength(0);
  });

  it("lists categories with amounts once they exist", () => {
    render(
      <Prizes
        categories={[
          { id: "1", name: "Example winner", amountInr: 40000, note: "Trophy" },
          { id: "2", name: "Example runner-up", amountInr: 20000 },
        ]}
      />,
    );
    expect(screen.getAllByTestId("prize")).toHaveLength(2);
    expect(screen.getByText("₹40,000")).toBeInTheDocument();
    expect(screen.getByText("Trophy")).toBeInTheDocument();
    expect(screen.queryByTestId("prizes-pending")).not.toBeInTheDocument();
  });
});

describe("prize data", () => {
  it("never adds up to more than the pool", () => {
    expect(prizeTotal(prizeCategories)).toBeLessThanOrEqual(prizePoolInr);
  });
  it("has unique category ids", () => {
    const ids = prizeCategories.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
