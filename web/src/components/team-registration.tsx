"use client";

import { useRef, useState } from "react";
import { dateText, formatInr, siteConfig } from "@/lib/config";
import {
  emptyFinal,
  firstInvalid,
  memberKey,
  validateFinalRegistration,
  type FieldErrors,
  type FieldKey,
  type MemberField,
  type FinalValues,
} from "@/lib/registration";
import { tracks } from "@/lib/tracks";

type Status = "idle" | "sending" | "done";

export interface RegistrationResult {
  teamId: string;
}

export type RegisterTeam = (values: FinalValues) => Promise<RegistrationResult>;

/** Backend is not built yet (T021/T022). Fails honestly instead of faking a Team ID. */
export const notConnected: RegisterTeam = () =>
  Promise.reject(new Error("Final registration is not connected yet. Try again later."));

const inputClass =
  "h-11 w-full rounded-md border border-field bg-void px-3 text-sm text-white placeholder:text-muted/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan aria-[invalid=true]:border-danger";
const labelClass = "font-mono text-xs font-medium uppercase tracking-[0.18em] text-muted";

const memberFields: { field: MemberField; label: string; type: string }[] = [
  { field: "name", label: "Name", type: "text" },
  { field: "usn", label: "USN", type: "text" },
  { field: "email", label: "Email", type: "email" },
];

/** Keeps option text inside the select. The saved value stays the full title. */
const shortTitle = (title: string, max = 46) =>
  title.length > max ? `${title.slice(0, max - 1).trimEnd()}…` : title;

const idOf = (key: FieldKey) => `fr-${key}`;

/** Final Registration team form. Team ID comes from the server through `onRegister`. */
export function TeamRegistration({
  onRegister = notConnected,
}: {
  onRegister?: RegisterTeam;
}) {
  const [values, setValues] = useState<FinalValues>(emptyFinal);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [failure, setFailure] = useState("");
  const [teamId, setTeamId] = useState("");
  const summaryRef = useRef<HTMLParagraphElement>(null);

  const setTop = (
    key: "teamName" | "college" | "leaderPhone" | "theme" | "teamId",
    value: string,
  ) => setValues((v) => ({ ...v, [key]: value }));

  const setMember = (index: number, field: MemberField, value: string) =>
    setValues((v) => {
      const members = v.members.map((m, i) =>
        i === index ? { ...m, [field]: value } : m,
      );
      return { ...v, members: members as FinalValues["members"] };
    });

  const clearError = (key: FieldKey) => {
    setFailure("");
    setErrors((e) => {
      if (!e[key]) return e;
      const next = { ...e };
      delete next[key];
      return next;
    });
  };

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (status === "sending") return;
    setFailure("");

    const found = validateFinalRegistration(values);
    setErrors(found);
    const first = firstInvalid(found);
    if (first) {
      document.getElementById(idOf(first))?.focus();
      return;
    }

    setStatus("sending");
    try {
      const result = await onRegister(values);
      setTeamId(result.teamId);
      setStatus("done");
    } catch (error) {
      setStatus("idle");
      setFailure(error instanceof Error ? error.message : "Unknown error.");
      summaryRef.current?.focus();
    }
  }

  if (status === "done") {
    return (
      <div
        role="status"
        data-testid="team-success"
        className="rounded-lg border border-line-strong/40 bg-deep p-6 sm:p-8"
      >
        <h3 className="font-display text-2xl font-bold">Team registered</h3>
        <p className="mt-3 font-mono text-xs uppercase tracking-[0.18em] text-muted">
          Confirmed Team ID
        </p>
        <p
          data-testid="team-id"
          className="mt-1 font-mono text-2xl font-bold text-cyan sm:text-3xl"
        >
          {teamId}
        </p>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
          Keep this Team ID. You need it for payment. The fee is{" "}
          {formatInr(siteConfig.feePerTeamInr)} per team, due {dateText.registration}.
        </p>
      </div>
    );
  }

  const field = (key: FieldKey) => ({
    id: idOf(key),
    "aria-invalid": errors[key] ? (true as const) : undefined,
    "aria-describedby": errors[key] ? `${idOf(key)}-err` : undefined,
  });
  const fieldError = (key: FieldKey) =>
    errors[key] ? (
      <p id={`${idOf(key)}-err`} className="mt-1 text-xs text-danger">
        {errors[key]}
      </p>
    ) : null;

  const sending = status === "sending";
  const hasErrors = Object.keys(errors).length > 0;

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      aria-labelledby="team-form-title"
      data-testid="team-form"
      className="rounded-lg border border-line-strong/40 bg-deep p-5 sm:p-8"
    >
      <h3 id="team-form-title" className="font-display text-2xl font-bold">
        Register your team
      </h3>
      <p className="mt-2 text-sm text-muted">
        Team of 1 to {siteConfig.teamSize.max}. Member 1 is the team leader. Only
        shortlisted teams can register. Use the Team ID from your Round 1 email.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor={idOf("teamName")} className={labelClass}>
            Team name
          </label>
          <input
            {...field("teamName")}
            className={`${inputClass} mt-2`}
            value={values.teamName}
            autoComplete="off"
            onChange={(e) => {
              setTop("teamName", e.target.value);
              clearError("teamName");
            }}
          />
          {fieldError("teamName")}
        </div>
        <div>
          <label htmlFor={idOf("college")} className={labelClass}>
            College
          </label>
          <input
            {...field("college")}
            className={`${inputClass} mt-2`}
            value={values.college}
            autoComplete="organization"
            onChange={(e) => {
              setTop("college", e.target.value);
              clearError("college");
            }}
          />
          {fieldError("college")}
        </div>
        <div>
          <label htmlFor={idOf("leaderPhone")} className={labelClass}>
            Leader phone
          </label>
          <input
            {...field("leaderPhone")}
            className={`${inputClass} mt-2`}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={values.leaderPhone}
            onChange={(e) => {
              setTop("leaderPhone", e.target.value);
              clearError("leaderPhone");
            }}
          />
          {fieldError("leaderPhone")}
        </div>
        <div>
          <label htmlFor={idOf("theme")} className={labelClass}>
            Challenge theme
          </label>
          <select
            {...field("theme")}
            className={`${inputClass} fr-select mt-2`}
            value={values.theme}
            onChange={(e) => {
              setTop("theme", e.target.value);
              clearError("theme");
            }}
          >
            <option value="">Select a theme</option>
            {tracks.map((t) => (
              <option key={t.id} value={t.title} title={t.title}>
                {t.id}. {shortTitle(t.title)}
              </option>
            ))}
          </select>
          {fieldError("theme")}
        </div>
        <div>
          <label htmlFor={idOf("teamId")} className={labelClass}>
            Team ID
          </label>
          <input
            {...field("teamId")}
            className={`${inputClass} mt-2 font-mono uppercase`}
            value={values.teamId}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            placeholder="From your Round 1 email"
            onChange={(e) => {
              setTop("teamId", e.target.value);
              clearError("teamId");
            }}
          />
          {fieldError("teamId")}
        </div>
      </div>

      <div className="mt-10 grid gap-6">
        {[0, 1, 2].map((i) => (
          <fieldset
            key={i}
            className="rounded-md border border-line-strong/40 p-4 sm:p-5"
          >
            <legend className="px-2 font-mono text-xs font-medium uppercase tracking-[0.18em] text-cyan">
              Member {i + 1} {i === 0 ? "· team leader, required" : "· optional"}
            </legend>
            <div className="grid gap-4 sm:grid-cols-3">
              {memberFields.map(({ field: f, label, type }) => {
                const key = memberKey(i, f);
                return (
                  <div key={f}>
                    <label htmlFor={idOf(key)} className={labelClass}>
                      <span className="sr-only">Member {i + 1} </span>
                      {label}
                    </label>
                    <input
                      {...field(key)}
                      className={`${inputClass} mt-2`}
                      type={type}
                      autoComplete="off"
                      value={values.members[i][f]}
                      onChange={(e) => {
                        setMember(i, f, e.target.value);
                        clearError(key);
                      }}
                    />
                    {fieldError(key)}
                  </div>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>

      <p className="mt-8 rounded-md border border-line-strong/40 p-4 text-sm leading-relaxed text-muted">
        Fee: {formatInr(siteConfig.feePerTeamInr)} per team, due {dateText.registration}.
        Payment is by UPI. Payment details and the screenshot upload come after
        registration.
      </p>

      <p
        ref={summaryRef}
        tabIndex={-1}
        role="alert"
        className="mt-6 min-h-5 text-sm text-danger focus:outline-none"
      >
        {failure
          ? `Your registration was not sent: ${failure}`
          : hasErrors
            ? "Complete the required team details. Optional members must have all three fields completed. USNs and emails must be valid and unique."
            : ""}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={sending}
          className="hero-cta-primary inline-flex h-12 items-center rounded-md px-6 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan disabled:opacity-60 sm:text-base"
        >
          {sending ? "Registering…" : "Register team"}
        </button>
        <p className="text-sm text-muted">
          Questions:{" "}
          <a className="underline" href={`mailto:${siteConfig.email}`}>
            {siteConfig.email}
          </a>
        </p>
      </div>
    </form>
  );
}
