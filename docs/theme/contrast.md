# Contrast Checker

Motor de verificación de contraste WCAG 2.1.

## Concepto

Verifica que los colores cumplan los estándares de accesibilidad para contraste.

## WCAG Levels

| Level | Ratio Mínimo | Uso |
|-------|--------------|-----|
| AAA | >= 7:1 | Texto normal (16px+) |
| AA | >= 4.5:1 | Texto normal, texto grande (14px bold+) |
| fail | < 4.5:1 | No cumple estándares |

## Funciones

### `hexToRgb(hex: string): [number, number, number]`

Convierte hexadecimal a RGB (0–255).

```typescript
hexToRgb('#ff0000')  // [255, 0, 0]
hexToRgb('00ff00')   // [0, 255, 0]
hexToRgb('#fff')     // [255, 255, 255]
```

### `relativeLuminance(hex: string): number`

Calcula la luminancia relativa según WCAG 2.1.

```typescript
relativeLuminance('#ffffff')  // 1.0
relativeLuminance('#000000')  // 0.0
relativeLuminance('#777777')  // ~0.245
```

**Fórmula**:
```
L = 0.2126 * R + 0.7152 * G + 0.0722 * B

Donde:
- Si sRGB <= 0.03928 → linear = sRGB / 12.92
- Si sRGB > 0.03928  → linear = ((sRGB + 0.055) / 1.055) ^ 2.4
```

### `contrastRatio(hex1: string, hex2: string): number`

Calcula el ratio de contraste entre dos colores.

```typescript
contrastRatio('#ffffff', '#000000')  // 21.0
contrastRatio('#ffffff', '#777777')  // ~4.64
contrastRatio('#777777', '#777777')  // 1.0
```

**Fórmula**:
```
ratio = (lighter + 0.05) / (darker + 0.05)
```

**Rango**: [1, 21]

### `wcagLevel(ratio: number): WcagLevel`

Determina el nivel WCAG basado en el ratio.

```typescript
wcagLevel(7.0)    // 'AAA'
wcagLevel(4.5)    // 'AA'
wcagLevel(3.0)    // 'fail'
wcagLevel(21.0)   // 'AAA'
```

### `formatRatio(ratio: number): string`

Formatea el ratio para display.

```typescript
formatRatio(4.5)    // '4.50:1'
formatRatio(21.0)   // '21.00:1'
formatRatio(1.0)    // '1.00:1'
```

## Uso

```typescript
import { contrastRatio, wcagLevel, formatRatio } from '@theme/contrast';

const ratio = contrastRatio('#000000', '#ffffff');
const level = wcagLevel(ratio);
const display = formatRatio(ratio);

console.log(`${display} → ${level}`);
// "21.00:1 → AAA"
```

## Ejemplo: Verificar Colores del Tema

```typescript
import { contrastRatio, wcagLevel } from '@theme/contrast';

function verifyThemeColors(text: string, background: string) {
  const ratio = contrastRatio(text, background);
  const level = wcagLevel(ratio);
  
  if (level === 'fail') {
    console.warn(`Contraste insuficiente: ${ratio.toFixed(2)}:1`);
    return false;
  }
  
  console.log(`Contraste OK: ${ratio.toFixed(2)}:1 (${level})`);
  return true;
}

verifyThemeColors('#5a5565', '#ffffff');  // OK (text on bg)
verifyThemeColors('#ffffff', '#044311');  // OK (white on primary)
```
