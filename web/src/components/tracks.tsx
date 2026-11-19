import { tracks } from "@/lib/tracks";

/** Section 3: Themes / Tracks. One card per problem statement, each with its own icon and number. */
export function Tracks() {
  return (
    <section
      id="themes"
      className="scroll-mt-20 border-t border-line"
      data-testid="tracks"
    >
      <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
        <p className="lp-eyebrow">Problem statements</p>
        <h2 className="lp-h2 max-w-2xl">
          Seven real-world challenges. Room to build boldly.
        </h2>

        <ol className="mt-10 grid gap-4 md:grid-cols-2">
          {tracks.map((t, i) => {
            const accent = i % 2 === 0 ? "text-cyan" : "text-pink";
            const last = i === tracks.length - 1;
            return (
              <li
                key={t.id}
                data-testid="track"
                className={`group relative flex flex-col overflow-hidden rounded-lg border border-line-strong/40 bg-deep p-5 transition-colors hover:border-line-strong sm:p-6 ${
                  last ? "md:col-span-2" : ""
                }`}
              >
                {/* Large ghost numeral */}
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute -bottom-6 right-3 select-none font-display text-[7rem] font-bold leading-none opacity-[0.07] ${accent}`}
                >
                  {t.id}
                </span>

                <div className="flex items-start justify-between gap-3">
                  <span
                    className={`inline-grid size-12 place-items-center rounded-md border border-line-strong/50 ${accent}`}
                  >
                    <svg
                      width="26"
                      height="26"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      {t.icon.map((d) => (
                        <path key={d} d={d} />
                      ))}
                    </svg>
                  </span>
                  <span className="rounded-full border border-line-strong/40 px-3 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted">
                    {t.tag}
                  </span>
                </div>

                <p
                  className={`mt-5 font-mono text-xs font-bold tracking-[0.2em] ${accent}`}
                >
                  TRACK {t.id}
                </p>
                <h3 className="mt-1.5 font-display text-lg font-bold leading-snug sm:text-xl">
                  {t.title}
                </h3>
                <p className="relative mt-2 max-w-prose text-sm leading-relaxed text-muted sm:text-base">
                  {t.text}
                </p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
