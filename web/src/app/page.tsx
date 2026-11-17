import { ThemeToggle } from "@/components/theme-toggle";

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col items-start gap-4 p-6">
      <ThemeToggle />
      <h1 className="font-display text-4xl font-bold">Sankalp’26</h1>
      <p className="text-muted">Rebuild in progress.</p>
    </main>
  );
}
