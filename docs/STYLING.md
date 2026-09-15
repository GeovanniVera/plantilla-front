# Styling

## Stack

- **Tailwind CSS** v4.3.3 — utility-first
- **CSS Modules** — para componentes complejos (table, sidebar, calendar)
- **Variables CSS** — tokens de tema en `src/index.css`

## Configuración

### Tailwind

Configurado en `vite.config.ts` con plugin `@tailwindcss/vite`.

### Tema

Los tokens de color están en `src/theme/tokens.ts` y se inyectan como variables CSS.

## Convenciones

1. **Utilities primero**: Usar clases de Tailwind siempre que sea posible
2. **CSS Modules solo cuando**: El estilo es complejo (estados, animaciones, responsive avanzado)
3. **Naming**: `Componente.module.css` junto al componente
4. **Custom properties**: Para valores dinámicos del tema

## Familias de componentes

| Familia | Estilo | Ejemplo |
|---------|--------|---------|
| Primitives | Tailwind puro | Button, Input, Badge |
| Feedback | Tailwind | Toast, Spinner, Skeleton |
| Overlays | Tailwind + context | Modal, Drawer, ConfirmDialog |
| Navigation | CSS Modules + Tailwind | Sidebar, Breadcrumb, Tabs |
| Data Display | CSS Modules + Tailwind | Table, Calendar |
| Layout | Tailwind | Card, FormLayout, StatCard |

## Archivos CSS Modules

```
components/data-display/table/BaseTable.module.css
components/data-display/table/ExcelTable.module.css
components/data-display/calendar/Calendar.module.css
components/navigation/sidebar/Sidebar.module.css
components/primitives/Form.module.css
features/settings/BrandColorSettings.module.css
features/settings/ContrastChecker.module.css
features/settings/ThemePreview.module.css
layouts/AuthLayout.module.css
layouts/MainLayout.module.css
pages/ajustes/AjustesIndex.module.css
```

## Variables CSS del tema

Definidas en `src/index.css`:

```css
:root {
  --bg: ...;
  --surface: ...;
  --text: ...;
  --accent: ...;
  --danger: ...;
  --success: ...;
  --warning: ...;
  --info: ...;
}
```

## Modo oscuro

No soportado. El tema es configurado por el admin del backend y compartido entre clientes.
