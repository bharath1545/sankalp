"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { EMAIL_RE } from "@/lib/registration";

type Status = "idle" | "sending" | "done";

export type LoginHandler = (credentials: { email: string }) => Promise<void>;

/** Auth is not built yet (T026). Fails honestly. The login method is not decided. */
export const loginNotConnected: LoginHandler = () =>
  Promise.reject(new Error("Login is not connected yet. Try again later."));

/** Login form. The sign-in method is undecided, so it only asks for an email. */
export function LoginForm({ onLogin = loginNotConnected }: { onLogin?: LoginHandler }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [failure, setFailure] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const inputRef = useRef<HTMLInputElement>(null);
  const failureRef = useRef<HTMLParagraphElement>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (status === "sending") return;
    setFailure("");

    const value = email.trim();
    if (!value) {
      setError("Enter your email address.");
      inputRef.current?.focus();
      return;
    }
    if (!EMAIL_RE.test(value)) {
      setError("Enter a valid email address.");
      inputRef.current?.focus();
      return;
    }
    setError("");

    setStatus("sending");
    try {
      await onLogin({ email: value });
      setStatus("done");
    } catch (e) {
      setStatus("idle");
      setFailure(e instanceof Error ? e.message : "Unknown error.");
      failureRef.current?.focus();
    }
  }

  if (status === "done") {
    return (
      <div
        role="status"
        data-testid="login-success"
        className="rounded-lg border border-line-strong/40 bg-deep p-6 sm:p-8"
      >
        <h2 className="font-display text-2xl font-bold">You are logged in</h2>
        <p className="mt-3 text-sm text-muted">
          <Link className="underline" href="/">
            Back to the home page
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      aria-labelledby="login-title"
      data-testid="login-form"
      className="rounded-lg border border-line-strong/40 bg-deep p-5 sm:p-8"
    >
      <h2 id="login-title" className="font-display text-2xl font-bold">
        Your account
      </h2>
      <p className="mt-2 text-sm text-muted">
        One login for everyone, including organisers. Your registration details stay
        private to your account.
      </p>

      <div className="mt-6">
        <label
          htmlFor="login-email"
          className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-muted"
        >
          Email
        </label>
        <input
          ref={inputRef}
          id="login-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "login-email-err" : undefined}
          onChange={(e) => {
            setEmail(e.target.value);
            setError("");
            setFailure("");
          }}
          className="mt-2 h-11 w-full rounded-md border border-field bg-void px-3 text-sm text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan aria-[invalid=true]:border-danger"
        />
        {error ? (
          <p id="login-email-err" className="mt-1 text-xs text-danger">
            {error}
          </p>
        ) : null}
      </div>

      <p
        ref={failureRef}
        tabIndex={-1}
        role="alert"
        className="mt-5 min-h-5 text-sm text-danger focus:outline-none"
      >
        {failure ? `Login failed: ${failure}` : ""}
      </p>

      <button
        type="submit"
        disabled={status === "sending"}
        className="hero-cta-primary mt-3 inline-flex h-12 items-center rounded-md px-6 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan disabled:opacity-60 sm:text-base"
      >
        {status === "sending" ? "Logging in…" : "Continue"}
      </button>
    </form>
  );
}
