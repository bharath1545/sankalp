/**
 * Server-side check and clean-up of an abstract registration.
 * Port of validateSubmission() from the live site's api/submit.js.
 * Never trust the browser: these rules run again here.
 */
import { EMAIL_RE, MAX_ABSTRACT_BYTES, PHONE_RE, USN_RE } from "./registration";

const ALLOWED_FILE_TYPES = new Map<string, Set<string>>([
  [".pdf", new Set(["application/pdf", "application/octet-stream"])],
  [".doc", new Set(["application/msword", "application/octet-stream"])],
  [
    ".docx",
    new Set([
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/octet-stream",
    ]),
  ],
]);

const BASE64_RE = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

export interface CleanMember {
  name: string;
  usn: string;
  email: string;
}

export interface CleanSubmission {
  teamName: string;
  college: string;
  leaderPhone: string;
  theme: string;
  members: CleanMember[];
  attachment: { filename: string; content_type: string; content: string };
}

export type SubmissionResult =
  { spam: true } | { error: string } | { submission: CleanSubmission };

/** Strips control characters, trims and caps the length. Non-strings become "". */
export function cleanText(value: unknown, maxLength: number): string {
  return typeof value === "string"
    ? value
        .replace(/[\u0000-\u001f\u007f]/g, " ")
        .trim()
        .slice(0, maxLength)
    : "";
}

type Loose = Record<string, unknown>;
const asRecord = (v: unknown): Loose => (v && typeof v === "object" ? (v as Loose) : {});

export function validateSubmission(body: Loose): SubmissionResult {
  // Honeypot: bots fill it. Pretend it worked.
  if (cleanText(body.website, 200)) return { spam: true };

  const teamName = cleanText(body.teamName, 100);
  const college = cleanText(body.college, 160);
  const leaderPhone = cleanText(body.leaderPhone, 30).replace(/\D/g, "").slice(-10);
  const theme = cleanText(body.theme, 300);
  if (!teamName || !college || !PHONE_RE.test(leaderPhone) || !theme) {
    return {
      error: "Enter a team name, college, valid leader phone, and challenge theme.",
    };
  }

  if (!Array.isArray(body.members) || body.members.length !== 3) {
    return { error: "Invalid team member details." };
  }
  const members = body.members.map((raw): CleanMember => {
    const m = asRecord(raw);
    return {
      name: cleanText(m.name, 100),
      usn: cleanText(m.usn, 20),
      email: cleanText(m.email, 254),
    };
  });
  const isUsed = (m: CleanMember) => Boolean(m.name || m.usn || m.email);
  if (!isUsed(members[0])) return { error: "Add the team leader details." };
  const activeMembers = members.filter(isUsed);

  const emails = new Set<string>();
  const usns = new Set<string>();
  for (const member of activeMembers) {
    if (!member.name || !USN_RE.test(member.usn) || !EMAIL_RE.test(member.email)) {
      return { error: "Each team member must have a valid name, USN, and email." };
    }
    const email = member.email.toLowerCase();
    const usn = member.usn.toUpperCase();
    if (emails.has(email) || usns.has(usn)) {
      return { error: "Team member emails and USNs must be unique." };
    }
    emails.add(email);
    usns.add(usn);
  }

  const attachment = asRecord(body.attachment);
  if (typeof attachment.content !== "string") {
    return { error: "Attach your one-page abstract." };
  }
  const filename = cleanText(attachment.name, 150).replace(/[\\/]/g, "_");
  const extension = filename.match(/\.[^.]+$/)?.[0]?.toLowerCase() ?? "";
  const contentType = cleanText(attachment.type, 100) || "application/octet-stream";
  const allowedTypes = ALLOWED_FILE_TYPES.get(extension);
  if (!allowedTypes || !allowedTypes.has(contentType)) {
    return { error: "Attach the abstract as a PDF, DOC, or DOCX file." };
  }
  if (!BASE64_RE.test(attachment.content)) {
    return { error: "The abstract file could not be read. Please select it again." };
  }
  const file = Buffer.from(attachment.content, "base64");
  if (!file.length || file.length > MAX_ABSTRACT_BYTES) {
    return { error: "The abstract must be no larger than 3 MB." };
  }

  return {
    submission: {
      teamName,
      college,
      leaderPhone,
      theme,
      members: activeMembers,
      attachment: {
        filename,
        content_type: contentType,
        content: file.toString("base64"),
      },
    },
  };
}

/** Plain-text body of the registration email. */
export function formatEmail(submission: CleanSubmission): string {
  const members = submission.members
    .map((m, i) =>
      [`Member ${i + 1}`, `Name: ${m.name}`, `USN: ${m.usn}`, `Email: ${m.email}`].join(
        "\n",
      ),
    )
    .join("\n\n");

  return [
    "SANKALP 2026 registration",
    "",
    `Team name: ${submission.teamName}`,
    `College: ${submission.college}`,
    `Leader phone: ${submission.leaderPhone}`,
    `Challenge theme: ${submission.theme}`,
    `Team size: ${submission.members.length}`,
    "",
    members,
  ].join("\n");
}
