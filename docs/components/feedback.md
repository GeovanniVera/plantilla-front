# Feedback (`src/components/feedback/`)

Retroalimentación visual: toasts, spinners y skeletons.

## Barrel (`feedback/index.ts`)

Exporta: `ToastProvider`, `useToast` (+ tipos `ToastItem`, `ToastVariant`, `ToastPosition`, `ToastAPI`, `ToastProviderProps`), `Skeleton` + 4 presets (`CardSkeleton`, `TableRowSkeleton`, `StatSkeleton`, `FormSkeleton`) y `Spinner`.

**No exporta** `Toast` (item interno, deep import no recomendado).

## ToastProvider

Proveedor global de toasts. Estado local + registro global (`registerToast`).

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `children` | `ReactNode` | — | Árbol de la app |
| `position` | `'top-right' \| 'top-center' \| 'bottom-right' \| 'bottom-center'` | `'top-right'` | Posición del contenedor |
| `maxVisible` | `number` | `3` | Máximo de toasts visibles |
| `defaultDuration` | `number` | `5000` | Duración de auto-cierre en ms |

- Renderiza el contenedor por **portal a `document.body`** con `z-[2000]`.
- Muestra `toasts.slice(-maxVisible)`: con más toasts que `maxVisible`, los más nuevos ganan.
- Al montar registra la API global (`registerToast`) y al desmontar la desregistra.

Se monta una sola vez en la raíz de la app (ver `src/main.tsx`).

## useToast

Hook de acceso a la API de toasts — **patrón singleton global, NO context**.

```tsx
const toast = useToast();
toast.success('Guardado correctamente');
toast.error('Error al guardar', { action: { label: 'Reintentar', onClick: retry } });
toast.warning('Cuidado', { duration: 8000 });
toast.info('Novedad');
toast.dismiss(id);
```

API (`ToastAPI`):

| Método | Firma |
|---|---|
| `success` / `error` / `warning` / `info` | `(message: string, options?: { duration?: number; action?: { label: string; onClick: () => void } }) => void` |
| `dismiss` | `(id: string) => void` |

Comportamiento:

- El registro es un **module-level `toastFn`** al que `ToastProvider` se suscribe al montar; el hook llama `toastFn[method](...)` directamente, sin context.
- ⚠️ **Silencioso sin provider**: si no hay `ToastProvider` montado, solo emite `console.warn('[Toast] No ToastProvider found in the tree.')` y retorna — no lanza.

## Toast (item interno)

El item renderizado por `ToastProvider` (no exportado por barrel):

- **Auto-close** con `duration` por item o el `defaultDuration` del provider.
- **Pause on hover**: al entrar el mouse pausa el timer; al salir lo reinicia.
- `action` opcional: botón con `label`/`onClick`.
- Animación de entrada (`animate-toast-in`) y **salida de 200ms** (`animate-toast-out`) antes de desmontar.
- `role="alert"`, `aria-live="polite"`, botón de cierre con `title="Cerrar"`.

## Spinner

Indicador de carga circular, CSS puro, sin dependencias.

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `size` | `'sm' \| 'md' \| 'lg' \| number` | `'md'` | `sm`=24, `md`=40, `lg`=64; o píxeles exactos |
| `color` | `'accent' \| 'white' \| 'current'` | `'accent'` | `accent` → `var(--accent)`; `white` → `#fff`; `current` → `currentColor` |
| `className` / `style` | — | — | Extras |

- `role="status"`, `aria-label="Cargando"` + texto `sr-only` "Cargando...".
- ⚠️ **Único CSS-in-JS crudo del sistema**: inyecta un `<style>` por render con keyframes nombrados por tamaño (`spinner-${px}`). No es un defecto funcional, pero es una anomalía deliberada respecto al resto del styling.

## Skeleton

Wrapper de `react-loading-skeleton` con CSS variables del theme.

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `variant` | `'text' \| 'circular' \| 'rectangular'` | `'text'` | Forma (circular → `circle`) |
| `width` / `height` | `number \| string` | — | Dimensiones |
| `count` | `number` | `1` | Cantidad de líneas |
| `className` / `style` | — | — | Extras |

Mapea `--base-color: var(--surface)` y `--highlight-color: var(--border-base)` para heredar el theme.

### Presets

| Preset | Props | Descripción |
|---|---|---|
| `CardSkeleton()` | — | Esqueleto de tarjeta de contenido |
| `TableRowSkeleton({ columns = 5 })` | `columns?: number` | Fila de tabla |
| `StatSkeleton()` | — | Tarjeta de estadística |
| `FormSkeleton({ fields = 4 })` | `fields?: number` | Formulario (labels + inputs + botón) |

```tsx
<Skeleton variant="circular" width={40} height={40} />
<TableRowSkeleton columns={6} />
```

## Gotchas

- `useToast` no lanza sin provider: solo `console.warn` (los consumidores pueden no darse cuenta del fallo silencioso).
- `ToastProvider` y `useToast` usan el mismo registro global: montar más de un provider a la vez hace que el último desregistre al anterior.
- `Toast` no está en el barrel; no importarlo directamente.
- `Spinner` inyecta `<style>` por render (keyframes por tamaño).