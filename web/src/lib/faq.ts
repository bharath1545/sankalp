import { ABSTRACT_FORMATS, MAX_ABSTRACT_MB } from "./abstract-rules";
import { dateText, formatInr, siteConfig } from "./config";

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

/**
 * Section 9 content. Every fact comes from `siteConfig` or from the live site's
 * About page, so nothing here is invented. Rules text is not included yet (Q28).
 */
export const faqItems: FaqItem[] = [
  {
    id: "eligibility",
    question: "Who can participate?",
    answer: `${siteConfig.eligibility} can participate.`,
  },
  {
    id: "team-size",
    question: "How many members can a team have?",
    answer: `A team can have ${siteConfig.teamSize.min} to ${siteConfig.teamSize.max} members. Give the name, USN and email of every member. Member 1 is the team leader.`,
  },
  {
    id: "abstract",
    question: "What do I need to submit first?",
    answer: `Choose one of the seven problem statements and submit a one-page abstract: the problem, your proposed solution, your approach and the potential impact. Accepted formats are ${ABSTRACT_FORMATS.join(", ")}, up to ${MAX_ABSTRACT_MB} MB.`,
  },
  {
    id: "after-abstract",
    question: "What happens after I submit the abstract?",
    answer: `Abstract submission closes on ${dateText.submission}. Shortlisted teams are informed on ${dateText.acceptance}. Shortlisted teams then complete Final Registration by ${dateText.registration}.`,
  },
  {
    id: "fee",
    question: "Is there a registration fee, and how do I pay?",
    answer: `Only shortlisted teams pay. The fee is ${formatInr(siteConfig.feePerTeamInr)} per team. Payment is by UPI during Final Registration: enter the UTR and upload the payment screenshot. The organisers verify each payment by hand.`,
  },
  {
    id: "prizes",
    question: "What is the prize pool?",
    answer: `Teams compete for a total prize pool of ${formatInr(siteConfig.prizePoolInr)}.`,
  },
  {
    id: "when-where",
    question: "When and where is the hackathon?",
    answer: `${siteConfig.name} is a 24-hour hackathon on ${dateText.event} at ${siteConfig.venue.name}, ${siteConfig.venue.address}.`,
  },
  {
    id: "contact",
    question: "Who do I contact with questions?",
    answer: `Email ${siteConfig.email}.`,
  },
];
