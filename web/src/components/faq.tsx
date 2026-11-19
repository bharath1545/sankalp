"use client";

import { useRef, useState } from "react";
import { faqItems } from "@/lib/faq";

/**
 * Section 9: FAQ. An accordion built on the WAI-ARIA pattern, with no extra dependency.
 * Each question is a button inside a heading. Up, Down, Home and End move between questions.
 * Any number of answers can be open at once.
 */
export function Faq() {
  const [open, setOpen] = useState<ReadonlySet<string>>(new Set());
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  const toggle = (id: string) =>
    setOpen((current) => {
      const next = new Set(current);
      if (!next.delete(id)) next.add(id);
      return next;
    });

  function onKeyDown(event: React.KeyboardEvent, index: number) {
    const last = faqItems.length - 1;
    const target =
      event.key === "ArrowDown"
        ? (index + 1) % faqItems.length
        : event.key === "ArrowUp"
          ? (index - 1 + faqItems.length) % faqItems.length
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? last
              : null;
    if (target === null) return;
    event.preventDefault();
    buttons.current[target]?.focus();
  }

  return (
    <section id="faq" className="scroll-mt-20 border-t border-line" data-testid="faq">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:py-20">
        <p className="lp-eyebrow">FAQ</p>
        <h2 className="lp-h2 max-w-2xl">Frequently asked questions</h2>

        <div className="mt-10 grid gap-3">
          {faqItems.map((item, i) => {
            const isOpen = open.has(item.id);
            const buttonId = `faq-q-${item.id}`;
            const panelId = `faq-a-${item.id}`;
            return (
              <div
                key={item.id}
                data-testid="faq-item"
                className="rounded-lg border border-line-strong/40 bg-deep"
              >
                <h3>
                  <button
                    ref={(el) => {
                      buttons.current[i] = el;
                    }}
                    id={buttonId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => toggle(item.id)}
                    onKeyDown={(e) => onKeyDown(e, i)}
                    className="flex w-full items-center justify-between gap-4 rounded-lg px-5 py-4 text-left font-display text-base font-bold leading-snug focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan sm:text-lg"
                  >
                    <span>{item.question}</span>
                    <span
                      aria-hidden="true"
                      className={`grid size-7 shrink-0 place-items-center rounded-md border border-line-strong/50 font-mono text-base text-cyan transition-transform ${isOpen ? "rotate-45" : ""}`}
                    >
                      +
                    </span>
                  </button>
                </h3>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  hidden={!isOpen}
                  className="px-5 pb-5 text-sm leading-relaxed text-muted sm:text-base"
                >
                  {item.answer}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
