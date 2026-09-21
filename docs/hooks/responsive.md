# Hooks responsive (`useMediaQuery` y `useIsMobile`)

Hooks de detección de viewport definidos en `src/hooks/`. **No** se exportan por el barrel `src/hooks/index.ts`: impórtelos desde su archivo de origen.

## `useMediaQuery`

| | |
|---|---|
| Archivo | `src/hooks/useMediaQuery.ts` |
| Firma | `(query: string) => boolean` |
| Retorno | `true` si la media query coincide con el viewport actual |

```tsx
import { useMediaQuery } from '@/hooks/useMediaQuery';

const isDesktop = useMediaQuery('(min-width: 1024px)');
const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
```

Comportamiento:

- Estado inicial calculado con `typeof window !== 'undefined' ? window.matchMedia(query).matches : false` — seguro para SSR (devuelve `false` en el primer render del servidor).
- Se suscribe a cambios con `addEventListener('change', handler)` (API moderna de `matchMedia`).
- Re-suscribe cuando cambia `query` (dependencia del `useEffect`).

## `useIsMobile`

| | |
|---|---|
| Archivo | `src/hooks/useIsMobile.ts` |
| Firma | `(breakpoint = 768) => boolean` |
| Retorno | `true` si el ancho de pantalla es menor al breakpoint |

```tsx
import { useIsMobile } from '@/hooks/useIsMobile';

const isMobile = useIsMobile();          // breakpoint por defecto: 768
const isTablet = useIsMobile(1024);      // breakpoint personalizado
```

Comportamiento:

- Se implementa sobre `matchMedia('(max-width: ${breakpoint - 1}px)')`: con `breakpoint = 768` la query es `(max-width: 767px)`, por lo que en exactamente 768px devuelve `false` (considerado desktop).
- Guard `typeof window !== 'undefined'` en el estado inicial (SSR seguro).
- Re-evalúa al cambiar `breakpoint`.

## Comparación

| | `useMediaQuery` | `useIsMobile` |
|---|---|---|
| Entrada | Query CSS arbitraria | Breakpoint numérico en px |
| Default | — | `768` |
| Implementación | `matchMedia(query)` | `matchMedia('(max-width: N-1px)')` |
| Caso de uso | Cualquier media query (tema, motion, orientación) | Chequeo rápido mobile/desktop |

## Gotchas

- Ambos hooks devuelven `false` en el primer render SSR (guard `typeof window`), lo que puede causar un flash de contenido "desktop" en la hidratación.
- `useIsMobile(768)` es estrictamente `< 768px`; no use comparaciones `<=` asumiendo que 768 cuenta como mobile.
- Ninguno de los dos se exporta por el barrel: importe siempre desde su archivo (`@/hooks/useMediaQuery`, `@/hooks/useIsMobile`). Ver [Notas de uso y limitaciones](gaps.md).