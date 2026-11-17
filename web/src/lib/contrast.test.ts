import { readFileSync } from "fs";
import { join } from "path";
import { contrastRatio } from "./contrast";

const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");

function tokens(selector: string): Record<string, string> {
  const start = css.indexOf(selector + " {");
  const body = css.slice(css.indexOf("{", start) + 1, css.indexOf("}", start));
  const out: Record<string, string> = {};
  for (const m of body.matchAll(/--([a-z-]+):\s*(#[0-9a-fA-F]{6});/g)) out[m[1]] = m[2];
  return out;
}

const dark = tokens(":root");
const light = { ...dark, ...tokens(':root[data-theme="light"]') };

const pairs: [string, string][] = [
  ["white", "void"],
  ["white", "mid"],
  ["muted", "void"],
  ["muted", "mid"],
  ["cyan", "void"],
  ["pink", "void"],
  ["danger", "void"],
  ["ok", "void"],
  ["warn", "void"],
];

describe.each([
  ["dark", dark],
  ["light", light],
])("%s theme contrast", (_name, t) => {
  it.each(pairs)("%s on %s is at least 4.5:1", (fg, bg) => {
    expect(contrastRatio(t[fg], t[bg])).toBeGreaterThanOrEqual(4.5);
  });
});

it("button text on signal yellow is at least 4.5:1", () => {
  expect(contrastRatio(light["on-grad"], light["yellow"])).toBeGreaterThanOrEqual(4.5);
});
