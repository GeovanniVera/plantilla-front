// WCAG 2.1 — Luminancia relativa y contraste
// https://www.w3.org/TR/WCAG21/#dfn-relative-luminance

/** Convierte hex a componentes RGB (0-255) */
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}

/** Calcula la luminancia relativa de un color (0 = negro, 1 = blanco) */
function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Calcula el ratio de contraste entre dos colores hex */
export function contrastRatio(hex1: string, hex2: string): number {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Nivel de cumplimiento WCAG */
export type WcagLevel = 'AAA' | 'AA' | 'fail';

export function wcagLevel(ratio: number): WcagLevel {
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  return 'fail';
}

/** Formatea el ratio a 2 decimales */
export function formatRatio(ratio: number): string {
  return `${ratio.toFixed(2)}:1`;
}
