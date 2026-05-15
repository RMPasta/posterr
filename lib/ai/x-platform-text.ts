export const X_FREE_MAX_GLYPHS = 280;

/** When length is "short", main draft is clamped below 280 to leave room for edits. */
export const X_SHORT_MAIN_MAX_GLYPHS = 260;

/** When length is "short", short version cap is slightly under 280 for safety. */
export const X_SHORT_SHORTVERSION_MAX_GLYPHS = 275;

export type LengthOption = "short" | "medium" | "long";

export function xGlyphLimitFor(
  field: "mainDraft" | "shortVersion",
  length: LengthOption,
): number {
  if (length !== "short") return X_FREE_MAX_GLYPHS;
  return field === "mainDraft" ? X_SHORT_MAIN_MAX_GLYPHS : X_SHORT_SHORTVERSION_MAX_GLYPHS;
}

export function glyphCount(s: string): number {
  return [...s].length;
}

export function clampTextToMax(s: string, max: number): string {
  if (glyphCount(s) <= max) return s;
  const chars = [...s];
  return chars.slice(0, max).join("");
}

export function clampPostStringsForX(
  post: { mainDraft: string; shortVersion: string },
  ctx: { platform: string; length: LengthOption },
): { mainDraft: string; shortVersion: string } {
  if (ctx.platform !== "x") return post;

  const mainMax = ctx.length === "short" ? X_SHORT_MAIN_MAX_GLYPHS : X_FREE_MAX_GLYPHS;
  const shortMax = ctx.length === "short" ? X_SHORT_SHORTVERSION_MAX_GLYPHS : X_FREE_MAX_GLYPHS;

  return {
    mainDraft: clampTextToMax(post.mainDraft, mainMax),
    shortVersion: clampTextToMax(post.shortVersion, shortMax),
  };
}
