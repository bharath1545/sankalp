"use client";

import { useEffect, useState } from "react";
import { dateText } from "@/lib/config";

export const ROUND1_PANEL_ID = "round-1-result";

/** Optional list of shortlisted teams. Wired to real data in the backend task. */
export interface Round1Result {
  teamName: string;
  college?: string;
}

/**
 * "Round 1 Result" button and its panel. With no data it says so plainly.
 * It never shows invented results.
 */
export function Round1ResultBlock({ results }: { results?: Round1Result[] }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const sync = () => {
      if (window.location.hash === `#${ROUND1_PANEL_ID}`) setOpen(true);
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  const hasResults = !!results && results.length > 0;

  return (
    <div data-testid="round1-result">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={ROUND1_PANEL_ID}
        onClick={() => setOpen((o) => !o)}
        className="hero-cta-primary inline-flex h-12 items-center rounded-md px-6 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan sm:text-base"
      >
        Round 1 Result
      </button>

      <div
        id={ROUND1_PANEL_ID}
        role="region"
        aria-label="Round 1 result"
        hidden={!open}
        className="mt-4 scroll-mt-24 rounded-lg border border-line-strong/40 bg-deep p-5 sm:p-6"
      >
        {hasResults ? (
          <>
            <p className="text-sm text-muted">
              Shortlisted teams for Final Registration.
            </p>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {results.map((r) => (
                <li
                  key={r.teamName}
                  className="rounded-md border border-line-strong/40 px-3 py-2 text-sm"
                >
                  <span className="font-semibold">{r.teamName}</span>
                  {r.college ? <span className="text-muted"> · {r.college}</span> : null}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="text-sm leading-relaxed text-muted sm:text-base">
            Round 1 results are not published here yet. Shortlisted teams are informed by
            email on {dateText.acceptance}.
          </p>
        )}
      </div>
    </div>
  );
}
