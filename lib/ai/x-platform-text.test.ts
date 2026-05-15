import { describe, expect, it } from "vitest";

import {
  clampPostStringsForX,
  glyphCount,
  xGlyphLimitFor,
  X_FREE_MAX_GLYPHS,
} from "@/lib/ai/x-platform-text";

describe("glyphCount", () => {
  it("counts astral plane code points as single glyphs", () => {
    expect(glyphCount("A🙂B")).toBe(3);
  });
});

describe("xGlyphLimitFor", () => {
  it("returns tightened caps for short length", () => {
    expect(xGlyphLimitFor("mainDraft", "short")).toBe(260);
    expect(xGlyphLimitFor("shortVersion", "short")).toBe(275);
  });

  it("returns 280 for medium and long", () => {
    expect(xGlyphLimitFor("mainDraft", "medium")).toBe(X_FREE_MAX_GLYPHS);
    expect(xGlyphLimitFor("shortVersion", "long")).toBe(X_FREE_MAX_GLYPHS);
  });
});

describe("clampPostStringsForX", () => {
  it("short length tightens main and short below 280", () => {
    const main = "x".repeat(400);
    const short = "y".repeat(400);
    const out = clampPostStringsForX(
      { mainDraft: main, shortVersion: short },
      { platform: "x", length: "short" },
    );
    expect(glyphCount(out.mainDraft)).toBeLessThanOrEqual(260);
    expect(glyphCount(out.shortVersion)).toBeLessThanOrEqual(275);
  });

  it("caps medium X posts at 280 glyphs", () => {
    const main = "m".repeat(500);
    const out = clampPostStringsForX(
      { mainDraft: main, shortVersion: main },
      { platform: "x", length: "medium" },
    );
    expect(glyphCount(out.mainDraft)).toBe(X_FREE_MAX_GLYPHS);
    expect(glyphCount(out.shortVersion)).toBe(X_FREE_MAX_GLYPHS);
  });

  it("does not change reddit posts", () => {
    const long = "z".repeat(500);
    const out = clampPostStringsForX(
      { mainDraft: long, shortVersion: long },
      { platform: "reddit", length: "short" },
    );
    expect(out.mainDraft).toBe(long);
  });
});
