import { dateText, formatInr, siteConfig } from "@/lib/config";
import { Countdown } from "./countdown";
import { MiniTimeline } from "./mini-timeline";

/** "Sankalp’26" -> ["Sankalp", "’26"], matching Loader wordmark styling. */
function splitWordmark(name: string): [string, string] {
  const at = Math.max(name.lastIndexOf("’"), name.lastIndexOf("'"));
  return at > 0 ? [name.slice(0, at), name.slice(at)] : [name, ""];
}

const [wordmarkLead, wordmarkTail] = splitWordmark(siteConfig.name);

/** Quick fact shown below the CTA row (D19 numbered list). */
interface Fact {
  num: string;
  label: string;
  value: string;
}

const facts: Fact[] = [
  { num: "01", label: "Hours", value: "24" },
  { num: "02", label: "Prize pool", value: formatInr(siteConfig.prizePoolInr) },
  { num: "03", label: "Per team", value: `${siteConfig.teamSize.max} members` },
  { num: "04", label: "Fee per team", value: formatInr(siteConfig.feePerTeamInr) },
];

export function Hero() {
  return (
    <section id="home" className="relative overflow-hidden" data-testid="hero">
      {/* Decorative bloom; hidden in light theme via CSS. */}
      <div className="hero-bloom" aria-hidden="true" />

      <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-16 sm:pb-20 sm:pt-24 md:pt-28">
        {/* Pill */}
        <p className="mb-5 inline-block max-w-full rounded-full border border-line bg-deep/60 px-4 py-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-muted sm:tracking-[0.25em]">
          {siteConfig.edition} edition · Idea submission closes {dateText.submission}
        </p>

        {/* Wordmark */}
        <h1 className="font-display text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
          <span className="hero-glitch" data-text={wordmarkLead}>
            {wordmarkLead}
          </span>
          {wordmarkTail && <span className="hero-wordmark-accent">{wordmarkTail}</span>}
        </h1>

        {/* Tagline */}
        <p className="mt-3 max-w-lg font-display text-lg font-semibold text-white/90 sm:text-xl md:text-2xl">
          {siteConfig.tagline}
        </p>
        <p className="mt-2 max-w-md text-sm text-muted sm:text-base">
          Think big. Innovate boldly. Build for impact.
        </p>

        {/* CTA row */}
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="#registration"
            className="hero-cta-primary inline-flex h-12 items-center rounded-md px-6 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan sm:text-base"
          >
            Submit your abstract
          </a>
          <a
            href="#themes"
            className="inline-flex h-12 items-center rounded-md border border-cyan/50 px-6 text-sm font-medium text-cyan transition-colors hover:border-cyan hover:bg-mid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan sm:text-base"
          >
            Problem statements
          </a>
        </div>

        {/* Facts strip (D19: numbered list) */}
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
          {facts.map((f) => (
            <div key={f.num} className="border-t border-line pt-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted sm:tracking-[0.3em]">
                {f.num} {f.label}
              </span>
              <p className="mt-1 font-display text-xl font-bold text-white sm:text-2xl">
                {f.value}
              </p>
            </div>
          ))}
        </div>

        {/* Countdown dials */}
        <div className="mt-14 sm:mt-16">
          <Countdown />
        </div>

        {/* Mini timeline */}
        <div className="mt-14 sm:mt-16">
          <h2 className="mb-6 text-center font-mono text-xs font-medium uppercase tracking-[0.3em] text-muted">
            Key dates
          </h2>
          <MiniTimeline />
        </div>
      </div>
    </section>
  );
}
