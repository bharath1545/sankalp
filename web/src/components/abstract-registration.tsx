import Link from "next/link";
import { ABSTRACT_FORMATS, MAX_ABSTRACT_MB } from "@/lib/abstract-rules";
import { dateText, formatInr, siteConfig } from "@/lib/config";
import { DeadlineBadge } from "./deadline-badge";

const steps = [
  {
    title: "Abstract",
    text: `Submit your team details and one-page abstract by ${dateText.submission}.`,
  },
  {
    title: "Round 1 result",
    text: `Shortlisted teams are informed on ${dateText.acceptance}.`,
  },
  {
    title: "Final registration",
    text: `Shortlisted teams complete final registration and pay the ${formatInr(siteConfig.feePerTeamInr)} team fee by ${dateText.registration}.`,
  },
];

const requirements = [
  "Choose one of the seven problem statements.",
  "One page: the problem, your proposed solution, your approach and the potential impact.",
  `${ABSTRACT_FORMATS.join(", ")} file, up to ${MAX_ABSTRACT_MB} MB.`,
  `Up to ${siteConfig.teamSize.max} members. Give name, USN and email for each.`,
];

/**
 * Section 6: Abstract Registration. Explains the flow and links to Final Registration.
 * `children` is the slot for the abstract form (added in a later task).
 */
export function AbstractRegistration({ children }: { children?: React.ReactNode }) {
  return (
    <section
      id="registration"
      className="scroll-mt-20 border-t border-line"
      data-testid="abstract-registration"
    >
      <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
        <p className="lp-eyebrow">Abstract registration</p>
        <h2 className="lp-h2 max-w-2xl">Team and abstract registration</h2>
        <div className="mt-4">
          <DeadlineBadge />
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <div>
            <h3 className="font-mono text-xs font-medium uppercase tracking-[0.22em] text-muted">
              How it works
            </h3>
            <ol className="mt-5 grid gap-4">
              {steps.map((s, i) => (
                <li
                  key={s.title}
                  data-testid="step"
                  className="grid grid-cols-[2.75rem_1fr] items-start gap-4 rounded-lg border border-line-strong/40 bg-deep p-4"
                >
                  <span
                    aria-hidden="true"
                    className="grid size-11 place-items-center rounded-md border border-line-strong/50 font-mono text-sm font-bold text-cyan"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h4 className="font-display text-lg font-bold leading-snug">
                      {s.title}
                    </h4>
                    <p className="mt-1 text-sm leading-relaxed text-muted">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <h3 className="font-mono text-xs font-medium uppercase tracking-[0.22em] text-muted">
              What to submit
            </h3>
            <ul className="mt-5 grid gap-3 rounded-lg border border-line-strong/40 bg-deep p-5 text-sm leading-relaxed text-muted sm:text-base">
              {requirements.map((r) => (
                <li key={r} className="grid grid-cols-[1rem_1fr] gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-2 size-1.5 rounded-full bg-cyan"
                  />
                  <span>{r}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/final-registration"
                className="hero-cta-primary inline-flex h-12 items-center rounded-md px-6 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan sm:text-base"
              >
                Go to Final Registration
              </Link>
              <p className="text-sm text-muted">For shortlisted teams.</p>
            </div>
          </div>
        </div>

        {children && <div className="mt-12">{children}</div>}
      </div>
    </section>
  );
}
