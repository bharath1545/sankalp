import { render } from "@testing-library/react";
import Lenis from "lenis";
import { SmoothScroll } from "./smooth-scroll";

const { destroy, raf } = vi.hoisted(() => ({ destroy: vi.fn(), raf: vi.fn() }));

vi.mock("lenis", () => ({
  default: vi.fn(function () {
    return { raf, destroy };
  }),
}));

function mockReducedMotion(reduced: boolean) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: reduced && query.includes("reduce"),
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
}

beforeEach(() => {
  vi.mocked(Lenis).mockClear();
  destroy.mockClear();
});

describe("SmoothScroll", () => {
  it("starts Lenis and destroys it on unmount", () => {
    mockReducedMotion(false);
    const { unmount } = render(<SmoothScroll />);
    expect(Lenis).toHaveBeenCalledTimes(1);
    unmount();
    expect(destroy).toHaveBeenCalledTimes(1);
  });

  it("does nothing when reduced motion is preferred", () => {
    mockReducedMotion(true);
    render(<SmoothScroll />);
    expect(Lenis).not.toHaveBeenCalled();
  });
});
