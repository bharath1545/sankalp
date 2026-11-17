import { vi } from "vitest";
import "@testing-library/jest-dom/vitest";

// Node 22+ ships an experimental global localStorage that hides jsdom's and is
// undefined without --localstorage-file. Use a simple in-memory Storage instead.
class MemoryStorage implements Storage {
  private data = new Map<string, string>();
  get length() {
    return this.data.size;
  }
  clear() {
    this.data.clear();
  }
  getItem(key: string) {
    return this.data.get(key) ?? null;
  }
  key(index: number) {
    return [...this.data.keys()][index] ?? null;
  }
  removeItem(key: string) {
    this.data.delete(key);
  }
  setItem(key: string, value: string) {
    this.data.set(key, String(value));
  }
}
vi.stubGlobal("localStorage", new MemoryStorage());
// Same reason: the loader reads sessionStorage, which Node 22+ hides too.
vi.stubGlobal("sessionStorage", new MemoryStorage());

// jsdom has no matchMedia; next-themes reads it.
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}
