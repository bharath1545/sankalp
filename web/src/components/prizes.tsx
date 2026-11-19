import { formatInr } from "@/lib/config";
import { prizeCategories, prizePoolInr, type PrizeCategory } from "@/lib/prizes";

/**
 * Section 4: Prizes. Shows the confirmed pool. The breakdown appears once
 * `prizeCategories` has entries; until then a clear "to be announced" state is shown.
 */
export function Prizes({
  categories = prizeCategories,
}: {
  categories?: PrizeCategory[];
}) {
  return (
    <section
      id="prizes"
      className="scroll-mt-20 border-t border-line"
      data-testid="prizes"
    >
      <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
        <p className="lp-eyebrow">Prizes</p>
        <h2 className="lp-h2 max-w-2xl">Build something worth winning.</h2>

        <div className="lp-wrap">
          <div className="lp-chamfer">
            <div className="in px-6 py-8 text-center sm:py-10">
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-muted">
                Total prize pool
              </p>
              <p
                className="hero-wordmark-accent mt-2 inline-block font-display text-6xl font-extrabold leading-none tracking-tight sm:text-7xl"
                data-testid="prize-pool"
              >
                {formatInr(prizePoolInr)}
              </p>
              <p className="mt-3 text-sm text-muted sm:text-base">
                Across the winning teams, plus the chance to showcase your idea and
                connect with peers.
              </p>
            </div>
          </div>
        </div>

        <h3 className="mt-12 font-mono text-xs font-medium uppercase tracking-[0.22em] text-muted">
          Prize breakdown
        </h3>

        {categories.length === 0 ? (
          <p
            className="mt-5 max-w-xl rounded-lg border border-dashed border-line-strong/50 bg-deep p-5 text-sm text-muted sm:text-base"
            data-testid="prizes-pending"
          >
            Winner categories and the split of the {formatInr(prizePoolInr)} pool will be
            announced soon.
          </p>
        ) : (
          <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((c) => (
              <li
                key={c.id}
                data-testid="prize"
                className="rounded-lg border border-line-strong/40 bg-deep p-5"
              >
                <h4 className="font-display text-lg font-bold leading-snug">{c.name}</h4>
                <p className="mt-2 font-display text-3xl font-bold text-cyan">
                  {formatInr(c.amountInr)}
                </p>
                {c.note && <p className="mt-2 text-sm text-muted">{c.note}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
