"use client";

import { useRef, useState } from "react";
import { MAX_ABSTRACT_MB } from "@/lib/abstract-rules";
import { siteConfig } from "@/lib/config";
import {
  buildPayload,
  emptyValues,
  firstInvalid,
  memberKey,
  submitRegistration,
  validateRegistration,
  type AbstractFormValues,
  type FieldErrors,
  type FieldKey,
  type MemberField,
} from "@/lib/registration";
import { tracks } from "@/lib/tracks";

type Status = "idle" | "sending" | "done";

const inputClass =
  "h-11 w-full rounded-md border border-field bg-void px-3 text-sm text-white placeholder:text-muted/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan aria-[invalid=true]:border-danger";
const labelClass = "font-mono text-xs font-medium uppercase tracking-[0.18em] text-muted";

const memberFields: { field: MemberField; label: string; type: string; auto?: string }[] =
  [
    { field: "name", label: "Name", type: "text", auto: "off" },
    { field: "usn", label: "USN", type: "text", auto: "off" },
    { field: "email", label: "Email", type: "email", auto: "off" },
  ];

const idOf = (key: FieldKey) => `af-${key}`;

/** Abstract registration form. Posts to /api/submit. */
export function AbstractForm() {
  const [values, setValues] = useState<AbstractFormValues>(emptyValues);
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [failure, setFailure] = useState("");
  const summaryRef = useRef<HTMLParagraphElement>(null);

  const setTop = (
    key: "teamName" | "college" | "leaderPhone" | "theme" | "website",
    value: string,
  ) => setValues((v) => ({ ...v, [key]: value }));

  const setMember = (index: number, field: MemberField, value: string) =>
    setValues((v) => {
      const members = v.members.map((m, i) =>
        i === index ? { ...m, [field]: value } : m,
      );
      return { ...v, members: members as AbstractFormValues["members"] };
    });

  const clearError = (key: FieldKey) =>
    setErrors((e) => {
      if (!e[key]) return e;
      const next = { ...e };
      delete next[key];
      return next;
    });

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (status === "sending") return;
    setFailure("");

    const found = validateRegistration(values, file);
    setErrors(found);
    const first = firstInvalid(found);
    if (first || !file) {
      if (first) document.getElementById(idOf(first))?.focus();
      return;
    }

    setStatus("sending");
    try {
      await submitRegistration(await buildPayload(values, file));
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
        data-testid="abstract-success"
        className="rounded-lg border border-line-strong/40 bg-deep p-6 sm:p-8"
      >
        <h3 className="font-display text-2xl font-bold">Thank you!</h3>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
          Your abstract was received. Shortlisted teams are informed by email. Keep an eye
          on the inbox of Member 1.
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
      aria-labelledby="abstract-form-title"
      data-testid="abstract-form"
      className="rounded-lg border border-line-strong/40 bg-deep p-5 sm:p-8"
    >
      <h3 id="abstract-form-title" className="font-display text-2xl font-bold">
        Submit your abstract
      </h3>
      <p className="mt-2 text-sm text-muted">
        Team of 1 to {siteConfig.teamSize.max}. Member 1 is the team leader.
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
            className={`${inputClass} mt-2`}
            value={values.theme}
            onChange={(e) => {
              setTop("theme", e.target.value);
              clearError("theme");
            }}
          >
            <option value="">Select a theme</option>
            {tracks.map((t) => (
              <option key={t.id} value={t.title}>
                {t.id}. {t.title}
              </option>
            ))}
          </select>
          {fieldError("theme")}
        </div>
      </div>

      <div className="mt-10 grid gap-6">
        {[0, 1, 2].map((i) => (
          <fieldset
            key={i}
            className="rounded-md border border-line-strong/40 p-4 sm:p-5"
          >
            <legend className="px-2 font-mono text-xs font-medium uppercase tracking-[0.18em] text-cyan">
              Member {i + 1} {i === 0 ? "· required" : "· optional"}
            </legend>
            <div className="grid gap-4 sm:grid-cols-3">
              {memberFields.map(({ field: f, label, type, auto }) => {
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
                      autoComplete={auto}
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

      <div className="mt-8">
        <label htmlFor={idOf("file")} className={labelClass}>
          Abstract file (PDF, DOC or DOCX, up to {MAX_ABSTRACT_MB} MB)
        </label>
        <input
          {...field("file")}
          className={`${inputClass} mt-2 h-auto py-2 af-file`}
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={(e) => {
            setFile(e.target.files?.[0] ?? null);
            clearError("file");
          }}
        />
        {fieldError("file")}
      </div>

      {/* Honeypot. Hidden from people and from assistive tech. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="af-website">Website</label>
        <input
          id="af-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.website}
          onChange={(e) => setTop("website", e.target.value)}
        />
      </div>

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
          {sending ? "Submitting…" : "Submit registration details"}
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
