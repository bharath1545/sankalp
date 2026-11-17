import Link from "next/link";
import { siteConfig } from "@/lib/config";
import { ThemeToggle } from "./theme-toggle";

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
          <ThemeToggle />
          {/* Placeholder. Becomes a link to /login, then a profile menu, in the login tasks. */}
          <button
            type="button"
            data-testid="login-button"
            className="h-10 rounded-md border border-line-strong px-4 text-sm font-medium text-white transition-colors hover:bg-mid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan"
          >
            Login
          </button>
        </div>
      </div>
    </header>
  );
}
