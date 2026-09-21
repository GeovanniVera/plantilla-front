# Módulo `theme` — Sistema de theming

El módulo `src/theme/` centraliza la definición, aplicación, derivación semántica y persistencia del tema visual de la aplicación. Es la única fuente de verdad de los tokens de color: el `ThemeProvider` los aplica al DOM como CSS variables y persiste los cambios del usuario.

## Cómo funciona en una línea

`ThemeProvider` inicializa los tokens (por defecto o guardados), los escribe como CSS variables en `document.documentElement` y persiste cada cambio — todo el sistema es **light-only** por diseño actual (ver [architecture.md](./architecture.md)).

## Quick start

1. Envolver la aplicación con `ThemeProvider`:

```tsx
import { ThemeProvider } from './theme/ThemeProvider';

function App() {
  return (
    <ThemeProvider>
      <YourApp />
    </ThemeProvider>
  );
}
```

2. Consumir el tema desde cualquier componente con `useTheme()`:

```tsx
import { useTheme } from './theme/useTheme';

function BrandBar() {
  const { tokens, setColor, resetTheme } = useTheme();

  return (
    <button onClick={() => setColor('primary', '#123456')}>
      Cambiar color primario
    </button>
  );
}
```

> `useTheme()` lanza un `Error` si se usa fuera de `<ThemeProvider>`.

## Mapa de archivos

| Archivo | Responsabilidad |
|---|---|
| `tokens.ts` | 8 tokens por defecto y su mapeo a CSS variables (`TokenKey`, `tokenToVar`) |
| `contrast.ts` | Motor WCAG 2.1: ratio de contraste y niveles AA/AAA |
| `semantic.ts` | Generador de paletas semánticas accesibles en OKLCH |
| `persistence.ts` | Persistencia del tema (strategy pattern sobre `ThemeStorage`) |
| `theme-context.ts` | Contexto de React y su tipo (`ThemeContextValue`, `TokenValues`) |
| `ThemeProvider.tsx` | Orquestador: init → aplicar al DOM → persistir |
| `useTheme.ts` | Hook de acceso al contexto |
| `contrast.test.ts`, `semantic.test.ts`, `persistence.test.ts`, `ThemeProvider.test.tsx` | Tests del módulo |

> No existe un barrel `index.ts` en `src/theme/`; los imports se hacen directamente desde cada archivo.

## Documentación

| Documento | Contenido |
|---|---|
| [architecture.md](./architecture.md) | Flujo de datos, variables derivadas, nota light-only |
| [tokens.md](./tokens.md) | Tabla de tokens, aplicación vía `setColor`, mapeo a CSS vars |
| [semantic.md](./semantic.md) | API del generador OKLCH y contratos de contraste por rol |
| [contrast.md](./contrast.md) | API del motor WCAG (`contrastRatio`, `wcagLevel`, `formatRatio`) |
| [persistence.md](./persistence.md) | `ThemeStorage`, `localStorageAdapter`, `setStorageAdapter` |

## Deudas conocidas

- `tokenToVar.surface` apunta a `--code-bg`: al montar, `ThemeProvider` sobreescribe la variable con `tokens.surface = '#ffffff'`, divergiendo del default CSS `#f6f5f1` (detalle en [tokens.md](./tokens.md)).
- No existe modo oscuro en ninguna capa del módulo (detalle en [architecture.md](./architecture.md)).
- `primary`, `secondary` y `accent` tienen el mismo valor por defecto (`#044311`).