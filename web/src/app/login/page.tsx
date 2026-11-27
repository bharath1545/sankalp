import type { Metadata } from "next";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = {
  title: "Log in · Sankalp’26",
  description: "Log in to your Sankalp’26 account.",
};

export default function LoginPage() {
  return (
    <div data-testid="login-page" className="mx-auto max-w-md px-4 pb-24 pt-28 sm:pt-32">
      <p className="lp-eyebrow">Account</p>
      <h1 className="lp-h2">Log in</h1>
      <div className="mt-8">
        <LoginForm />
      </div>
    </div>
  );
}
