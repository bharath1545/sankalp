import type { Metadata } from "next";
import { Round1ResultBlock } from "@/components/round1-result";
import { TeamRegistration } from "@/components/team-registration";
import { dateText, formatInr, siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "Final Registration · Sankalp’26",
  description: `Final registration for shortlisted teams of ${siteConfig.name}.`,
};

export default function FinalRegistrationPage() {
  return (
    <div
      data-testid="final-registration"
      className="mx-auto max-w-4xl px-4 pb-16 pt-28 sm:pt-32"
    >
      <p className="lp-eyebrow">Final registration</p>
      <h1 className="lp-h2">Final Registration</h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
        For shortlisted teams. Register your team to get a unique Team ID. The fee is{" "}
        {formatInr(siteConfig.feePerTeamInr)} per team, due {dateText.registration}.
      </p>

      <section className="mt-10" aria-label="Round 1 result">
        <Round1ResultBlock />
      </section>

      <section className="mt-12" aria-label="Team registration">
        <TeamRegistration />
      </section>
    </div>
  );
}
