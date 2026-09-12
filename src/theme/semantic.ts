/**
 * Semantic status color generator (phase 8D.2 design, 8D.3 implementation).
 *
 * Given a status identity color (base hue) and the resolved theme surfaces,
 * derives an accessible palette per role:
 *
 *   base            icons / dots / graphic elements        (>= 3:1 vs surfaces)
 *   strong          semantic text                          (>= 4.5:1 vs bg + surface)
 *   bg              soft solid semantic surface            (backdrop for strong)
 *   line            state-bearing border                   (>= 3:1 vs surface)
 *   row             ultra-soft wash                        (no own requirement)
 *   solidForeground accessible text on solid base buttons  (>= 4.5:1 vs base & strong)
 *
 * Generation happens in OKLCH: hue is preserved as the status identity,
 * chroma is bounded, lightness is the main contrast lever. Output is sRGB
 * hex so existing CSS variables keep working everywhere.
 */
import { contrastRatio } from './contrast';

// ─── Conversions ──────────────────────────────────────────

function hexToLinear(hex: string): [number, number, number] {
  const m = hex.replace('#', '').match(/^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  if (!m) return [0, 0, 0];
  // Normalize to 0..1 BEFORE applying the sRGB transfer function.
  return [
    toLinear(parseInt(m[1], 16) / 255),
    toLinear(parseInt(m[2], 16) / 255),
    toLinear(parseInt(m[3], 16) / 255),
  ];
}

function linearToHex(lin: [number, number, number]): string {
  const toSrgb = (c: number) => {
    const v = Math.max(0, Math.min(1, c));
    return Math.round(255 * (v > 0.0031308 ? 1.055 * v ** (1 / 2.4) - 0.055 : v * 12.92));
  };
  return '#' + lin.map((c) => toSrgb(c).toString(16).padStart(2, '0')).join('');
}

function linearToOklab([r, g, b]: [number, number, number]): {
  L: number;
  a: number;
  bAxis: number;
} {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return {
    L: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    a: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    bAxis: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  };
}

function oklabToLinear(L: number, a: number, bAxis: number): [number, number, number] {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * bAxis;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * bAxis;
  const s_ = L - 0.0894841775 * a - 1.291485548 * bAxis;
  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;
  return [
    +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

export interface Oklch {
  L: number;
  C: number;
  H: number;
}

export function hexToOklch(hex: string): Oklch {
  const { L, a, bAxis } = linearToOklab(hexToLinear(hex));
  const C = Math.sqrt(a * a + bAxis * bAxis);
  let H = (Math.atan2(bAxis, a) * 180) / Math.PI;
  if (H < 0) H += 360;
  return { L, C, H };
}

/** Amount of linear channels pushed out of [0,1] — gamut pressure measure. */
function gamutOverflow(lin: [number, number, number]): number {
  return Math.max(0, ...lin.map((c) => Math.max(-c, c - 1)));
}

export function oklchToHex({ L, C, H }: Oklch): string {
  const rad = (H * Math.PI) / 180;
  return linearToHex(oklabToLinear(L, C * Math.cos(rad), C * Math.sin(rad)));
}

/** Converts keeping hue/L; reduces chroma progressively while the color is
 * meaningfully out of sRGB (avoids large perceptual shifts from raw clamping). */
export function oklchToHexInGamut(color: Oklch): string {
  let { C } = color;
  let lin = oklabToLinear(
    color.L,
    C * Math.cos((color.H * Math.PI) / 180),
    C * Math.sin((color.H * Math.PI) / 180),
  );
  while (gamutOverflow(lin) > 0.02 && C > 0.005) {
    C *= 0.9;
    lin = oklabToLinear(
      color.L,
      C * Math.cos((color.H * Math.PI) / 180),
      C * Math.sin((color.H * Math.PI) / 180),
    );
  }
  return linearToHex(gamut_clip(lin));
}

// Local alias kept tiny; contrast.ts remains the single WCAG authority.
const gamut_clip = (lin: [number, number, number]) =>
  lin.map((c) => Math.max(0, Math.min(1, c))) as [number, number, number];

// ─── Roles / contracts ────────────────────────────────────
const TEXT_TARGET = 4.5;
const GRAPHIC_TARGET = 3.0;
const INK = '#1a1525';

/** Status identity colors — brand-independent by design (8D.2). */
export const SEMANTIC_BASES: Record<string, string> = {
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
}; // matches --text-h family (theme heading ink)
const STRONG_L_FLOOR = 0.45;
const BASE_L_BAND: [number, number] = [0.6, 0.75];

// ─── Generator ────────────────────────────────────────────
export interface SemanticInput {
  /** Status identity color (hue owner). */
  baseHex: string;
  /** Resolved surface under the control (e.g. --code-bg). */
  surfaceHex: string;
  /** Resolved page background (e.g. --bg). */
  backgroundHex: string;
}

export interface SemanticPalette {
  base: string;
  strong: string;
  bg: string;
  line: string;
  row: string;
  solidForeground: string;
}

/** Picks the foreground (white or theme ink) with maximum contrast on `bgHex`. */
export function chooseForeground(bgHex: string): string {
  const onWhite = contrastRatio('#ffffff', bgHex);
  const onInk = contrastRatio(INK, bgHex);
  return onWhite >= onInk ? '#ffffff' : INK;
}

/**
 * Derives an accessible semantic palette from a status identity color and
 * the resolved theme surfaces. Pure function — deterministic per inputs.
 */
export function deriveSemanticPalette(input: SemanticInput): SemanticPalette {
  const baseOk = hexToOklch(input.baseHex);
  const surfaceOk = hexToOklch(input.surfaceHex);
  const H = baseOk.H;
  const lightSurface = surfaceOk.L >= 0.5;

  // ── bg: soft solid tint of the surface toward the status hue ──
  const bgL = Math.max(0.15, Math.min(0.97, surfaceOk.L + (lightSurface ? 0.02 : -0.02)));
  const bg = oklchToHexInGamut({ L: bgL, C: 0.03, H });

  // ── strong: solve L until AA vs bg AND surface AND page background ──
  let strongL = lightSurface ? 0.75 : 0.35;
  let strongC = Math.min(baseOk.C, 0.15);
  const step = lightSurface ? -0.01 : 0.01;
  let strong = '';
  for (let guard = 0; guard < 200; guard++) {
    strong = oklchToHexInGamut({ L: strongL, C: strongC, H });
    const minRatio = Math.min(
      contrastRatio(strong, input.backgroundHex),
      contrastRatio(strong, input.surfaceHex),
      contrastRatio(strong, bg),
    );
    if (minRatio >= TEXT_TARGET) break;
    strongL += step;
    if ((lightSurface && strongL < STRONG_L_FLOOR) || (!lightSurface && strongL > 0.92)) {
      // Anti-mud: lighten/darken stalled — bleed off chroma and retry band.
      strongC = Math.max(0.04, strongC - 0.01);
      strongL = lightSurface ? 0.75 : 0.35;
    }
  }

  // ── base + line: graphic role (>=3:1) and state border ──
  let baseL = Math.max(BASE_L_BAND[0], Math.min(BASE_L_BAND[1], baseOk.L));
  let baseC = Math.max(0.09, Math.min(0.16, baseOk.C));
  let base = oklchToHexInGamut({ L: baseL, C: baseC, H });
  const baseMinRatio = () =>
    Math.min(contrastRatio(base, input.backgroundHex), contrastRatio(base, input.surfaceHex));
  let guard = 0;
  while (baseMinRatio() < GRAPHIC_TARGET && guard < 100) {
    // Light surfaces need a darker graphic; dark surfaces a lighter one.
    const nextL = baseL + (lightSurface ? -0.01 : 0.01);
    if (nextL < 0.3 || nextL > 0.92) break;
    baseL = nextL;
    base = oklchToHexInGamut({ L: baseL, C: baseC, H });
    guard++;
  }

  const lineOk = (mix: number) => ({
    L: bgL + (strongL - bgL) * mix,
    C: Math.max(0.04, strongC * mix),
    H,
  });
  let line = '';
  let mix = 0.35;
  for (let i = 0; i <= 10; i++) {
    line = oklchToHexInGamut(lineOk(mix));
    if (contrastRatio(line, input.surfaceHex) >= GRAPHIC_TARGET) break;
    mix += 0.08;
  }

  // ── base lightness + solidForeground co-solved ──
  // One foreground candidate must reach 4.5 vs BOTH base and strong.
  // Mid-tone bases host neither candidate -> slide base lightness away
  // from the dead zone (keeping hue, chroma band and the >=3:1 surface
  // contract) until a valid pair exists.
  type FgEval = { fg: string; score: number };
  const evaluate = (b: string): FgEval => {
    const onWhite = contrastRatio('#ffffff', b);
    const onInk = contrastRatio(INK, b);
    const vsWhite = Math.min(onWhite, contrastRatio('#ffffff', strong));
    const vsInk = Math.min(onInk, contrastRatio(INK, strong));
    return vsWhite >= vsInk ? { fg: '#ffffff', score: vsWhite } : { fg: INK, score: vsInk };
  };

  const initial = evaluate(base);
  let result = initial;
  if (initial.score < TEXT_TARGET) {
    outer: for (let delta = 0.02; delta <= 0.25; delta += 0.01) {
      for (const dir of [-1, 1]) {
        const trialL = baseL + dir * delta;
        if (trialL < 0.28 || trialL > 0.92) continue;
        const trial = oklchToHexInGamut({ L: trialL, C: baseC, H });
        if (
          Math.min(
            contrastRatio(trial, input.backgroundHex),
            contrastRatio(trial, input.surfaceHex),
          ) < GRAPHIC_TARGET
        )
          continue;
        const ev = evaluate(trial);
        if (ev.score >= TEXT_TARGET) {
          result = ev;
          base = oklchToHexInGamut({ L: trialL, C: baseC, H });
          break outer;
        }
      }
    }
  }
  const solidForeground = result.fg;

  // ── row: ultra-soft wash (half the chroma of bg) ──
  const row = oklchToHexInGamut({ L: bgL, C: 0.015, H });

  return { base, strong, bg, line, row, solidForeground };
}
