import { siteConfig } from "./config";
import { milestoneTime } from "./timeline";

/** Abstract submission limits. Carried over from the live site (script.js). */
export const MAX_ABSTRACT_MB = 3;
export const ABSTRACT_FORMATS = ["PDF", "DOC", "DOCX"] as const;

const DAY_MS = 86_400_000;
/** The submission day counts as open until it ends (IST). */
export const abstractClosesAt = milestoneTime(siteConfig.dates.submission) + DAY_MS;

export const isAbstractClosed = (now: number) => now >= abstractClosesAt;
