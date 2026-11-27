"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { SessionUser } from "@/lib/session";

const initials = (user: SessionUser) =>
  (user.name?.trim() || user.email).slice(0, 2).toUpperCase();

const itemClass =
  "flex h-10 w-full items-center rounded-md px-3 text-left text-sm focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-cyan";

/** Account menu shown in the header after login. Disclosure pattern with Escape and outside click. */
export function ProfileMenu({
  user,
  onSignOut,
}: {
  user: SessionUser;
  onSignOut: () => void | Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative" data-testid="profile-menu">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label="Account menu"
        onClick={() => setOpen((o) => !o)}
        className="hero-cta-primary inline-flex size-10 items-center justify-center rounded-full font-mono text-xs font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan"
      >
        {initials(user)}
      </button>

      <div
        id={panelId}
        hidden={!open}
        className="absolute right-0 top-12 z-50 w-64 rounded-lg border border-line-strong/60 bg-deep p-2 shadow-xl"
      >
        <div className="border-b border-line px-3 pb-3 pt-2">
          <p className="truncate text-sm font-semibold">{user.name || user.email}</p>
          {user.name ? <p className="truncate text-xs text-muted">{user.email}</p> : null}
          {user.role === "admin" ? (
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-cyan">
              Admin
            </p>
          ) : null}
        </div>
        <ul className="mt-2 grid gap-1">
          <li>
            <span
              aria-disabled="true"
              className={`${itemClass} cursor-not-allowed justify-between text-muted`}
            >
              My profile <span className="font-mono text-[10px] uppercase">Soon</span>
            </span>
          </li>
          <li>
            <button
              type="button"
              onClick={async () => {
                setOpen(false);
                await onSignOut();
              }}
              className={`${itemClass} hover:bg-mid`}
            >
              Log out
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}
