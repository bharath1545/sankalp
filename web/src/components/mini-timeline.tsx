"use client";

import { useEffect, useRef, useState } from "react";
import { dateText, formatInr, siteConfig } from "@/lib/config";
import { milestoneTime, timelineState } from "@/lib/timeline";

interface Milestone {
  date: string;
  at: string;
  title: string;
  note: string;
}

const { dates } = siteConfig;

const milestones: Milestone[] = [
  {
    date: dateText.submission,
    at: dates.submission,
    title: "Idea submission closes",
    note: "Submit one-page abstract using the registration form",
  },
  {
    date: dateText.acceptance,
    at: dates.acceptance,
    title: "Acceptance notifications",
    note: "Shortlisted teams informed",
  },
  {
    date: dateText.registration,
    at: dates.registration,
    title: "Last date of team registration",
    note: `${formatInr(siteConfig.feePerTeamInr)} per team`,
  },
  {
    date: dateText.event,
    at: dates.eventStart,
    title: siteConfig.name,
    note: `24-hour hackathon at ${siteConfig.venue.name}`,
  },
];

const times = milestones.map((m) => milestoneTime(m.at));

/**
 * Key dates drawn as a circuit board. Milestones that have passed are lit and
 * current runs along the trace up to the next one. State is set after mount so
 * the server and first client render match.
 */
export function MiniTimeline() {
  const rootRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLElement | null)[]>([]);
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  const ready = now !== null;
  const state = ready ? timelineState(times, now) : null;
  const litTo = state?.litTo ?? 0;
  const lastPassed = state ? (state.next === -1 ? times.length - 1 : state.next - 1) : -1;

  // Length of the lit trace = distance from the top of the board to the target node.
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !ready) return;
    const measure = () => {
      const node = nodeRefs.current[litTo];
      if (!node) return;
      const n = node.getBoundingClientRect();
      const h = n.top + n.height / 2 - root.getBoundingClientRect().top;
      root.style.setProperty("--lit", `${Math.max(h, 0)}px`);
    };
    measure();
    window.addEventListener("resize", measure);
    void document.fonts?.ready.then(measure);
    return () => window.removeEventListener("resize", measure);
  }, [ready, litTo]);

  return (
    <div
      ref={rootRef}
      className="lp-tl"
      aria-label="Event milestones"
      data-testid="mini-timeline"
    >
      <div className="lp-trace" aria-hidden="true">
        <div className="lp-lit" />
      </div>
      <ol>
        {milestones.map((m, i) => {
          const passed = state?.passed[i] ?? false;
          const isNext = state?.next === i;
          const done = passed && i < lastPassed;
          return (
            <li
              key={m.title}
              className="lp-step"
              data-passed={passed}
              data-next={isNext}
              data-done={done}
            >
              <div className="lp-node">
                <i
                  ref={(el) => {
                    nodeRefs.current[i] = el;
                  }}
                />
              </div>
              <div className="lp-card">
                <p className="lp-date">{m.date}</p>
                <h3>{m.title}</h3>
                <p className="lp-note">{m.note}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
