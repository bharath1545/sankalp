import { renderHook } from "@testing-library/react";
import { useSession } from "./session";

describe("useSession", () => {
  it("defaults to signed out", () => {
    const { result } = renderHook(() => useSession());
    expect(result.current.user).toBeNull();
    expect(() => result.current.signOut()).not.toThrow();
  });
});
