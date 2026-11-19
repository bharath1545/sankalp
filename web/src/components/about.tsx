import { formatInr, siteConfig } from "@/lib/config";

interface Expectation {
  title: string;
  text: string;
  /** SVG path data, 24x24 viewBox, stroke icon. */
  icon: string[];
}

const expectations: Expectation[] = [
  {
    title: "Rapid prototyping",
    text: "Turn raw concepts into practical demos in just one intense 24-hour sprint.",
    icon: ["M13 2 3 14h9l-1 8 10-12h-9l1-8z"],
  },
  {
    title: "Mentor support",
    text: "Get guidance, feedback, and direction from mentors and organisers during the build process.",
    icon: [
      "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",
      "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
      "M22 21v-2a4 4 0 0 0-3-3.87",
      "M16 3.13a4 4 0 0 1 0 7.75",
    ],
  },
  {
    title: "Real-world impact",
    text: "Work on ideas spanning sustainability, AI, healthcare, mobility, and smart communities.",
    icon: [
      "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z",
      "M2 12h20",
      "M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z",
    ],
  },
  {
    title: "Exposure & rewards",
    text: `Showcase your idea, connect with peers, and compete for a ${formatInr(siteConfig.prizePoolInr)} prize pool.`,
    icon: [
      "M6 9H4.5a2.5 2.5 0 0 1 0-5H6",
      "M18 9h1.5a2.5 2.5 0 0 0 0-5H18",
      "M4 22h16",
      "M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22",
      "M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22",
      "M18 2H6v7a6 6 0 0 0 12 0V2z",
    ],
  },
];

/** Section 2: About the hackathon. Copy comes from the live site. */
export function About() {
  return (
    <section id="about" className="scroll-mt-20 border-t border-line" data-testid="about">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
        <p className="lp-eyebrow">About</p>
        <h2 className="lp-h2 max-w-2xl">Built for bold ideas and fast execution.</h2>

        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
          {siteConfig.name} is AJIET’s {siteConfig.edition} edition of its national-level
          24-hour hackathon, organised by the IEEE Student Branch in association with the
          Department of Electronics and Communication Engineering. Teams will develop
          solutions to real-world challenges and present their work at{" "}
          {siteConfig.venue.name}, {siteConfig.venue.address.split(",").pop()?.trim()}.
        </p>

        <h3 className="mt-12 font-mono text-xs font-medium uppercase tracking-[0.22em] text-muted">
          What to expect
        </h3>
        <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {expectations.map((e) => (
            <li
              key={e.title}
              className="rounded-lg border border-line-strong/40 bg-deep p-5 transition-colors hover:border-line-strong"
            >
              <span className="mb-4 inline-grid size-10 place-items-center rounded-md border border-line-strong/50 text-cyan">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  {e.icon.map((d) => (
                    <path key={d} d={d} />
                  ))}
                </svg>
              </span>
              <h4 className="font-display text-lg font-bold leading-snug">{e.title}</h4>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{e.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
