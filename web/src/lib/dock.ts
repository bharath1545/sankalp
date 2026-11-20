/**
 * Navigation dock content. Spec order: Home, About, Prizes, Community Support,
 * More (Themes / Tracks, Schedule, Countdown), Final Registration, theme switch.
 */

/** Lucide stroke icons, 24x24 viewBox. Static markup, no user input. */
export const dockIcons = {
  home: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"></path><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>',
  info: '<circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path>',
  trophy:
    '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>',
  users:
    '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>',
  ellipsis:
    '<circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle>',
  rocket:
    '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path>',
  sun: '<circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path>',
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>',
  layers:
    '<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"></path><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"></path><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"></path>',
  "calendar-days":
    '<path d="M8 2v4"></path><path d="M16 2v4"></path><rect width="18" height="18" x="3" y="4" rx="2"></rect><path d="M3 10h18"></path><path d="M8 14h.01"></path><path d="M12 14h.01"></path><path d="M16 14h.01"></path><path d="M8 18h.01"></path><path d="M12 18h.01"></path><path d="M16 18h.01"></path>',
  clock:
    '<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>',
} as const;

export type DockIcon = keyof typeof dockIcons;

export interface DockLink {
  id: string;
  label: string;
  /** Id of the section on the home page this link scrolls to. */
  target: string;
  icon: DockIcon;
}

export const dockLinks: DockLink[] = [
  { id: "home", label: "Home", target: "home", icon: "home" },
  { id: "about", label: "About", target: "about", icon: "info" },
  { id: "prizes", label: "Prizes", target: "prizes", icon: "trophy" },
  { id: "community", label: "Community Support", target: "community", icon: "users" },
];

/** On phones these leave the dock and appear in the More menu instead. */
export const foldedOnPhone = new Set(["community"]);

export const moreLinks: DockLink[] = [
  { id: "themes", label: "Themes / Tracks", target: "themes", icon: "layers" },
  { id: "schedule", label: "Schedule", target: "schedule", icon: "calendar-days" },
  { id: "countdown", label: "Countdown", target: "countdown", icon: "clock" },
];

export const FINAL_REGISTRATION_HREF = "/final-registration";

/**
 * Home-page sections the dock watches, in page order. Registration and FAQ are
 * listed so the dock clears its highlight there instead of staying on Prizes.
 */
export const trackedSections = [
  "home",
  "about",
  "themes",
  "prizes",
  "registration",
  "faq",
  "community",
  "schedule",
] as const;

/** Which dock item a section lights up. `more` covers sections listed in the More menu. */
export function dockOwner(sectionId: string | null): string | null {
  if (!sectionId) return null;
  if (sectionId === "themes" || sectionId === "schedule" || sectionId === "countdown")
    return "more";
  return dockLinks.some((l) => l.id === sectionId) ? sectionId : null;
}

/** `#about` on the home page, `/#about` from any other page. */
export function sectionHref(target: string, pathname: string | null): string {
  return !pathname || pathname === "/" ? `#${target}` : `/#${target}`;
}
