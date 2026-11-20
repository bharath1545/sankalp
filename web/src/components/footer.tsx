import { dateText, siteConfig } from "@/lib/config";

export function Footer() {
  return (
    <footer className="border-t border-line">
      {/* Extra bottom space so the fixed dock never covers the text. */}
      <div className="mx-auto max-w-6xl px-4 pb-28 pt-8 text-sm text-muted">
        <p>
          <b className="font-display text-white">{siteConfig.name}</b> · {dateText.event}{" "}
          · {siteConfig.venue.name}, {siteConfig.venue.address}
        </p>
        <p className="mt-2">Organised by {siteConfig.organiser}.</p>
      </div>
    </footer>
  );
}
