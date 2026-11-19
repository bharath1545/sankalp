"use client";

import { useEffect, useState } from "react";
import { isAbstractClosed } from "@/lib/abstract-rules";

const message = "Abstract registration closed";

/**
 * Wraps the abstract form. Once the submission deadline has passed, the form is
 * blurred, made inert, and covered by a moving police-tape banner.
 * Before mount nothing is covered, so the server and first client render match.
 */
export function AbstractFormGate({ children }: { children: React.ReactNode }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
  }, []);

  const closed = now !== null && isAbstractClosed(now);

  return (
    <div
      className="af-gate"
      data-testid="abstract-gate"
      data-state={closed ? "closed" : "open"}
    >
      <div className="af-gate-body" inert={closed} aria-hidden={closed || undefined}>
        {children}
      </div>
      {closed && (
        <div className="af-gate-cover" role="status" data-testid="abstract-closed">
          <span className="sr-only">{message}. Submissions are no longer accepted.</span>
          <div className="af-tape" aria-hidden="true">
            <div className="af-tape-track">
              {[0, 1].map((g) => (
                <div key={g} className="af-tape-group">
                  {Array.from({ length: 6 }, (_, i) => (
                    <span key={i}>{message}</span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
