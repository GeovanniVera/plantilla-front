# Semantic Palette Generator

Generador de paletas semánticas accesibles usando OKLCH como espacio de trabajo perceptual.

## Concepto

El generador toma 3 colores hex (status base, surface, background) y genera 6 variantes accesibles que cumplen WCAG 2.1.

## Input

```typescript
interface SemanticInput {
  baseHex: string;       // Color identitario del status (ej: #22c55e para success)
  surfaceHex: string;    // Surface resuelta (--code-bg)
  backgroundHex: string; // Background resuelto (--bg)
}
```

## Output

```typescript
interface SemanticPalette {
  base: string;           // Iconos/dots (>= 3:1 vs superficies)
  strong: string;         // Texto semántico (>= 4.5:1 vs bg + surface)
  bg: string;             // Superficie suave semántica
  line: string;           // Borde de estado (>= 3:1 vs surface)
  row: string;            // Lavado ultra-suave
  solidForeground: string; // Texto sobre base sólida (>= 4.5:1 vs base & strong)
}
```

## Bases por Status

```typescript
export const SEMANTIC_BASES: Record<string, string> = {
  success: '#22c55e',  // Verde
  warning: '#f59e0b',  // Amarillo
  danger:  '#ef4444',  // Rojo
  info:    '#3b82f6',  // Azul
};
```

## Pipeline de Conversión

```
hex → linear sRGB → Oklab (L, a, b) → OKLCH (L, C, H)
```

### Funciones de Conversión

```typescript
function hexToOklch(hex: string): Oklch
function oklchToHex({ L, C, H }: Oklch): string
function oklchToHexInGamut(color: Oklch): string  // Gamut mapping inteligente
```

## Algoritmo por Rol

### 1. `bg` (Superficie suave)

Toma `surfaceOk.L`, aplica ±0.02 según light/dark, fija `C=0.03`.

```
surfaceOk.L + 0.02 (light) o -0.02 (dark)
C = 0.03
H = status hue
```

**Resultado**: Tint suave del surface hacia el status hue.

### 2. `strong` (Texto semántico AA)

Busca L tal que `min(ratio_vs_bg, ratio_vs_surface) >= 4.5`.

```
Start: L = 0.75 (light) o L = 0.35 (dark)
C = min(base.C, 0.15)

Loop:
  ├─ Evaluar ratio
  ├─ Si >= 4.5 → return
  └─ Si < 4.5 → L += 0.01 o -= 0.01

Anti-mud:
  ├─ Si L llega a floor (0.45)
  ├─ Reduce C en 0.01
  └─ Reset L al band inicial

Max iteraciones: 200
```

### 3. `base` (Gráficos)

Busca L tal que `min(ratio_vs_bg, ratio_vs_surface) >= 3.0`.

```
L bounds: [0.6, 0.75]
C bounds: [0.09, 0.16]

Loop:
  ├─ Evaluar ratio
  ├─ Si >= 3.0 → return
  └─ Si < 3.0 → L += 0.01 o -= 0.01

Max iteraciones: 100
```

### 4. `line` (Borde de estado)

Interpola entre `bgL` y `strongL` hasta `ratio_vs_surface >= 3.0`.

```
mix = 0.35 (inicial)
delta = 0.08 (incremento)

Loop:
  ├─ L = bgL + (strongL - bgL) * mix
  ├─ Evaluar ratio
  ├─ Si >= 3.0 → return
  └─ Si < 3.0 → mix += delta

Max iteraciones: 10
```

### 5. `solidForeground` (Texto sobre base sólida)

Evalúa `#ffffff` vs `#1a1525` (INK) como candidatos.

```
Candidatos: [white, INK]

Para cada candidato:
  score = min(contrast_vs_base, contrast_vs_strong)

Si max_score >= 4.5 → return mejor candidato

Si no:
  Buscar nueva L para base donde exista par válido
  (±delta de 0.02 a 0.25)
```

### 6. `row` (Lavado ultra-suave)

```
L = bgL
C = 0.015
H = status hue
```

## Gamut Mapping

`oklchToHexInGamut` reduce chroma progresivamente para evitar colores fuera de gamut:

```typescript
function oklchToHexInGamut(color: Oklch): string {
  let { L, C, H } = color;
  
  while (gamutOverflow(linear) > 0.02 && C > 0.005) {
    C *= 0.9;  // Reducir chroma en 10%
    // Recalcular...
  }
  
  return linearToHex(linear);
}
```

**Ventaja**: Preserva la integridad perceptual del color vs clampar crudo.

## Constantes

```typescript
const TEXT_TARGET = 4.5;       // WCAG AA para texto
const GRAPHIC_TARGET = 3.0;    // WCAG AA para gráficos
const INK = '#1a1525';         // Tinta oscura del tema
const STRONG_L_FLOOR = 0.45;  // L mínimo para strong (anti-mud)
const BASE_L_BAND: [0.6, 0.75]; // Rango de L para base
```

## Ejemplo de Uso

```typescript
import { deriveSemanticPalette, SEMANTIC_BASES } from '@theme/semantic';

const palette = deriveSemanticPalette({
  baseHex: SEMANTIC_BASES.success,
  surfaceHex: '#ffffff',
  backgroundHex: '#f8f9fa',
});

console.log(palette);
// {
//   base: '#22c55e',
//   strong: '#15803d',
//   bg: '#f0fdf4',
//   line: '#86efac',
//   row: '#f0fdf4',
//   solidForeground: '#ffffff'
// }
```
