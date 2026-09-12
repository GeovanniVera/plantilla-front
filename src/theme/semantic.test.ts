import { describe, it, expect } from 'vitest';
import { deriveSemanticPalette, hexToOklch, oklchToHexInGamut } from './semantic';
import { contrastRatio } from './contrast';

// ─── Fixtures ─────────────────────────────────────────────
const STATUSES = {
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
};

const SURFACES = {
  lightBg: '#f6f5f1',
  lightSurface: '#edecea',
  darkBg: '#16171d',
  darkSurface: '#1f2028',
  white: '#ffffff',
  nearBlack: '#0a0a0c',
  grayLight: '#d4d4d8',
  grayDark: '#3f3f46',
};

function paletteFor(statusBase: string, surfaceHex: string, backgroundHex: string) {
  return deriveSemanticPalette({ baseHex: statusBase, surfaceHex, backgroundHex });
}

/** Full default-theme scenario (light surfaces + light page bg). */
function defaultLight(status: keyof typeof STATUSES) {
  return paletteFor(STATUSES[status], SURFACES.lightSurface, SURFACES.lightBg);
}
/** Full default-theme scenario (dark surfaces + dark page bg). */
function defaultDark(status: keyof typeof STATUSES) {
  return paletteFor(STATUSES[status], SURFACES.darkSurface, SURFACES.darkBg);
}

// ─── Conversion sanity ────────────────────────────────────
describe('oklch conversions', () => {
  it('round-trips a color within visual tolerance', () => {
    const original = '#22c55e';
    const back = oklchToHexInGamut(hexToOklch(original));
    // Round-trip through gamut-clamped OKLCH may shift 1/255 per channel.
    const dr = Math.abs(parseInt(back.slice(1, 3), 16) - 0x22);
    const dg = Math.abs(parseInt(back.slice(3, 5), 16) - 0xc5);
    const db = Math.abs(parseInt(back.slice(5, 7), 16) - 0x5e);
    expect(Math.max(dr, dg, db)).toBeLessThanOrEqual(2);
  });

  it('produces valid hex output', () => {
    for (const status of Object.keys(STATUSES) as Array<keyof typeof STATUSES & string>) {
      const p = defaultLight(status as keyof typeof STATUSES);
      for (const v of Object.values(p)) {
        expect(v).toMatch(/^#[0-9a-f]{6}$/i);
      }
    }
  });

  it('is deterministic', () => {
    const a = defaultLight('danger');
    const b = defaultLight('danger');
    expect(a).toEqual(b);
  });
});

// ─── Contrast contracts ───────────────────────────────────
describe('contrast contracts — light theme', () => {
  for (const status of Object.keys(STATUSES) as Array<keyof typeof STATUSES & string>) {
    it(`${status}: strong >= 4.5 vs bg and surface`, () => {
      const p = defaultLight(status);
      expect(contrastRatio(p.strong, p.bg)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(p.strong, SURFACES.lightSurface)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(p.strong, SURFACES.lightBg)).toBeGreaterThanOrEqual(4.5);
    });

    it(`${status}: base >= 3 vs bg and surface`, () => {
      const p = defaultLight(status);
      expect(contrastRatio(p.base, SURFACES.lightSurface)).toBeGreaterThanOrEqual(3);
      expect(contrastRatio(p.base, SURFACES.lightBg)).toBeGreaterThanOrEqual(3);
    });

    it(`${status}: line >= 3 vs surface`, () => {
      const p = defaultLight(status);
      expect(contrastRatio(p.line, SURFACES.lightSurface)).toBeGreaterThanOrEqual(3);
    });

    it(`${status}: solidForeground >= 4.5 vs base and strong`, () => {
      const p = defaultLight(status);
      expect(contrastRatio(p.solidForeground, p.base)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(p.solidForeground, p.strong)).toBeGreaterThanOrEqual(4.5);
    });
  }
});

describe('contrast contracts — dark theme', () => {
  for (const status of Object.keys(STATUSES) as Array<keyof typeof STATUSES & string>) {
    it(`${status}: strong >= 4.5 vs bg and surface`, () => {
      const p = defaultDark(status);
      expect(contrastRatio(p.strong, p.bg)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(p.strong, SURFACES.darkSurface)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(p.strong, SURFACES.darkBg)).toBeGreaterThanOrEqual(4.5);
    });

    it(`${status}: solidForeground >= 4.5 vs base`, () => {
      const p = defaultDark(status);
      expect(contrastRatio(p.solidForeground, p.base)).toBeGreaterThanOrEqual(4.5);
    });
  }
});

// ─── Extreme themes ───────────────────────────────────────
describe('extreme themes', () => {
  const cases: [string, string, string][] = [
    ['white bg + white surface', SURFACES.white, SURFACES.white],
    ['near-black bg + near-black surface', SURFACES.nearBlack, SURFACES.nearBlack],
    ['gray-light pair', SURFACES.grayLight, SURFACES.grayLight],
    ['gray-dark pair', SURFACES.grayDark, SURFACES.grayDark],
    ['bg close to success hue', '#eaf6ea', '#eaf6ea'],
    ['bg close to warning hue', '#fdf3e3', '#fdf3e3'],
  ];

  for (const [label, bgHex, surfaceHex] of cases) {
    for (const status of Object.keys(STATUSES) as Array<keyof typeof STATUSES & string>) {
      it(`${label} / ${status}: strong >= 4.5, solidForeground >= 4.5`, () => {
        const p = paletteFor(STATUSES[status], surfaceHex, bgHex);
        expect(contrastRatio(p.strong, p.bg)).toBeGreaterThanOrEqual(4.5);
        expect(contrastRatio(p.strong, surfaceHex)).toBeGreaterThanOrEqual(4.5);
        expect(contrastRatio(p.solidForeground, p.base)).toBeGreaterThanOrEqual(4.5);
      });
    }
  }
});

// ─── Warning hard case ────────────────────────────────────
describe('warning chroma discipline', () => {
  it('never emits a fluorescent yellow text (chroma bounded)', () => {
    const p = defaultLight('warning');
    const { C } = hexToOklch(p.strong);
    expect(C).toBeLessThanOrEqual(0.16);
  });

  it('does not collapse into mud (lightness floor respected)', () => {
    const p = defaultLight('warning');
    const { L } = hexToOklch(p.strong);
    expect(L).toBeGreaterThanOrEqual(0.45);
  });
});
