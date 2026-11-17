"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { siteConfig } from "@/lib/config";
import { countdownTo, pad2, type CountdownValues } from "@/lib/countdown";

const TARGET = new Date(siteConfig.dates.eventStart);

const DIAL_R = 40;
const DIAL_C = 2 * Math.PI * DIAL_R;

interface DialProps {
  id: string;
  label: string;
  accent: "cyan" | "pink";
  valueRef: React.RefObject<HTMLSpanElement | null>;
  circleRef: React.RefObject<SVGCircleElement | null>;
}

/** Ring-gauge countdown dial. Progress is driven by refs to avoid re-renders per second. */
function Dial({ id, label, accent, valueRef, circleRef }: DialProps) {
  const stroke = accent === "cyan" ? "var(--cyan)" : "var(--pink)";
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative aspect-square w-full max-w-[74px] sm:h-[100px] sm:w-[100px] sm:max-w-none md:h-[112px] md:w-[112px]">
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 h-full w-full -rotate-90"
          aria-hidden="true"
        >
          <circle
            cx="50"
            cy="50"
            r={DIAL_R}
            fill="none"
            stroke="var(--line)"
            strokeWidth="3"
            opacity="0.6"
          />
          <circle
            ref={circleRef}
            cx="50"
            cy="50"
            r={DIAL_R}
            fill="none"
            stroke={stroke}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={DIAL_C}
            strokeDashoffset={DIAL_C}
            className="transition-[stroke-dashoffset] duration-700 ease-out"
          />
        </svg>
        <span
          id={id}
          ref={valueRef}
          className="absolute inset-0 flex items-center justify-center font-mono text-lg font-bold leading-none tabular-nums text-white sm:text-2xl md:text-3xl"
        >
          --
        </span>
      </div>
      <span className="font-mono text-[9px] font-medium uppercase tracking-[0.18em] text-muted sm:text-xs sm:tracking-[0.25em]">
        {label}
      </span>
    </div>
  );
}

export function Countdown() {
  const [begun, setBegun] = useState(false);

  const dVal = useRef<HTMLSpanElement>(null);
  const hVal = useRef<HTMLSpanElement>(null);
  const mVal = useRef<HTMLSpanElement>(null);
  const sVal = useRef<HTMLSpanElement>(null);

  const dCircle = useRef<SVGCircleElement>(null);
  const hCircle = useRef<SVGCircleElement>(null);
  const mCircle = useRef<SVGCircleElement>(null);
  const sCircle = useRef<SVGCircleElement>(null);

  const setDial = useCallback(
    (
      valRef: React.RefObject<HTMLSpanElement | null>,
      circleRef: React.RefObject<SVGCircleElement | null>,
      value: number,
      max: number,
      doPad: boolean,
    ) => {
      if (valRef.current)
        valRef.current.textContent = doPad ? pad2(value) : String(value);
      if (circleRef.current) {
        const frac = Math.min(value / max, 1);
        circleRef.current.style.strokeDashoffset = String(DIAL_C * (1 - frac));
      }
    },
    [],
  );

  useEffect(() => {
    function tick(): boolean {
      const cd: CountdownValues = countdownTo(TARGET);
      if (cd.remaining <= 0) {
        setBegun(true);
        return true;
      }
      setDial(dVal, dCircle, cd.days, 30, false);
      setDial(hVal, hCircle, cd.hours, 24, true);
      setDial(mVal, mCircle, cd.minutes, 60, true);
      setDial(sVal, sCircle, cd.seconds, 60, true);
      return false;
    }

    if (tick()) return;
    const id = setInterval(() => {
      if (tick()) clearInterval(id);
    }, 1_000);
    return () => clearInterval(id);
  }, [setDial]);

  if (begun) {
    return (
      <div id="countdown" className="text-center" data-testid="countdown-begun">
        <p id="cd-note" className="font-display text-xl font-bold text-white sm:text-2xl">
          {siteConfig.name} has begun!
        </p>
      </div>
    );
  }

  return (
    <div id="countdown" data-testid="countdown" aria-live="off">
      <div className="mx-auto grid max-w-md grid-cols-4 gap-2 sm:flex sm:max-w-none sm:items-center sm:justify-center sm:gap-5 md:gap-7">
        <Dial id="cd-d" label="days" accent="cyan" valueRef={dVal} circleRef={dCircle} />
        <Dial id="cd-h" label="hours" accent="cyan" valueRef={hVal} circleRef={hCircle} />
        <Dial
          id="cd-m"
          label="minutes"
          accent="pink"
          valueRef={mVal}
          circleRef={mCircle}
        />
        <Dial
          id="cd-s"
          label="seconds"
          accent="pink"
          valueRef={sVal}
          circleRef={sCircle}
        />
      </div>
      <p id="cd-note" className="mt-4 text-center text-sm tracking-wide text-muted">
        Until the hackathon starts
      </p>
    </div>
  );
}
