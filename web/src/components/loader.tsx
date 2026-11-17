"use client";

import { useEffect, useRef, useState } from "react";
import { siteConfig } from "@/lib/config";
import {
  LOADER_DONE_DELAY_MS,
  LOADER_FADE_MS,
  LOADER_MIN_MS,
  LOADER_REDUCED_MIN_MS,
  nextProgress,
} from "@/lib/loader-timing";

/** Set in sessionStorage once the loader has been shown. D16: once per session. */
export const LOADER_SESSION_KEY = "sankalp-loader-seen";

/**
 * Runs in <head> before the first paint, so the overlay is up before the page
 * shows and no JavaScript user ever sees it. The timeout is a failsafe: if the
 * app bundle never arrives, the page is unlocked instead of staying black.
 */
export const LOADER_BOOT_SCRIPT = `(function(){try{if(!sessionStorage.getItem("${LOADER_SESSION_KEY}")){sessionStorage.setItem("${LOADER_SESSION_KEY}","1");document.documentElement.classList.add("is-loading");setTimeout(function(){document.documentElement.classList.remove("is-loading")},8000)}}catch(e){}})();`;

/** "Sankalp’26" -> ["Sankalp", "’26"], so the edition can take the gradient. */
function splitWordmark(name: string): [string, string] {
  const at = Math.max(name.lastIndexOf("’"), name.lastIndexOf("'"));
  return at > 0 ? [name.slice(0, at), name.slice(at)] : [name, ""];
}

const [lead, tail] = splitWordmark(siteConfig.name);

/**
 * Full-screen loading screen. Hidden by CSS unless the boot script added
 * `is-loading` to <html>, so this renders on the server without flashing.
 */
export function Loader() {
  const [visible, setVisible] = useState(true);
  const overlay = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const fill = useRef<HTMLDivElement>(null);
  const percent = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = document.documentElement;

    // Repeat visit, or the boot script did not run: nothing to show.
    if (!root.classList.contains("is-loading")) {
      setVisible(false);
      return;
    }

    const el = overlay.current;
    const barEl = bar.current;
    const fillEl = fill.current;
    const pctEl = percent.current;
    if (!el || !barEl || !fillEl || !pctEl) {
      root.classList.remove("is-loading");
      setVisible(false);
      return;
    }

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const minMs = reduce ? LOADER_REDUCED_MIN_MS : LOADER_MIN_MS;
    const started = performance.now();

    let pageLoaded = document.readyState === "complete";
    let fontsReady = !(document.fonts && document.fonts.ready);
    let shown = 0;
    let raf = 0;
    let doneTimer = 0;
    let removeTimer = 0;
    let stopped = false;

    const onLoad = () => {
      pageLoaded = true;
    };

    window.addEventListener("load", onLoad);
    if (document.fonts && document.fonts.ready) {
      // A font that never loads must not hold the loader open.
      document.fonts.ready.then(
        () => {
          fontsReady = true;
        },
        () => {
          fontsReady = true;
        },
      );
    }

    const paint = (value: number) => {
      const rounded = Math.round(value);
      fillEl.style.width = `${value}%`;
      pctEl.textContent = `${rounded}%`;
      barEl.setAttribute("aria-valuenow", String(rounded));
    };

    const finish = () => {
      if (stopped) return;
      stopped = true;
      el.classList.add("out");
      root.classList.remove("is-loading");
      window.removeEventListener("load", onLoad);

      // The page could not scroll to a #hash while it was locked.
      if (window.location.hash.length > 1) {
        try {
          document.querySelector(window.location.hash)?.scrollIntoView();
        } catch {
          // Bad hash (for example "#/"): leave the page where it is.
        }
      }

      removeTimer = window.setTimeout(
        () => setVisible(false),
        reduce ? 0 : LOADER_FADE_MS,
      );
    };

    const frame = (now: number) => {
      if (stopped) return;
      shown = nextProgress({
        elapsed: now - started,
        minMs,
        loaded: pageLoaded && fontsReady,
        shown,
        reducedMotion: reduce,
      });
      paint(shown);
      if (shown >= 100) {
        doneTimer = window.setTimeout(finish, reduce ? 0 : LOADER_DONE_DELAY_MS);
        return;
      }
      raf = requestAnimationFrame(frame);
    };

    paint(0);
    raf = requestAnimationFrame(frame);

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(doneTimer);
      window.clearTimeout(removeTimer);
      window.removeEventListener("load", onLoad);
    };
  }, []);

  if (!visible) return null;

  return (
    <div id="loader" ref={overlay}>
      <div className="ld-bloom" />
      <div className="ld-in">
        <div className="ld-wm" data-text={siteConfig.name}>
          {lead}
          <em>{tail}</em>
          <svg
            className="ld-arcs"
            viewBox="0 0 100 40"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path className="ld-a1" d="M2 8 L9 14 L6 19 L14 25 L10 32" />
            <path className="ld-a2" d="M97 6 L91 13 L95 18 L87 24 L92 33" />
            <path className="ld-a3" d="M44 3 L48 9 L45 13 L52 18" />
          </svg>
        </div>
        <div
          className="ld-track"
          ref={bar}
          role="progressbar"
          aria-label="Loading"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={0}
        >
          <div className="ld-fill" ref={fill} />
        </div>
        <div className="ld-row">
          <span>Loading</span>
          <b ref={percent}>0%</b>
        </div>
      </div>
    </div>
  );
}
