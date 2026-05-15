export const X_FREE_MAX_GLYPHS = 280;

export type LengthOption = "short" | "medium" | "long";

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

  const mainMax = ctx.length === "short" ? 260 : X_FREE_MAX_GLYPHS;
  const shortMax = ctx.length === "short" ? 275 : X_FREE_MAX_GLYPHS;

  return {
    mainDraft: clampTextToMax(post.mainDraft, mainMax),
    shortVersion: clampTextToMax(post.shortVersion, shortMax),
  };
}
