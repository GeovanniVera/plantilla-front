# Tokens de color

`tokens.ts` define los 8 tokens por defecto del sistema y su mapeo a CSS variables. Es la única fuente de verdad de los colores base del tema.

## Los 8 tokens

| Token (`TokenKey`) | Default | CSS variable | Uso esperado |
|---|---|---|---|
| `primary` | `#044311` | `--primary` | Color primario de marca |
| `secondary` | `#044311` | `--secondary` | Color secundario de marca |
| `accent` | `#044311` | `--accent` | Color de acento |
| `background` | `#ffffff` | `--bg` | Fondo de página |
| `surface` | `#ffffff` | `--code-bg` | Superficie elevada (⚠ ver nota) |
| `text` | `#5a5565` | `--text` | Texto base |
| `text-h` | `#1a1525` | `--text-h` | Texto de encabezados (ink) |
| `border` | `#e4e2dc` | `--border` | Bordes |

Tipos exportados:

```ts
export const defaultTokens = { ... } as const;
export type TokenKey = keyof typeof defaultTokens;        // 'primary' | 'secondary' | ... | 'border'
export const tokenToVar: Record<TokenKey, string>;        // token → nombre de CSS variable
```

> Nota: los tres tokens de marca (`primary`, `secondary`, `accent`) son idénticos por defecto (`#044311`). Los tokens están duplicados en el default; la arquitectura permite diferenciarlos, pero hoy no lo hace.

## Cómo `setColor` aplica un token

`setColor(variable: TokenKey, value: string)` (expuesto por `ThemeContext`) actualiza el estado `tokens` con un merge parcial:

```ts
setTokens((prev) => ({ ...prev, [variable]: value }));
```

El cambio de estado dispara los dos `useEffect` de `ThemeProvider`:

1. `applyTokensToDOM` escribe el nuevo valor en la CSS variable correspondiente (vía `tokenToVar`) sobre `document.documentElement.style`.
2. `saveSaved` persiste el tema completo.

Como el merge es parcial, cambiar un solo token no afecta a los demás; las variables derivadas (`--accent-bg`, `--accent-border`, `--secondary-bg` y las 24 semánticas) se recalculan en cada aplicación porque dependen de `tokens.accent`, `tokens.secondary`, `tokens.surface` y `tokens.background`.

## Nota: mapeo `surface` → `--code-bg`

El token `surface` mapea a la CSS variable `--code-bg` (naming debt: el nombre de la variable no refleja el concepto "superficie"). Consecuencia operativa:

- `src/index.css` define `:root { --code-bg: #f6f5f1; }`.
- Al montar, `ThemeProvider` sobreescribe `--code-bg` con `tokens.surface = '#ffffff'`.

Resultado: la variable queda gobernada por el token `surface`, no por el CSS — el bloque de código de la app (y cualquier componente que consuma `--code-bg`) muestra `#ffffff` aunque el CSS declare `#f6f5f1`. Es una divergencia intencional pero frágil: si se elimina el token, el CSS vuelve a `#f6f5f1`.

## Referencias

- Flujo completo: [architecture.md](./architecture.md)
- Derivación de paletas semánticas que consumen `surface` y `background`: [semantic.md](./semantic.md)
- Persistencia de tokens modificados: [persistence.md](./persistence.md)