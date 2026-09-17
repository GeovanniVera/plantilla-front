# Feedback

Componentes de retroalimentación: Toast, Spinner, Skeleton.

## ToastProvider + useToast

### ToastProvider Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `children` | `ReactNode` | required | Árbol de la app |
| `position` | `'top-right' \| 'top-center' \| 'bottom-right' \| 'bottom-center'` | `'top-right'` | Posición |
| `maxVisible` | `number` | `3` | Máximo de toasts visibles |
| `defaultDuration` | `number` | `5000` | Duración auto-close (ms) |

### useToast API

```typescript
{
  success: (message, options?) => void,
  error: (message, options?) => void,
  warning: (message, options?) => void,
  info: (message, options?) => void,
  dismiss: (id: string) => void,
}
```

### Toast Options

| Prop | Tipo | Descripción |
|------|------|-------------|
| `duration` | `number` | Override auto-close (ms) |
| `action` | `{ label, onClick }` | Botón de acción |

### Patrón de Diseño

**Módulo singleton** — `ToastProvider` registra la API en un closure (`registerToast`/`unregisterToast`), `useToast` lee de esa referencia. No usa React Context.

### Accesibilidad

- `role="alert"`
- `aria-live="polite"`

### Uso

```tsx
// En App.tsx
<ToastProvider position="top-right" maxVisible={3}>
  <App />
</ToastProvider>

// En cualquier componente
function MyComponent() {
  const toast = useToast();

  const handleSave = async () => {
    try {
      await save();
      toast.success('Guardado correctamente');
    } catch (error) {
      toast.error('Error al guardar', {
        action: { label: 'Reintentar', onClick: handleSave },
      });
    }
  };

  return <Button onClick={handleSave}>Guardar</Button>;
}
```

---

## Spinner

### Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `size` | `'sm' \| 'md' \| 'lg' \| number` | `'md'` | Tamaño (24/40/64px o custom) |
| `color` | `'accent' \| 'white' \| 'current'` | `'accent'` | Color del spinner |
| `className` / `style` | — | — | Override estilos |

### Tamaños

| Size | Pixels |
|------|--------|
| `sm` | 24px |
| `md` | 40px |
| `lg` | 64px |

### Accesibilidad

- `role="status"`
- `aria-label="Cargando"`
- `<span class="sr-only">` para screen readers

### Uso

```tsx
<Spinner size="sm" />
<Spinner size="lg" color="white" />
<Spinner size={48} color="current" />
```

### Nota Técnica

Genera `<style>` tags dinámicos por tamaño (CSS puro inline, no Tailwind).

---

## Skeleton

### Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `variant` | `'text' \| 'circular' \| 'rectangular'` | `'text'` | Forma |
| `width` / `height` | `number \| string` | — | Dimensiones |
| `count` | `number` | `1` | Número de líneas |
| `className` / `style` | — | — | Override |

### Sub-componentes Pre-armados

| Componente | Descripción |
|------------|-------------|
| `CardSkeleton` | Skeleton para tarjetas |
| `TableRowSkeleton({ columns })` | Skeleton para filas de tabla |
| `StatSkeleton` | Skeleton para estadísticas |
| `FormSkeleton({ fields })` | Skeleton para formularios |

### Uso

```tsx
// Básico
<Skeleton variant="text" width="80%" />
<Skeleton variant="circular" width={40} height={40} />
<Skeleton variant="rectangular" width="100%" height={200} />

// Múltiples líneas
<Skeleton count={3} variant="text" />

// Compuestos
<CardSkeleton />
<TableRowSkeleton columns={5} />
<FormSkeleton fields={4} />
```

### Dependencias

`react-loading-skeleton` (wrapper con CSS variables del design system).

---

## Ejemplo: Loading State

```tsx
function Dashboard() {
  const { data, isLoading } = useQuery(['dashboard'], fetchDashboard);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <StatSkeleton />
        <div className="grid grid-cols-3 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <TableRowSkeleton columns={5} />
      </div>
    );
  }

  return <DashboardContent data={data} />;
}
```

---

## Ejemplo: Error State con Toast

```tsx
function UserProfile() {
  const toast = useToast();
  const queryClient = useQueryClient();

  const updateProfile = useMutation(updateProfileApi, {
    onSuccess: () => {
      queryClient.invalidateQueries(['profile']);
      toast.success('Perfil actualizado');
    },
    onError: (error) => {
      toast.error('Error al actualizar perfil', {
        action: { label: 'Reintentar', onClick: () => updateProfile.mutate() },
      });
    },
  });

  return (
    <Form onSubmit={(v) => updateProfile.mutate(v)}>
      {/* ... */}
    </Form>
  );
}
```
