# Arquitectura del módulo `theme`

El módulo sigue un flujo de una sola dirección: **init → aplicar al DOM → persistir**. `ThemeProvider` es el único orquestador; los demás archivos son piezas desacopladas (tokens, contraste, semántica, persistencia).

## Flujo de datos

```
ThemeProvider (montaje)
  │
  ├─ 1. INIT (useState)
  │     loadSaved() → {...defaultTokens, ...saved}   ← merge: guardado gana
  │
  ├─ 2. APLICAR AL DOM (useEffect [tokens])
  │     applyTokensToDOM(tokens)
  │       ├─ 8 variables base          (tokenToVar)
  │       ├─ 3 variables translúcidas  (--accent-bg, --accent-border, --secondary-bg)
  │       └─ 24 variables semánticas   (4 estados × 6 roles)
  │
  └─ 3. PERSISTIR (useEffect [tokens], separado del paso 2)
        saveSaved(tokens)
```

Los dos `useEffect` dependen del mismo estado `tokens` pero están separados a propósito: aplicar al DOM y persistir son side effects independientes.

### 1. Init

`useState` inicializa el estado leyendo el tema guardado (`loadSaved()`) y haciendo merge con los tokens por defecto:

```ts
const saved = loadSaved();
return { ...defaultTokens, ...saved };
```

El merge garantiza que un tema guardado parcialmente (p. ej. solo `primary`) no rompa el resto de tokens.

### 2. Aplicar al DOM

`applyTokensToDOM` escribe directamente en `document.documentElement.style`:

- **8 variables base**: cada entrada de `tokenToVar` (`--primary`, `--secondary`, `--accent`, `--bg`, `--code-bg`, `--text`, `--text-h`, `--border`).
- **3 variables translúcidas** derivadas de los tokens:
  - `--accent-bg` → `rgba(accent, 0.1)`
  - `--accent-border` → `rgba(accent, 0.35)`
  - `--secondary-bg` → `rgba(secondary, 0.1)`
- **24 variables semánticas**: por cada estado en `SEMANTIC_BASES` (success, warning, danger, info), `deriveSemanticPalette` genera una paleta contra las superficies resueltas (`tokens.surface`, `tokens.background`) y se escriben 6 variables:

| Sufijo | Rol |
|---|---|
| `--success`, `--warning`, `--danger`, `--info` | `base` — color gráfico del estado |
| `--*-strong` | `strong` — texto semántico |
| `--*-bg` | `bg` — superficie sólida suave |
| `--*-border` | `line` — borde con estado |
| `--*-row` | `row` — wash ultra-suave |
| `--*-solid-fg` | `solidForeground` — texto sobre botones sólidos |

Total: 4 estados × 6 roles = 24 variables.

### 3. Persistir

Un segundo `useEffect` llama a `saveSaved(tokens)` cada vez que el estado cambia. La escritura es atómica vía el adaptador de persistencia (ver [persistence.md](./persistence.md)).

## API expuesta por el contexto

`ThemeContext` (valor memoizado con `useMemo`) expone:

| Miembro | Tipo | Descripción |
|---|---|---|
| `tokens` | `TokenValues` | Mapa completo `Record<TokenKey, string>` vigente |
| `setColor` | `(variable: TokenKey, value: string) => void` | Actualiza un token; dispara re-aplicación y re-persistencia |
| `resetTheme` | `() => void` | Limpia el storage y restaura `{...defaultTokens}` |

`useTheme()` es el hook de acceso; lanza `Error` fuera de `<ThemeProvider>`.

## Nota: sistema light-only

**No existe modo oscuro.** No hay `prefers-color-scheme`, ni `data-theme`, ni toggle en todo el módulo `theme` ni en `src/index.css` (que solo define un `:root` fijo). El sistema es light-only por diseño actual: `ThemeProvider` sobreescribe las mismas variables con los mismos tokens siempre, independientemente de la preferencia del sistema operativo.

## Dependencias entre módulos

```
ThemeProvider.tsx ──► tokens.ts (defaultTokens, tokenToVar)
            ├──────► persistence.ts (loadTheme, saveTheme, resetTheme)
            ├──────► semantic.ts (deriveSemanticPalette, SEMANTIC_BASES)
            └──────► theme-context.ts (ThemeContext)
useTheme.ts ───────► theme-context.ts
semantic.ts ───────► contrast.ts (contrastRatio)   ← contraste es la única autoridad WCAG
persistence.ts ────► tokens.ts (solo tipos, TokenKey)
```

## Deuda conocida

- El paso 2 sobreescribe `--code-bg` (default CSS `#f6f5f1` en `:root`) con `tokens.surface = '#ffffff'`: la variable del bloque de código de la app queda gobernada por el token `surface`, no por el CSS. Detalle en [tokens.md](./tokens.md).