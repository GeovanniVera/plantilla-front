# Theme Module

Sistema de diseño y theming con generación de paletas semánticas accesibles.

## Visión General

El módulo Theme provee:
- **Tokens de diseño** con CSS variables
- **Theming dinámico** con persistencia automática
- **Paletas semánticas** generadas en OKLCH (success, warning, danger, info)
- **Verificación de contraste** WCAG 2.1 (AA/AAA)
- **Persistencia** via Strategy Pattern (localStorage, API remota, etc.)

## Estructura

```
src/theme/
├── ThemeProvider.tsx    # Orquestador: state + effects + DOM binding
├── theme-context.ts     # React Context definition
├── useTheme.ts          # Hook público de consumo
├── tokens.ts            # Definición de constantes y mapeo a CSS vars
├── persistence.ts       # Adaptador de persistencia (Strategy Pattern)
├── semantic.ts          # Generador de paletas semánticas en OKLCH
└── contrast.ts          # Motor WCAG 2.1 (luminancia + ratio)
```

## Quick Start

```tsx
// 1. Envolver la app con ThemeProvider
import { ThemeProvider } from '@theme/ThemeProvider';

<App>
  <ThemeProvider>
    <Router />
  </ThemeProvider>
</App>

// 2. Usar en componentes
import { useTheme } from '@theme/useTheme';

function MiComponente() {
  const { tokens, setColor, resetTheme } = useTheme();
  
  return (
    <div style={{ color: tokens.text }}>
      <p>Color primario: {tokens.primary}</p>
      <button onClick={() => setColor('primary', '#ff0000')}>
        Cambiar a rojo
      </button>
      <button onClick={resetTheme}>
        Resetear tema
      </button>
    </div>
  );
}
```

## Documentación

- [Arquitectura](./architecture.md) - Flujo de datos, effects, orquestación
- [Tokens](./tokens.md) - Tokens disponibles y CSS variables generadas
- [Semantic](./semantic.md) - Generador de paletas OKLCH
- [Contrast](./contrast.md) - Motor WCAG 2.1
- [Persistence](./persistence.md) - Strategy Pattern para persistencia

## CSS Variables Generadas

### Base (8)
```
--primary, --secondary, --accent, --bg, --code-bg, --text, --text-h, --border
```

### Derivadas (3)
```
--accent-bg, --accent-border, --secondary-bg
```

### Semánticas (24)
```
--success, --success-strong, --success-bg, --success-border, --success-row, --success-solid-fg
--warning, --warning-strong, --warning-bg, --warning-border, --warning-row, --warning-solid-fg
--danger,  --danger-strong,  --danger-bg,  --danger-border,  --danger-row,  --danger-solid-fg
--info,    --info-strong,    --info-bg,    --info-border,    --info-row,    --info-solid-fg
```

**Total: 35 CSS variables**

## Testing

```bash
npm run test -- src/theme/
```
