import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Dock } from "./dock";
import { ThemeProvider } from "./theme-provider";

const route = vi.hoisted(() => ({ path: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => route.path }));

interface Watch {
  cb: IntersectionObserverCallback;
  options?: IntersectionObserverInit;
}
let watchers: Watch[] = [];
class FakeObserver {
  constructor(cb: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    watchers.push({ cb, options });
  }
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}
const heroWatcher = () =>
  watchers.filter((w) => Array.isArray(w.options?.threshold)).at(-1)!;
const sectionWatcher = () => watchers.filter((w) => w.options?.rootMargin).at(-1)!;

const ALL = [
  "home",
  "about",
  "themes",
  "prizes",
  "registration",
  "faq",
  "community",
  "schedule",
  "countdown",
];

function addSections(ids: string[]) {
  ids.forEach((id) => {
    const el = document.createElement("section");
    el.id = id;
    el.dataset.testSection = "true";
    document.body.appendChild(el);
  });
}

function trigger(w: Watch, entry: Partial<IntersectionObserverEntry>) {
  act(() => w.cb([entry as IntersectionObserverEntry], {} as IntersectionObserver));
}
const heroRatio = (ratio: number) =>
  trigger(heroWatcher(), {
    target: document.getElementById("home")!,
    intersectionRatio: ratio,
    isIntersecting: ratio > 0,
  });
const see = (id: string, isIntersecting = true) =>
  trigger(sectionWatcher(), { target: document.getElementById(id)!, isIntersecting });

function setup() {
  return render(
    <ThemeProvider>
      <Dock />
    </ThemeProvider>,
  );
}

const nav = () => screen.getByRole("navigation", { name: "Primary" });
const wrap = () => screen.getByTestId("dock-wrap");
// Plain DOM lookup: the focus test mocks Element.matches, which Testing Library role queries use.
const bubble = () => document.querySelector(".dk-bubble")!;

beforeEach(() => {
  route.path = "/";
  watchers = [];
  vi.stubGlobal("IntersectionObserver", FakeObserver);
});
afterEach(() => {
  document.querySelectorAll("[data-test-section]").forEach((el) => el.remove());
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("Dock visibility", () => {
  it("is hidden over the hero and slides in after it", () => {
    addSections(ALL);
    setup();
    expect(wrap()).not.toHaveClass("show");
    heroRatio(0.2);
    expect(wrap()).toHaveClass("show");
    heroRatio(0.8);
    expect(wrap()).not.toHaveClass("show");
  });

  it("uses the 55% mark of the hero as the switch point", () => {
    addSections(ALL);
    setup();
    heroRatio(0.55);
    expect(wrap()).toHaveClass("show");
    heroRatio(0.56);
    expect(wrap()).not.toHaveClass("show");
  });

  it("shows straight away on pages without a hero", () => {
    route.path = "/final-registration";
    setup();
    expect(wrap()).toHaveClass("show");
  });

  it("shows straight away when the page has no hero element", () => {
    setup();
    expect(wrap()).toHaveClass("show");
  });

  it("closes the More menu when the hero comes back", async () => {
    addSections(ALL);
    const user = userEvent.setup();
    setup();
    heroRatio(0.1);
    await user.click(screen.getByRole("button", { name: "More" }));
    expect(screen.getByRole("button", { name: "More" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    heroRatio(0.9);
    expect(screen.getByRole("button", { name: "More" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });
});

describe("Dock items", () => {
  it("shows the spec items in order, icon only, ending with Final Registration and the theme switch", () => {
    addSections(ALL);
    setup();
    const items = [...nav().querySelectorAll("a, button")].map((el) =>
      el.getAttribute("aria-label"),
    );
    expect(items).toEqual([
      "Home",
      "About",
      "Prizes",
      "Community Support",
      "More",
      "Final Registration",
      "Switch to light mode",
    ]);
    // Icon only: no visible text inside the items.
    nav()
      .querySelectorAll(".dk-it")
      .forEach((el) => expect(el.textContent).toBe(""));
  });

  it("scrolls to sections with a hash link on the home page", () => {
    addSections(ALL);
    setup();
    expect(screen.getByRole("link", { name: "About" })).toHaveAttribute("href", "#about");
    expect(screen.getByRole("link", { name: "Prizes" })).toHaveAttribute(
      "href",
      "#prizes",
    );
  });

  it("goes through the home page from other pages and never disables items there", () => {
    route.path = "/final-registration";
    setup();
    expect(screen.getByRole("link", { name: "About" })).toHaveAttribute(
      "href",
      "/#about",
    );
    expect(screen.getByRole("link", { name: "Community Support" })).toHaveAttribute(
      "href",
      "/#community",
    );
  });

  it("links Final Registration to its own page and marks it as a page", () => {
    setup();
    const link = screen.getByRole("link", { name: "Final Registration" });
    expect(link).toHaveAttribute("href", "/final-registration");
    expect(link).toHaveAttribute("data-page");
    expect(link).toHaveClass("cta");
  });

  it("disables items whose section is not on the page yet", () => {
    addSections(["home", "about", "prizes"]);
    setup();
    const community = screen.getByRole("button", {
      name: "Community Support (coming soon)",
    });
    expect(community).toBeDisabled();
    expect(screen.getByRole("link", { name: "About" })).toBeInTheDocument();
  });

  it("enables an item when its section exists", () => {
    addSections(ALL);
    setup();
    expect(screen.queryByRole("button", { name: /coming soon/ })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Community Support" })).toBeInTheDocument();
  });

  it("hides only Community Support on phones", () => {
    addSections(ALL);
    setup();
    expect(screen.getByRole("link", { name: "Community Support" })).toHaveClass("dk-opt");
    ["Home", "About", "Prizes"].forEach((name) =>
      expect(screen.getByRole("link", { name })).not.toHaveClass("dk-opt"),
    );
  });
});

describe("Dock active section", () => {
  it("marks the item for the section in view with a dot", () => {
    addSections(ALL);
    setup();
    see("about");
    expect(screen.getByRole("link", { name: "About" })).toHaveAttribute(
      "aria-current",
      "true",
    );
    expect(screen.getByRole("link", { name: "Home" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("moves the mark when another section comes into view", () => {
    addSections(ALL);
    setup();
    see("about");
    see("about", false);
    see("prizes");
    expect(screen.getByRole("link", { name: "Prizes" })).toHaveAttribute(
      "aria-current",
      "true",
    );
    expect(screen.getByRole("link", { name: "About" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("never marks Final Registration", () => {
    addSections(ALL);
    setup();
    see("about");
    expect(screen.getByRole("link", { name: "Final Registration" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("lights More for a section in the More menu", () => {
    addSections(ALL);
    setup();
    see("themes");
    expect(screen.getByRole("button", { name: "More" })).toHaveAttribute(
      "data-active",
      "true",
    );
  });

  it("clears the mark on sections with no dock item", () => {
    addSections(ALL);
    setup();
    see("prizes");
    see("prizes", false);
    see("registration");
    expect(nav().querySelector("[aria-current]")).toBeNull();
    expect(screen.getByRole("button", { name: "More" })).toHaveAttribute(
      "data-active",
      "false",
    );
  });

  it("lights More on phones when Community Support is in view", () => {
    addSections(ALL);
    setup();
    see("community");
    expect(screen.getByRole("button", { name: "More" })).toHaveAttribute(
      "data-active-phone",
      "true",
    );
  });
});

describe("Dock More menu", () => {
  it("is closed at first and opens with the three More items", async () => {
    addSections(ALL);
    const user = userEvent.setup();
    setup();
    const more = screen.getByRole("button", { name: "More" });
    expect(more).toHaveAttribute("aria-expanded", "false");
    expect(
      screen.queryByRole("link", { name: "Themes / Tracks" }),
    ).not.toBeInTheDocument();

    await user.click(more);
    expect(more).toHaveAttribute("aria-expanded", "true");
    expect(more).toHaveAttribute("aria-controls", "dock-more-menu");
    const menu = document.getElementById("dock-more-menu")!;
    ["Themes / Tracks", "Schedule", "Countdown"].forEach((name) =>
      expect(within(menu).getByRole("link", { name })).toBeInTheDocument(),
    );
    expect(within(menu).getByRole("link", { name: "Themes / Tracks" })).toHaveAttribute(
      "href",
      "#themes",
    );
    expect(within(menu).getByRole("link", { name: "Countdown" })).toHaveAttribute(
      "href",
      "#countdown",
    );
  });

  it("repeats Community Support for phones only", async () => {
    addSections(ALL);
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByRole("button", { name: "More" }));
    const menu = document.getElementById("dock-more-menu")!;
    expect(
      within(menu).getByRole("link", { name: "Community Support" }).closest("li"),
    ).toHaveClass("dk-phone-only");
    expect(
      within(menu).getByRole("link", { name: "Schedule" }).closest("li"),
    ).not.toHaveClass("dk-phone-only");
  });

  it("shows Schedule disabled until its section exists", async () => {
    addSections(["home", "themes", "countdown"]);
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByRole("button", { name: "More" }));
    const menu = document.getElementById("dock-more-menu")!;
    expect(within(menu).getByRole("button", { name: /Schedule/ })).toBeDisabled();
    expect(within(menu).getByRole("link", { name: "Countdown" })).toBeInTheDocument();
  });

  it("marks the menu item for the section in view", async () => {
    addSections(ALL);
    const user = userEvent.setup();
    setup();
    see("schedule");
    await user.click(screen.getByRole("button", { name: "More" }));
    expect(screen.getByRole("link", { name: "Schedule" })).toHaveAttribute(
      "aria-current",
      "true",
    );
  });

  it("closes on Escape and returns focus to the More button", async () => {
    addSections(ALL);
    const user = userEvent.setup();
    setup();
    const more = screen.getByRole("button", { name: "More" });
    await user.click(more);
    await user.keyboard("{Escape}");
    expect(more).toHaveAttribute("aria-expanded", "false");
    expect(more).toHaveFocus();
  });

  it("closes on an outside click", async () => {
    addSections(ALL);
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByRole("button", { name: "More" }));
    await user.click(document.body);
    expect(screen.getByRole("button", { name: "More" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("closes after choosing an item", async () => {
    addSections(ALL);
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByRole("button", { name: "More" }));
    await user.click(screen.getByRole("link", { name: "Countdown" }));
    expect(screen.queryByRole("link", { name: "Countdown" })).not.toBeInTheDocument();
  });

  it("toggles closed when More is clicked again", async () => {
    addSections(ALL);
    const user = userEvent.setup();
    setup();
    const more = screen.getByRole("button", { name: "More" });
    await user.click(more);
    await user.click(more);
    expect(more).toHaveAttribute("aria-expanded", "false");
  });
});

describe("Dock label bubble", () => {
  it("shows the label on hover and hides it when the pointer leaves", async () => {
    addSections(ALL);
    const user = userEvent.setup();
    setup();
    expect(bubble()).not.toHaveClass("on");
    await user.hover(screen.getByRole("link", { name: "About" }));
    expect(bubble()).toHaveClass("on");
    expect(bubble()).toHaveTextContent("About");
    await user.unhover(screen.getByRole("link", { name: "About" }));
    expect(bubble()).not.toHaveClass("on");
  });

  it("marks a separate page with an arrow", async () => {
    addSections(ALL);
    const user = userEvent.setup();
    setup();
    await user.hover(screen.getByRole("link", { name: "Final Registration" }));
    expect(bubble()).toHaveTextContent("Final Registration ↗");
  });

  it("labels the theme switch with the mode it switches to", async () => {
    const user = userEvent.setup();
    setup();
    await user.hover(screen.getByRole("button", { name: "Switch to light mode" }));
    expect(bubble()).toHaveTextContent("Light");
  });

  it("shows the label on keyboard focus but not on mouse focus", () => {
    addSections(ALL);
    setup();
    const about = screen.getByRole("link", { name: "About" });
    const matches = vi.spyOn(Element.prototype, "matches");

    matches.mockReturnValue(false);
    fireEvent.focus(about);
    expect(bubble()).not.toHaveClass("on");

    matches.mockReturnValue(true);
    fireEvent.focus(about);
    expect(bubble()).toHaveClass("on");
    expect(bubble()).toHaveTextContent("About");

    fireEvent.blur(about);
    expect(bubble()).not.toHaveClass("on");
  });
});

describe("Dock load preview", () => {
  const original = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetParent");

  beforeEach(() => {
    // jsdom has no layout. Treat every item as visible.
    Object.defineProperty(HTMLElement.prototype, "offsetParent", {
      configurable: true,
      get: () => document.body,
    });
    vi.useFakeTimers();
  });
  afterEach(() => {
    if (original) Object.defineProperty(HTMLElement.prototype, "offsetParent", original);
  });

  const advance = (ms: number) => act(() => void vi.advanceTimersByTime(ms));

  it("hops the label across the icons after the dock first shows, then stops", () => {
    addSections(ALL);
    setup();
    heroRatio(0.1);

    advance(650 + 399);
    expect(bubble()).not.toHaveClass("on");
    advance(1);
    expect(bubble()).toHaveClass("on");
    expect(bubble()).toHaveTextContent("Home");

    advance(560);
    expect(bubble()).toHaveTextContent("About");
    advance(560);
    expect(bubble()).toHaveTextContent("Prizes");
    advance(560);
    expect(bubble()).toHaveTextContent("Community Support");
    advance(560);
    expect(bubble()).toHaveTextContent("Final Registration ↗");
    advance(560);
    expect(bubble()).toHaveTextContent("Light");

    advance(1000);
    expect(bubble()).not.toHaveClass("on");
  });

  it("does not run again when the dock shows a second time", () => {
    addSections(ALL);
    setup();
    heroRatio(0.1);
    advance(6000);
    heroRatio(0.9);
    heroRatio(0.1);
    advance(6000);
    expect(bubble()).not.toHaveClass("on");
  });

  it("stops when the visitor hovers an icon", () => {
    addSections(ALL);
    setup();
    heroRatio(0.1);
    advance(1100);
    fireEvent.mouseEnter(screen.getByRole("link", { name: "Prizes" }));
    expect(bubble()).toHaveTextContent("Prizes");
    advance(3000);
    expect(bubble()).toHaveTextContent("Prizes");
  });

  it("stops when the hero comes back", () => {
    addSections(ALL);
    setup();
    heroRatio(0.1);
    advance(1100);
    expect(bubble()).toHaveClass("on");
    heroRatio(0.9);
    expect(bubble()).not.toHaveClass("on");
    advance(6000);
    expect(bubble()).not.toHaveClass("on");
  });
});

describe("Dock theme switch", () => {
  it("switches theme from the dock", async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByRole("button", { name: "Switch to light mode" }));
    expect(document.documentElement).toHaveAttribute("data-theme", "light");
    expect(
      screen.getByRole("button", { name: "Switch to dark mode" }),
    ).toBeInTheDocument();
  });

  it("has both sun and moon icons, shown by CSS", () => {
    setup();
    const button = screen.getByRole("button", { name: /Switch to/ });
    expect(button.querySelector("svg.sun")).not.toBeNull();
    expect(button.querySelector("svg.moon")).not.toBeNull();
  });
});
