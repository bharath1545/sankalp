import { describe, expect, it } from "vitest";
import {
  dockIcons,
  dockLinks,
  dockOwner,
  foldedOnPhone,
  moreLinks,
  sectionHref,
  trackedSections,
} from "./dock";

describe("dock content", () => {
  it("lists the spec items in order", () => {
    expect(dockLinks.map((l) => l.label)).toEqual([
      "Home",
      "About",
      "Prizes",
      "Community Support",
    ]);
    expect(moreLinks.map((l) => l.label)).toEqual([
      "Themes / Tracks",
      "Schedule",
      "Countdown",
    ]);
  });

  it("gives every link a unique id", () => {
    const ids = [...dockLinks, ...moreLinks].map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("moves only Community Support into the More menu on phones", () => {
    expect([...foldedOnPhone]).toEqual(["community"]);
  });

  it("has an icon for every link", () => {
    [...dockLinks, ...moreLinks].forEach((l) => expect(dockIcons[l.icon]).toBeTruthy());
    ["ellipsis", "rocket", "sun", "moon"].forEach((name) =>
      expect(dockIcons[name as keyof typeof dockIcons]).toBeTruthy(),
    );
  });

  it("tracks home-page sections in page order", () => {
    expect(trackedSections).toEqual([
      "home",
      "about",
      "themes",
      "prizes",
      "registration",
      "faq",
      "community",
      "schedule",
    ]);
  });
});

describe("dockOwner", () => {
  it.each([
    ["home", "home"],
    ["about", "about"],
    ["prizes", "prizes"],
    ["community", "community"],
    ["themes", "more"],
    ["schedule", "more"],
    ["countdown", "more"],
    ["registration", null],
    ["faq", null],
    [null, null],
  ])("%s lights %s", (section, owner) => {
    expect(dockOwner(section)).toBe(owner);
  });
});

describe("sectionHref", () => {
  it("uses a bare hash on the home page", () => {
    expect(sectionHref("about", "/")).toBe("#about");
    expect(sectionHref("about", null)).toBe("#about");
  });
  it("goes through the home page from other pages", () => {
    expect(sectionHref("about", "/final-registration")).toBe("/#about");
  });
});
