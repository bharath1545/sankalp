"use client";

import Link from "next/link";
import { useSession } from "@/lib/session";
import { ProfileMenu } from "./profile-menu";

/** Login link when signed out, profile menu when signed in. */
export function HeaderAccount() {
  const { user, signOut } = useSession();
  if (user) return <ProfileMenu user={user} onSignOut={signOut} />;
  return (
    <Link
      href="/login"
      data-testid="login-button"
      className="inline-flex h-10 items-center rounded-md border border-line-strong px-4 text-sm font-medium text-white transition-colors hover:bg-mid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan"
    >
      Login
    </Link>
  );
}
