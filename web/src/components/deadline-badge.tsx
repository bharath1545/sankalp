"use client";

import { useEffect, useState } from "react";
import { dateText, siteConfig } from "@/lib/config";
import { milestoneTime } from "@/lib/timeline";

const DAY_MS = 86_400_000;
/** The submission day counts as open until it ends (IST). */
const closesAt = milestoneTime(siteConfig.dates.submission) + DAY_MS;

/**
 * Shows whether abstract submission is open. Before mount it shows a neutral
 * "Deadline" so the server and first client render match.
 */
export function DeadlineBadge() {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
  }, []);

  const closed = now !== null && now >= closesAt;
  const label = now === null ? "Deadline" : closed ? "Closed on" : "Open until";

  return (
    <p
      data-testid="deadline"
      data-state={now === null ? "unknown" : closed ? "closed" : "open"}
      className="inline-flex items-center gap-2 rounded-full border border-line-strong/50 px-4 py-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-muted"
    >
      <span
        aria-hidden="true"
        className={`size-2 rounded-full ${closed ? "bg-danger" : "bg-ok"}`}
      />
      {label} {dateText.submission}
    </p>
  );
}
