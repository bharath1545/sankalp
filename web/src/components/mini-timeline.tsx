import { dateText, siteConfig, formatInr } from "@/lib/config";

interface Milestone {
  date: string;
  title: string;
  note: string;
}

const milestones: Milestone[] = [
  {
    date: dateText.submission,
    title: "Idea submission closes",
    note: "Submit one-page abstract using the registration form",
  },
  {
    date: dateText.acceptance,
    title: "Acceptance notifications",
    note: "Shortlisted teams informed",
  },
  {
    date: dateText.registration,
    title: "Last date of team registration",
    note: `${formatInr(siteConfig.feePerTeamInr)} per team`,
  },
  {
    date: dateText.event,
    title: siteConfig.name,
    note: `24-hour hackathon at ${siteConfig.venue.name.split(",")[0]}`,
  },
];

export function MiniTimeline() {
  return (
    <div
      className="relative mx-auto max-w-xl"
      aria-label="Event milestones"
      data-testid="mini-timeline"
    >
      {/* Vertical line */}
      <div
        className="absolute left-3 top-2 bottom-2 w-px bg-line sm:left-4"
        aria-hidden="true"
      />

      <ol className="space-y-6">
        {milestones.map((ms) => (
          <li key={ms.title} className="relative pl-9 sm:pl-11">
            {/* Dot */}
            <span
              className="absolute left-[9px] top-1.5 h-[7px] w-[7px] rounded-full bg-cyan shadow-[0_0_6px_var(--cyan)] sm:left-[13px]"
              aria-hidden="true"
            />
            <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-cyan">
              {ms.date}
            </p>
            <p className="mt-0.5 font-display text-sm font-semibold text-white sm:text-base">
              {ms.title}
            </p>
            <p className="mt-0.5 text-xs text-muted sm:text-sm">{ms.note}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
