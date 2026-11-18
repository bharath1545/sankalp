"use client";

import { useEffect, useRef, useState } from "react";
import { siteConfig } from "@/lib/config";
import { countdownTo, pad2 } from "@/lib/countdown";

const TARGET = new Date(siteConfig.dates.eventStart);

/** Circumference of r=44, the ring radius in the 100x100 viewBox. */
const RING_C = 2 * Math.PI * 44;

type Unit = "d" | "h" | "m" | "s";

const units: { key: Unit; label: string; max: number }[] = [
  { key: "d", label: "Days", max: 30 },
  { key: "h", label: "Hours", max: 24 },
  { key: "m", label: "Minutes", max: 60 },
  { key: "s", label: "Seconds", max: 60 },
];

/**
 * Ring-gauge countdown inside the launch panel. The numbers and rings are
 * updated through refs once a second, so React does not re-render on every tick.
 */
export function Countdown() {
  const [begun, setBegun] = useState(false);
  const values = useRef<Partial<Record<Unit, HTMLSpanElement | null>>>({});
  const arcs = useRef<Partial<Record<Unit, SVGCircleElement | null>>>({});

  useEffect(() => {
    function show(key: Unit, value: number, max: number) {
      const text = key === "d" ? String(value) : pad2(value);
      const el = values.current[key];
      if (el && el.textContent !== text) el.textContent = text;
      const arc = arcs.current[key];
      if (arc)
        arc.style.strokeDashoffset = String(RING_C * (1 - Math.min(value / max, 1)));
    }

    function tick(): boolean {
      const cd = countdownTo(TARGET);
      if (cd.remaining <= 0) {
        setBegun(true);
        return true;
      }
      show("d", cd.days, 30);
      show("h", cd.hours, 24);
      show("m", cd.minutes, 60);
      show("s", cd.seconds, 60);
      return false;
    }

    if (tick()) return;
    const id = setInterval(() => {
      if (tick()) clearInterval(id);
    }, 1_000);
    return () => clearInterval(id);
  }, []);

  if (begun) {
    return (
      <div id="countdown" className="lp-begun" data-testid="countdown-begun">
        <p id="cd-note">{siteConfig.name} has begun!</p>
      </div>
    );
  }

  return (
    <div id="countdown" data-testid="countdown">
      <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="lp-rg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--lp-a)" />
            <stop offset="1" stopColor="var(--lp-b)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="lp-rings" role="timer" aria-label="Time until the hackathon starts">
        {units.map((u) => (
          <div key={u.key} className="lp-ring">
            <svg viewBox="0 0 100 100" aria-hidden="true">
              <circle className="tr" cx="50" cy="50" r="44" />
              <circle
                className="pg"
                cx="50"
                cy="50"
                r="44"
                strokeDasharray={RING_C}
                strokeDashoffset={RING_C}
                ref={(el) => {
                  arcs.current[u.key] = el;
                }}
              />
            </svg>
            <div className="num">
              <span
                id={`cd-${u.key}`}
                ref={(el) => {
                  values.current[u.key] = el;
                }}
              >
                --
              </span>
              <small>{u.label}</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
