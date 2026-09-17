# Responsive

Hooks para diseño responsive: useMediaQuery y useIsMobile.

## useMediaQuery

### Params

`query: string` — cualquier CSS media query válida.

### Retorno

`boolean` — true si el media query matchea.

### Implementación

1. `useState` con valor inicial de `window.matchMedia(query).matches`
2. `useEffect` que agrega listener `change` al `MediaQueryList`
3. Limpia el listener al desmontar o cambiar `query`

### Dependencias

Solo `useState` y `useEffect` de React. Cero libs externas.

### Uso

```tsx
const isWide = useMediaQuery('(min-width: 1200px)');
const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
const hasHover = useMediaQuery('(hover: hover)');
const isPrint = useMediaQuery('print');
```

### Casos de Uso

| Caso | Query |
|------|-------|
| Desktop only | `(min-width: 1024px)` |
| Mobile only | `(max-width: 767px)` |
| Dark mode | `(prefers-color-scheme: dark)` |
| Touch device | `(hover: none)` |
| Print | `print` |
| Reduced motion | `(prefers-reduced-motion: reduce)` |

---

## useIsMobile

### Params

`breakpoint?: number` — default `768`.

### Retorno

`boolean` — true si `window.innerWidth < breakpoint`.

### Implementación

Wrapper de `window.matchMedia` con `(max-width: ${breakpoint - 1}px)`.

### Uso

```tsx
const isMobile = useIsMobile();      // 768px default
const isMobile = useIsMobile(640);   // breakpoint custom
```

### Casos de Uso

```tsx
// Toggle layout
{isMobile ? <MobileLayout /> : <DesktopLayout />}

// Ocultar en móvil
{!isMobile && <Sidebar />}

// Cambiar columnas
const columns = isMobile ? 1 : 3;
```

---

## Diferencias

| Característica | useMediaQuery | useIsMobile |
|----------------|---------------|-------------|
| Flexibilidad | Cualquier query | Solo breakpoint |
| Complejidad | Media query completa | Wrapper simplificado |
| Uso general | ✅ | ❌ (solo móvil) |
| Ejemplo | `(min-width: 1200px)` | `768` |

---

## Nota: Barrel Export

⚠️ `useMediaQuery` e `useIsMobile` **NO están exportados** desde `src/hooks/index.ts`. Quien los necesite debe importarlos directamente:

```tsx
// ✅ Correcto
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useIsMobile } from '@/hooks/useIsMobile';

// ❌ Incorrecto (no funciona)
import { useMediaQuery } from '@/hooks';
```

Esto es inconsistente con los hooks de auth que sí están en el barrel.
