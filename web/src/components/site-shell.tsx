import { Dock } from "./dock";
import { Footer } from "./footer";
import { Header } from "./header";
import { SmoothScroll } from "./smooth-scroll";

/** Page frame: skip link, header, main content, footer. */
export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-yellow px-4 py-2 font-medium text-[#0d0d0d] focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <SmoothScroll />
      <Header />
      <main id="main" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <Footer />
      <Dock />
    </>
  );
}
