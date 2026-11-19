/**
 * Abstract registration: field validation, request payload and submit call.
 * Port of the live site's form logic (script.js). No DOM access, so the same
 * rules can be reused on the server in the API route.
 */
import { ABSTRACT_FORMATS, MAX_ABSTRACT_MB } from "./abstract-rules";

export const SUBMISSION_ENDPOINT = "/api/submit";

export interface MemberValues {
  name: string;
  usn: string;
  email: string;
}

export interface AbstractFormValues {
  teamName: string;
  college: string;
  leaderPhone: string;
  theme: string;
  members: [MemberValues, MemberValues, MemberValues];
  /** Honeypot. Real people leave it empty. */
  website: string;
}

export type MemberField = "name" | "usn" | "email";
export type FieldKey =
  | "teamName"
  | "college"
  | "leaderPhone"
  | "theme"
  | `member${0 | 1 | 2}${Capitalize<MemberField>}`
  | "file";
export type FieldErrors = Partial<Record<FieldKey, string>>;

export const memberKey = (index: number, field: MemberField): FieldKey =>
  `member${index as 0 | 1 | 2}${(field[0].toUpperCase() + field.slice(1)) as Capitalize<MemberField>}`;

/** Order used to focus the first invalid field. */
export const FIELD_ORDER: FieldKey[] = [
  "teamName",
  "college",
  "leaderPhone",
  "theme",
  ...([0, 1, 2] as const).flatMap((i) =>
    (["name", "usn", "email"] as const).map((f) => memberKey(i, f)),
  ),
  "file",
];

export function emptyValues(): AbstractFormValues {
  const blank = (): MemberValues => ({ name: "", usn: "", email: "" });
  return {
    teamName: "",
    college: "",
    leaderPhone: "",
    theme: "",
    members: [blank(), blank(), blank()],
    website: "",
  };
}

const PHONE = /^[6-9]\d{9}$/;
const USN = /^[A-Za-z0-9]{8,12}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ABSTRACT_NAME = new RegExp(
  `\\.(${ABSTRACT_FORMATS.map((f) => f.toLowerCase()).join("|")})$`,
  "i",
);

export const MAX_ABSTRACT_BYTES = MAX_ABSTRACT_MB * 1048576;

export interface FileInfo {
  name: string;
  size: number;
}

/** Returns an error message per invalid field. Empty object means valid. */
export function validateRegistration(
  values: AbstractFormValues,
  file: FileInfo | null,
): FieldErrors {
  const errors: FieldErrors = {};

  if (!values.teamName.trim()) errors.teamName = "Enter your team name.";
  if (!values.college.trim()) errors.college = "Enter your college name.";

  if (!values.leaderPhone.trim()) {
    errors.leaderPhone = "Enter the team leader’s phone number.";
  } else if (!PHONE.test(values.leaderPhone.replace(/\D/g, "").slice(-10))) {
    errors.leaderPhone = "Enter a valid 10-digit mobile number.";
  }

  if (!values.theme) errors.theme = "Choose one of the seven themes.";

  const usns = new Set<string>();
  const emails = new Set<string>();

  values.members.forEach((member, i) => {
    const v = {
      name: member.name.trim(),
      usn: member.usn.trim(),
      email: member.email.trim(),
    };
    const used = Boolean(v.name || v.usn || v.email);
    // Member 1 is required. Members 2 and 3 are optional but must be complete once started.
    if (i === 0 || used) {
      (["name", "usn", "email"] as const).forEach((f) => {
        if (!v[f]) {
          errors[memberKey(i, f)] =
            i === 0
              ? "Required."
              : "Complete all three fields, or leave this member empty.";
        }
      });
    }
    if (v.usn) {
      const key = memberKey(i, "usn");
      if (!USN.test(v.usn)) errors[key] = "USN must be 8 to 12 letters or numbers.";
      const normalized = v.usn.toUpperCase();
      if (usns.has(normalized))
        errors[key] = "This USN is already used by another member.";
      usns.add(normalized);
    }
    if (v.email) {
      const key = memberKey(i, "email");
      if (!EMAIL.test(v.email)) errors[key] = "Enter a valid email address.";
      const normalized = v.email.toLowerCase();
      if (emails.has(normalized))
        errors[key] = "This email is already used by another member.";
      emails.add(normalized);
    }
  });

  if (!file || !ABSTRACT_NAME.test(file.name) || file.size > MAX_ABSTRACT_BYTES) {
    errors.file = `Attach a PDF, DOC, or DOCX abstract no larger than ${MAX_ABSTRACT_MB} MB.`;
  }

  return errors;
}

export function firstInvalid(errors: FieldErrors): FieldKey | null {
  return FIELD_ORDER.find((k) => errors[k]) ?? null;
}

export interface SubmissionPayload {
  teamName: string;
  college: string;
  leaderPhone: string;
  theme: string;
  members: MemberValues[];
  website: string;
  attachment: { name: string; type: string; content: string };
}

/** File contents as base64 (no data: prefix). */
export function fileToBase64(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read the attached file."));
    reader.onload = () => {
      const result = String(reader.result);
      resolve(result.slice(result.indexOf("base64,") + "base64,".length));
    };
    reader.readAsDataURL(file);
  });
}

export async function buildPayload(
  values: AbstractFormValues,
  file: File,
): Promise<SubmissionPayload> {
  return {
    teamName: values.teamName.trim(),
    college: values.college.trim(),
    leaderPhone: values.leaderPhone.trim(),
    theme: values.theme,
    members: values.members.map((m) => ({
      name: m.name.trim(),
      usn: m.usn.trim(),
      email: m.email.trim(),
    })),
    website: values.website,
    attachment: { name: file.name, type: file.type, content: await fileToBase64(file) },
  };
}

/** Sends the registration. Throws an Error with a readable message on failure. */
export async function submitRegistration(payload: SubmissionPayload): Promise<void> {
  const response = await fetch(SUBMISSION_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result = (await response.json().catch(() => ({}))) as {
    success?: boolean;
    error?: string;
  };
  if (!response.ok || result.success !== true) {
    throw new Error(result.error || "Email service could not accept the registration.");
  }
}
