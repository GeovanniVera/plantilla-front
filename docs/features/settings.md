# Feature: Marca visual (`src/features/settings/`)

Personalización de los colores de marca de la aplicación. **Solo componentes en la raíz de la carpeta** — sin servicios ni hooks propios: todo el estado vive en `src/theme/`.

## Estructura

```
src/features/settings/
├── BrandColorSettings.tsx    # Pickers para los 8 tokens de color
├── BrandColorSettings.module.css
├── ThemePreview.tsx          # Vista previa en vivo
├── ThemePreview.module.css
├── ContrastChecker.tsx       # Validador de contraste WCAG 2.1
└── ContrastChecker.module.css
```

## Componentes

### `BrandColorSettings`

Pickers (input `type="color"` + input hex validado con `/^#[0-9a-fA-F]{0,6}$/`) para los **8 tokens**: `primary`, `secondary`, `accent`, `background`, `surface`, `text`, `text-h`, `border`. Aplica los cambios **en vivo** vía `useTheme()` y ofrece "Restaurar valores por defecto" (`resetTheme`).

### `ThemePreview`

Tarjeta de ejemplo (título, párrafo, botones, badge, input) que refleja automáticamente los colores actuales del tema: preview en vivo del resultado.

### `ContrastChecker`

Validador de accesibilidad **WCAG 2.1** sobre **6 combinaciones** de pares foreground/background:

| Combinación | Par |
|---|---|
| Texto sobre Fondo | `--text` / `--bg` |
| Texto sobre Superficie | `--text` / `--code-bg` |
| Texto (títulos) sobre Fondo | `--text-h` / `--bg` |
| Fondo sobre Primario | `--bg` / `--primary` |
| Primario sobre Superficie | `--secondary` / `--code-bg` |
| Fondo sobre Acento | `--bg` / `--accent` |

Para cada par calcula el ratio (`contrastRatio`), lo formatea (`formatRatio`) y muestra el nivel (`wcagLevel`): `AAA` (≥ 7:1), `AA` (≥ 4.5:1) o `fail`.

## Backing: `src/theme/`

| Archivo | Responsabilidad |
|---|---|
| `ThemeProvider.tsx` | Aplica los tokens como CSS variables en `document.documentElement.style`; deriva variantes translúcidas de `accent` (`--accent-bg`, `--accent-border`) y `secondary` (`--secondary-bg`); genera la paleta semántica accesible (base/strong/bg/border/row/solid-fg) por estado. |
| `tokens.ts` | `defaultTokens` (8 tokens) y el mapeo token → CSS variable (`tokenToVar`). |
| `persistence.ts` | Persistencia en `localStorage` con clave **`brand-theme-v1`**. Expone `setStorageAdapter(adapter)` para swap futuro a un adaptador de API sin tocar el resto de la app. |
| `contrast.ts` | Luminancia relativa y ratio de contraste WCAG 2.1 (`contrastRatio`, `wcagLevel`, `formatRatio`). |
| `semantic.ts` | `deriveSemanticPalette` — genera la paleta semántica en OKLCH preservando el hue, con chroma acotada y lightness como palanca de contraste. |
| `useTheme.ts` / `theme-context.ts` | Acceso al contexto: `{ tokens, setColor, resetTheme }`. |

## Permisos

| Permiso | Uso |
|---|---|
| `settings.brand` | Gate de la ruta `/ajustes/colores` en `App.tsx` y de la card "Colores de marca" en `AjustesIndex`. |

## Consumidores

- Ruta `/ajustes/colores` (definida en `App.tsx`) → renderiza `BrandColorSettings` dentro de `RequirePrivilege privilege="settings.brand"`.
- `AjustesIndex` (`/ajustes`) → card de acceso gateada por `settings.brand`.

## Deudas conocidas

- **`settings.brand` es cliente-solo**: existe el tipo `ThemeResponse` en `src/lib/api/types/api-response.ts` (con `ThemeTokens`, `id`, `name`, `createdBy`, fechas), **pero no hay servicio de theme** en `src/lib/api/services/`. No hay endpoints de tema; la persistencia es únicamente `localStorage` (clave `brand-theme-v1`). El tipo `ThemeResponse` anticipa una API futura.
- La ruta `/ajustes/colores` **solo está definida en `App.tsx`**. El archivo muerto `src/routes/ajustes.tsx` (no importado) la duplica sin guards — ver deudas en `docs/pages/README.md`.