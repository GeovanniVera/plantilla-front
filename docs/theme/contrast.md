# Motor de contraste WCAG 2.1

`contrast.ts` es la única autoridad de contraste del módulo. Implementa la luminancia relativa y el ratio de contraste según WCAG 2.1, más los niveles de cumplimiento AA/AAA y el formateo de ratios.

Referencia: https://www.w3.org/TR/WCAG21/#dfn-relative-luminance

## API pública

### `contrastRatio(hex1, hex2) => number`

Calcula el ratio de contraste entre dos colores hex:

```
(lighter + 0.05) / (darker + 0.05)
```

donde `lighter`/`darker` son las luminancias relativas ordenadas. El resultado es un número sin formato (p. ej. `21` para blanco/negro, `1` para colores idénticos).

```ts
contrastRatio('#ffffff', '#000000'); // 21
contrastRatio('#ffffff', '#ffffff'); // 1
```

### `wcagLevel(ratio) => 'AAA' | 'AA' | 'fail'`

Clasifica un ratio según los umbrales WCAG 2.1:

| Ratio | Nivel |
|---|---|
| ≥ 7.0 | `AAA` |
| ≥ 4.5 | `AA` |
| < 4.5 | `fail` |

```ts
wcagLevel(7);   // 'AAA'
wcagLevel(4.5); // 'AA'
wcagLevel(4.49); // 'fail'
```

### `formatRatio(ratio) => string`

Formatea el ratio a dos decimales con sufijo `:1`:

```ts
formatRatio(4.5333); // '4.53:1'
```

## Implementación interna (no exportada)

| Función | Rol |
|---|---|
| `hexToRgb(hex)` | Convierte hex → `[r, g, b]` (0-255) |
| `relativeLuminance(hex)` | Luminancia relativa (0 = negro, 1 = blanco); umbral de la función de transferencia sRGB: `0.03928` |

Fórmula de luminancia relativa (WCAG 2.1):

```
para cada canal c en [0,1]:
  c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4

L = 0.2126 * R + 0.7152 * G + 0.0722 * B
```

## Consumidores

| Consumidor | Uso |
|---|---|
| `semantic.ts` | Verifica los contratos de contraste por rol del generador OKLCH |
| tests | `contrast.test.ts` cubre los tres exports |

## Referencias

- Contratos de contraste que este motor valida: [semantic.md](./semantic.md)