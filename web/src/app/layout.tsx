import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sankalp’26",
  description: "National-level 24-hour hackathon at AJIET Mangaluru, 27–28 Nov 2026.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
