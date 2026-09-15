import { describe, it, expect } from 'vitest';
import { contrastRatio, wcagLevel, formatRatio } from './contrast';

describe('contrastRatio', () => {
  it('returns 1 for same colors', () => {
    expect(contrastRatio('#000000', '#000000')).toBe(1);
    expect(contrastRatio('#ffffff', '#ffffff')).toBe(1);
  });

  it('returns max ratio for black vs white', () => {
    const ratio = contrastRatio('#000000', '#ffffff');
    expect(ratio).toBeCloseTo(21, 0);
  });

  it('is commutative', () => {
    const a = contrastRatio('#ff0000', '#00ff00');
    const b = contrastRatio('#00ff00', '#ff0000');
    expect(a).toBe(b);
  });

  it('handles colors without # prefix', () => {
    const ratio = contrastRatio('000000', 'ffffff');
    expect(ratio).toBeCloseTo(21, 0);
  });
});

describe('wcagLevel', () => {
  it('returns AAA for ratio >= 7', () => {
    expect(wcagLevel(7)).toBe('AAA');
    expect(wcagLevel(21)).toBe('AAA');
  });

  it('returns AA for ratio >= 4.5 but < 7', () => {
    expect(wcagLevel(4.5)).toBe('AA');
    expect(wcagLevel(6.99)).toBe('AA');
  });

  it('returns fail for ratio < 4.5', () => {
    expect(wcagLevel(4.49)).toBe('fail');
    expect(wcagLevel(1)).toBe('fail');
  });
});

describe('formatRatio', () => {
  it('formats ratio with 2 decimal places', () => {
    expect(formatRatio(4.5)).toBe('4.50:1');
    expect(formatRatio(21)).toBe('21.00:1');
  });

  it('rounds to 2 decimal places', () => {
    expect(formatRatio(4.56789)).toBe('4.57:1');
  });
});
