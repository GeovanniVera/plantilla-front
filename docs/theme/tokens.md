# Theme Tokens

## Definición

Los tokens son constantes de diseño que se mapean a CSS variables.

### Type

```typescript
type TokenKey = keyof typeof defaultTokens;
// Resuelve a: 'primary' | 'secondary' | 'accent' | 'background' | 'surface' | 'text' | 'text-h' | 'border'
```

### Tokens Disponibles

| Token | Valor Default | CSS Variable | Descripción |
|-------|---------------|--------------|-------------|
| `primary` | `#044311` | `--primary` | Color primario de la marca |
| `secondary` | `#044311` | `--secondary` | Color secundario |
| `accent` | `#044311` | `--accent` | Color de acento |
| `background` | `#ffffff` | `--bg` | Fondo de página |
| `surface` | `#ffffff` | `--code-bg` | Fondo de superficies (cards, inputs) |
| `text` | `#5a5565` | `--text` | Color de texto principal |
| `text-h` | `#1a1525` | `--text-h` | Color de texto de headings |
| `border` | `#e4e2dc` | `--border` | Color de bordes |

## CSS Variables Derivadas

### Variantes Translúcidas

A partir de `accent` y `secondary`, se derivan variantes translúcidas:

```css
--accent-bg: rgba(r, g, b, 0.1)        /* Fondo sutil de acento */
--accent-border: rgba(r, g, b, 0.35)   /* Borde de acento */
--secondary-bg: rgba(r, g, b, 0.1)     /* Fondo sutil secundario */
```

### Paletas Semánticas

Para cada status (success, warning, danger, info), se generan 6 variantes:

| Sufijo | Uso | Contraste |
|--------|-----|-----------|
| `--{status}` | Iconos, dots | >= 3:1 vs superficies |
| `--{status}-strong` | Texto semántico | >= 4.5:1 vs bg + surface |
| `--{status}-bg` | Superficie suave | Tint sutil |
| `--{status}-border` | Borde de estado | >= 3:1 vs surface |
| `--{status}-row` | Lavado ultra-suave | Casi invisible |
| `--{status}-solid-fg` | Texto sobre base sólida | >= 4.5:1 vs base |

## Uso en CSS

```css
/* Directo desde tokens */
.miboton {
  background-color: var(--primary);
  color: var(--text);
  border: 1px solid var(--border);
}

/* Variantes translúcidas */
.alert {
  background-color: var(--accent-bg);
  border: 1px solid var(--accent-border);
}

/* Paletas semánticas */
.exito {
  color: var(--success-strong);
  background-color: var(--success-bg);
  border: 1px solid var(--success-border);
}

.error {
  color: var(--danger-strong);
  background-color: var(--danger-bg);
  border: 1px solid var(--danger-border);
}
```

## Uso en JavaScript

```typescript
import { useTheme } from '@theme/useTheme';

function MiComponente() {
  const { tokens } = useTheme();
  
  return (
    <div style={{ 
      backgroundColor: tokens.background,
      color: tokens.text 
    }}>
      Texto con color del tema
    </div>
  );
}
```

## Mapeo Token → CSS Variable

```typescript
export const tokenToVar: Record<TokenKey, string> = {
  primary: '--primary',
  secondary: '--secondary',
  accent: '--accent',
  background: '--bg',
  surface: '--code-bg',
  text: '--text',
  'text-h': '--text-h',
  border: '--border',
};
```
