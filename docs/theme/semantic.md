# Paletas semánticas (generador OKLCH)

`semantic.ts` deriva paletas de color accesibles para estados (success, warning, danger, info) a partir de un color identidad y las superficies resueltas del tema. La generación ocurre en el espacio de color **OKLCH**: el hue se conserva como identidad del estado, el croma está acotado y la luminosidad es la principal palanca de contraste. La salida es sRGB hex para que las CSS variables existentes sigan funcionando.

## API pública

### Conversiones

| Función | Firma | Descripción |
|---|---|---|
| `hexToOklch` | `(hex: string) => Oklch` | Convierte hex → `{ L, C, H }` |
| `oklchToHex` | `({ L, C, H }: Oklch) => string` | Convierte OKLCH → hex (clamp duro a sRGB) |
| `oklchToHexInGamut` | `({ L, C, H }: Oklch) => string` | Convierte reduciendo croma progresivamente hasta quedar dentro de sRGB (evita saltos perceptuales grandes del clamp crudo) |

```ts
export interface Oklch {
  L: number; // luminosidad
  C: number; // croma
  H: number; // hue en grados (0-360)
}
```

Las conversiones son manuales (hex → linear → OKLab → OKLCH y vuelta), sin librerías externas.

### Bases de estados

```ts
export const SEMANTIC_BASES: Record<string, string> = {
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
};
```

Son colores identidad **independientes de la marca** por diseño; sus tonos emparentan con la familia de `--text-h` (ink del tema).

### Generador

```ts
export interface SemanticInput {
  baseHex: string;        // color identidad del estado (dueño del hue)
  surfaceHex: string;     // superficie bajo el control (p. ej. --code-bg)
  backgroundHex: string;  // fondo de página (p. ej. --bg)
}

export interface SemanticPalette {
  base: string;            // gráficos: iconos, dots, elementos gráficos
  strong: string;          // texto semántico
  bg: string;              // superficie sólida suave (backdrop de strong)
  line: string;            // borde con estado
  row: string;             // wash ultra-suave
  solidForeground: string; // texto accesible sobre botones sólidos
}

export function deriveSemanticPalette(input: SemanticInput): SemanticPalette;
export function chooseForeground(bgHex: string): '#ffffff' | string; // '#ffffff' o INK ('#1a1525')
```

`deriveSemanticPalette` es **pura y determinista**: mismos inputs → misma paleta. `chooseForeground` elige entre blanco y tinta del tema el que maximiza contraste sobre `bgHex`.

## Contratos de contraste por rol

La generación resuelve cada rol contra un objetivo WCAG 2.1 (medido con `contrastRatio` de `contrast.ts`):

| Rol | Variable (`--<estado>-*`) | Requisito mínimo | Vs. |
|---|---|---|---|
| `base` | sin sufijo | ≥ 3:1 | superficies (bg y surface) |
| `strong` | `-strong` | ≥ 4.5:1 | bg, surface y `bg` de la paleta |
| `bg` | `-bg` | sin requisito propio | — (tinte suave hacia el hue del estado) |
| `line` | `-border` | ≥ 3:1 | surface |
| `row` | `-row` | sin requisito | — (wash ultra-suave, mitad de croma de `bg`) |
| `solidForeground` | `-solid-fg` | ≥ 4.5:1 | `base` y `strong` |

Mecanismos de resolución destacados:

- **`strong`**: resuelve la luminosidad por pasos hasta cumplir AA contra las tres superficies; si se estanca ("anti-mud"), reduce croma y reintenta en la banda.
- **`base`**: empieza en la banda de luminosidad `[0.6, 0.75]` y se aleja de la superficie hasta cumplir ≥ 3:1.
- **`solidForeground`**: co-resuelto con `base` — si ningún candidato (blanco/tinta) llega a 4.5:1 sobre `base`, desliza la luminosidad de `base` fuera de la zona muerta (manteniendo hue, banda de croma y el contrato ≥ 3:1) hasta que exista un par válido.

## Referencias

- Motor de contraste usado como autoridad WCAG: [contrast.md](./contrast.md)
- Consumo desde `ThemeProvider` (24 variables derivadas): [architecture.md](./architecture.md)