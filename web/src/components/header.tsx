import Link from "next/link";
import { siteConfig } from "@/lib/config";
import { HeaderAccount } from "./header-account";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-void/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
        <Link
          href="/"
          className="font-display text-lg font-bold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan"
        >
          {siteConfig.name}
        </Link>
        <div className="flex items-center gap-2">
          <HeaderAccount />
        </div>
      </div>
    </header>
  );
}
