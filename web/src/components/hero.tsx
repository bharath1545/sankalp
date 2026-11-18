import { dateText, formatInr, siteConfig } from "@/lib/config";
import { Countdown } from "./countdown";
import { MiniTimeline } from "./mini-timeline";

/** "Sankalp’26" -> ["Sankalp", "’26"], matching Loader wordmark styling. */
function splitWordmark(name: string): [string, string] {
  const at = Math.max(name.lastIndexOf("’"), name.lastIndexOf("'"));
  return at > 0 ? [name.slice(0, at), name.slice(at)] : [name, ""];
}

const [wordmarkLead, wordmarkTail] = splitWordmark(siteConfig.name);

/** Opening time shown in the launch panel. Keep in step with siteConfig.dates.eventStart. */
const EVENT_TIME = "10:30 AM IST";
const city = siteConfig.venue.address.split(",").pop()?.trim() ?? "";

/** Numbered facts shown under the countdown. */
interface Fact {
  num: string;
  label: string;
  hint: string;
  value: string;
}

const facts: Fact[] = [
  { num: "01", label: "Hours", hint: "Non-stop, on campus", value: "24" },
  {
    num: "02",
    label: "Prize pool",
    hint: "Across the winning teams",
    value: formatInr(siteConfig.prizePoolInr),
  },
  {
    num: "03",
    label: "Per team",
    hint: "Maximum members",
    value: String(siteConfig.teamSize.max).padStart(2, "0"),
  },
  {
    num: "04",
    label: "Fee per team",
    hint: "Paid by UPI",
    value: formatInr(siteConfig.feePerTeamInr),
  },
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

        {/* CTA row. Final Registration is the main action. */}
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="/final-registration"
            className="hero-cta-primary inline-flex h-12 items-center rounded-md px-6 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan sm:text-base"
          >
            Final Registration
          </a>
          <a
            href="#registration"
            className="inline-flex h-12 items-center rounded-md border border-cyan/50 px-6 text-sm font-medium text-cyan transition-colors hover:border-cyan hover:bg-mid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan sm:text-base"
          >
            Abstract registration
          </a>
        </div>

        {/* Launch panel: countdown, then numbered facts */}
        <p className="lp-eyebrow mt-14 sm:mt-16">Launch window</p>
        <div className="lp-wrap">
          <div className="lp-chamfer lp-hud">
            <div className="in">
              <Countdown />
              <p className="lp-when">
                <b>{dateText.event}</b> · {EVENT_TIME} · {city}
              </p>
            </div>
          </div>
          <div className="lp-chamfer">
            <div className="in lp-facts">
              {facts.map((f) => (
                <div key={f.num} className="lp-fact">
                  <span className="ix">{f.num}</span>
                  <span className="tt">
                    {f.label}
                    <small>{f.hint}</small>
                  </span>
                  <span className="vv">{f.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Key dates as a circuit */}
        <p className="lp-eyebrow mt-14 sm:mt-16">Key dates</p>
        <h2 className="lp-h2">Power on, step by step</h2>
        <MiniTimeline />
      </div>
    </section>
  );
}
