import { act, render, screen } from "@testing-library/react";
import { Loader, LOADER_BOOT_SCRIPT, LOADER_SESSION_KEY } from "./loader";

/** A clock and a frame queue we drive by hand, so tests never wait 2.4 s. */
let clock = 0;
let frames: FrameRequestCallback[] = [];

function startLoader() {
  document.documentElement.classList.add("is-loading");
}

function tick(ms: number) {
  clock += ms;
  const pending = frames;
  frames = [];
  for (const frame of pending) frame(clock);
}

function setup() {
  Object.defineProperty(document, "readyState", {
    configurable: true,
    get: () => "loading",
  });
  return render(<Loader />);
}

beforeEach(() => {
  clock = 0;
  frames = [];
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
  vi.spyOn(performance, "now").mockImplementation(() => clock);
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    frames.push(callback);
    return frames.length;
  });
  vi.stubGlobal("cancelAnimationFrame", () => {});
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
  document.documentElement.className = "";
  sessionStorage.clear();
  window.location.hash = "";
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  document.documentElement.className = "";
});

describe("Loader", () => {
  it("stays out of the page when the boot script did not run", async () => {
    render(<Loader />);
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  });

  it("paints progress, holds at 92% until the page loads, then removes itself", async () => {
    startLoader();
    const { container } = setup();

    const bar = screen.getByRole("progressbar", { name: "Loading" });
    expect(bar).toHaveAttribute("aria-valuenow", "0");
    expect(container.querySelector(".ld-wm")).toHaveTextContent("Sankalp’26");
    expect(container.querySelector(".ld-fill")).toHaveStyle({ width: "0%" });

    act(() => tick(300));
    expect(Number(bar.getAttribute("aria-valuenow"))).toBeGreaterThan(0);

    // Long past the minimum, but the page has not reported load.
    for (let i = 0; i < 40; i += 1) act(() => tick(100));
    expect(Number(bar.getAttribute("aria-valuenow"))).toBeLessThanOrEqual(92);
    expect(document.documentElement).toHaveClass("is-loading");

    // The page finishes loading: the bar goes to 100 and fades out.
    act(() => {
      window.dispatchEvent(new Event("load"));
    });
    for (let i = 0; i < 20; i += 1) act(() => tick(16));
    expect(bar).toHaveAttribute("aria-valuenow", "100");

    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(document.getElementById("loader")).toHaveClass("out");
    expect(document.documentElement).not.toHaveClass("is-loading");

    act(() => {
      vi.advanceTimersByTime(700);
    });
    expect(document.getElementById("loader")).toBeNull();
  });

  it("finishes at the safety cap even when the page never reports load", () => {
    startLoader();
    setup();
    const bar = screen.getByRole("progressbar", { name: "Loading" });
    for (let i = 0; i < 460; i += 1) act(() => tick(16));
    expect(Number(bar.getAttribute("aria-valuenow"))).toBeGreaterThan(92);
  });

  it("takes the short path with reduced motion", () => {
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: query.includes("reduce"),
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }));
    startLoader();
    setup();
    const bar = screen.getByRole("progressbar", { name: "Loading" });

    act(() => {
      window.dispatchEvent(new Event("load"));
    });
    for (let i = 0; i < 30; i += 1) act(() => tick(16));
    expect(bar).toHaveAttribute("aria-valuenow", "100");
  });
});

describe("LOADER_BOOT_SCRIPT", () => {
  it("unlocks the page, shows the loader once per session and has a failsafe", () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    const html = document.documentElement;
    sessionStorage.clear();

    new Function(LOADER_BOOT_SCRIPT)();
    expect(html).toHaveClass("is-loading");
    expect(sessionStorage.getItem(LOADER_SESSION_KEY)).toBe("1");

    // A stalled bundle must not leave the page locked.
    vi.advanceTimersByTime(8000);
    expect(html).not.toHaveClass("is-loading");

    // Second visit in the same session skips the loader.
    new Function(LOADER_BOOT_SCRIPT)();
    expect(html).not.toHaveClass("is-loading");
  });

  it("does nothing when sessionStorage throws (private mode)", () => {
    vi.stubGlobal("sessionStorage", {
      getItem() {
        throw new Error("blocked");
      },
      setItem() {
        throw new Error("blocked");
      },
    });
    expect(() => new Function(LOADER_BOOT_SCRIPT)()).not.toThrow();
    expect(document.documentElement).not.toHaveClass("is-loading");
  });
});
