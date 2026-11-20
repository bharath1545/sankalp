"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  dockIcons,
  dockLinks,
  dockOwner,
  FINAL_REGISTRATION_HREF,
  foldedOnPhone,
  moreLinks,
  sectionHref,
  trackedSections,
  type DockIcon,
  type DockLink,
} from "@/lib/dock";

const subscribe = () => () => {};

function Icon({ name, className }: { name: DockIcon; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      dangerouslySetInnerHTML={{ __html: dockIcons[name] }}
    />
  );
}

/**
 * Floating navigation dock. Icon-only pill. It is hidden over the hero and slides in
 * once you scroll past it, then a label bubble hops across the icons for about 4 s.
 * Hover or keyboard focus shows the label of one icon.
 *
 * Items whose section is not on the home page yet are shown disabled, and turn on by
 * themselves once the section exists.
 */
export function Dock() {
  const pathname = usePathname();
  const onHome = !pathname || pathname === "/";
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const isLight = mounted && resolvedTheme === "light";

  const [show, setShow] = useState(false);
  // null until mounted, so the server and first client render match.
  const [present, setPresent] = useState<ReadonlySet<string> | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const [bubble, setBubble] = useState({ text: "", left: 0, on: false });

  const dockRef = useRef<HTMLElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);
  const moreButton = useRef<HTMLButtonElement>(null);
  const timers = useRef(new Set<number>());
  const running = useRef(false);
  const previewed = useRef(false);

  // ---- label bubble -------------------------------------------------------
  function showBubble(el: HTMLElement) {
    const dock = dockRef.current;
    if (!dock) return;
    const d = dock.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    setBubble({
      text: (el.dataset.n ?? "") + (el.hasAttribute("data-page") ? " ↗" : ""),
      left: r.left - d.left + r.width / 2,
      on: true,
    });
  }
  const hideBubble = () => setBubble((b) => ({ ...b, on: false }));

  function stopPreview() {
    timers.current.forEach(clearTimeout);
    timers.current.clear();
    if (running.current) {
      running.current = false;
      hideBubble();
    }
  }

  /** The bubble hops across the visible icons for about 4 seconds, then stops. */
  function preview() {
    stopPreview();
    const dock = dockRef.current;
    if (!dock) return;
    const list = [...dock.querySelectorAll<HTMLElement>(".dk-it[data-n]")].filter(
      (el) =>
        el.offsetParent !== null &&
        !el.classList.contains("dk-more") &&
        !el.classList.contains("dk-theme"),
    );
    const theme = dock.querySelector<HTMLElement>(".dk-theme");
    if (theme) list.push(theme);
    if (list.length === 0) return;
    running.current = true;
    const step = Math.min(560, 4000 / list.length);
    list.forEach((el, i) => {
      timers.current.add(window.setTimeout(() => showBubble(el), 400 + i * step));
    });
    timers.current.add(
      window.setTimeout(
        () => {
          running.current = false;
          hideBubble();
        },
        400 + list.length * step + 200,
      ),
    );
  }

  const itemEvents = {
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
      stopPreview();
      showBubble(e.currentTarget);
    },
    onMouseLeave: hideBubble,
    onFocus: (e: React.FocusEvent<HTMLElement>) => {
      let visible = true;
      try {
        visible = e.currentTarget.matches(":focus-visible");
      } catch {
        // :focus-visible not supported: show the label anyway.
      }
      if (visible) {
        stopPreview();
        showBubble(e.currentTarget);
      }
    },
    onBlur: hideBubble,
  };

  // ---- hidden on the hero, slides in after it ------------------------------
  useEffect(() => {
    const hero = onHome ? document.getElementById("home") : null;
    if (!hero || typeof IntersectionObserver === "undefined") {
      setShow(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        const inHero = entries[0].intersectionRatio > 0.55;
        setShow(!inHero);
        if (inHero) {
          setMoreOpen(false);
          stopPreview();
        }
      },
      { threshold: [0, 0.25, 0.55, 0.8] },
    );
    observer.observe(hero);
    return () => observer.disconnect();
    // stopPreview only touches refs and a state setter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onHome, pathname]);

  // First time the dock shows, run the preview once.
  useEffect(() => {
    if (!show || previewed.current) return;
    previewed.current = true;
    const id = window.setTimeout(preview, 650);
    return () => window.clearTimeout(id);
    // preview only touches refs and state setters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  // ---- active section -------------------------------------------------------
  useEffect(() => {
    const ids = [...dockLinks, ...moreLinks].map((l) => l.target);
    setPresent(new Set(ids.filter((id) => document.getElementById(id))));

    if (!onHome || typeof IntersectionObserver === "undefined") return;
    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        setActive(trackedSections.find((id) => visible.has(id)) ?? null);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    trackedSections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [onHome, pathname]);

  // ---- More menu: Escape and outside click ---------------------------------
  useEffect(() => {
    if (!moreOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMoreOpen(false);
        moreButton.current?.focus();
      }
    };
    const onPointer = (e: PointerEvent) => {
      if (!moreRef.current?.contains(e.target as Node)) setMoreOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [moreOpen]);

  const owner = onHome ? dockOwner(active) : null;
  // A missing section only matters on the home page. Elsewhere links go home first.
  const missing = (target: string) => onHome && present !== null && !present.has(target);

  function dockItem(link: DockLink) {
    const folded = foldedOnPhone.has(link.id) ? " dk-opt" : "";
    if (missing(link.target)) {
      return (
        <button
          key={link.id}
          type="button"
          disabled
          data-n={link.label}
          aria-label={`${link.label} (coming soon)`}
          className={`dk-it${folded}`}
          {...itemEvents}
        >
          <Icon name={link.icon} />
        </button>
      );
    }
    return (
      <a
        key={link.id}
        href={sectionHref(link.target, pathname)}
        data-n={link.label}
        aria-label={link.label}
        aria-current={owner === link.id ? "true" : undefined}
        className={`dk-it${folded}`}
        {...itemEvents}
      >
        <Icon name={link.icon} />
      </a>
    );
  }

  function sheetItem(link: DockLink) {
    const phoneOnly = foldedOnPhone.has(link.id) ? "dk-phone-only" : undefined;
    if (missing(link.target)) {
      return (
        <li key={link.id} className={phoneOnly}>
          <button type="button" disabled>
            <Icon name={link.icon} />
            {link.label}
            <span className="sr-only"> (coming soon)</span>
          </button>
        </li>
      );
    }
    return (
      <li key={link.id} className={phoneOnly}>
        <a
          href={sectionHref(link.target, pathname)}
          aria-current={onHome && active === link.target ? "true" : undefined}
          onClick={() => setMoreOpen(false)}
        >
          <Icon name={link.icon} />
          {link.label}
        </a>
      </li>
    );
  }

  const foldedActive = owner !== null && foldedOnPhone.has(owner);
  const next = isLight ? "dark" : "light";

  return (
    <div className={`dk-wrap${show ? " show" : ""}`} data-testid="dock-wrap">
      <nav ref={dockRef} className="dk" aria-label="Primary" data-testid="dock">
        <div
          className={`dk-bubble${bubble.on ? " on" : ""}`}
          role="status"
          style={{ left: bubble.left }}
        >
          {bubble.text}
        </div>

        {dockLinks.map(dockItem)}

        <div ref={moreRef} style={{ display: "contents" }}>
          <button
            ref={moreButton}
            type="button"
            className="dk-it dk-more"
            data-n="More"
            aria-label="More"
            aria-expanded={moreOpen}
            aria-controls="dock-more-menu"
            data-active={owner === "more"}
            data-active-phone={foldedActive}
            onClick={() => {
              stopPreview();
              setMoreOpen((o) => !o);
            }}
            {...itemEvents}
          >
            <Icon name="ellipsis" />
          </button>
          {moreOpen && (
            <ul id="dock-more-menu" className="dk-sheet">
              {[...moreLinks, ...dockLinks.filter((l) => foldedOnPhone.has(l.id))].map(
                sheetItem,
              )}
            </ul>
          )}
        </div>

        <Link
          href={FINAL_REGISTRATION_HREF}
          className="dk-it cta"
          data-n="Final Registration"
          data-page
          aria-label="Final Registration"
          {...itemEvents}
        >
          <Icon name="rocket" />
        </Link>

        <span className="dk-sep" aria-hidden="true" />

        <button
          type="button"
          className="dk-it dk-theme"
          data-n={isLight ? "Dark" : "Light"}
          aria-label={`Switch to ${next} mode`}
          onClick={() => {
            stopPreview();
            setTheme(next);
          }}
          {...itemEvents}
        >
          <Icon name="sun" className="sun" />
          <Icon name="moon" className="moon" />
        </button>
      </nav>
    </div>
  );
}
