# Settings

Feature de configuración de brand colors y theming.

## Descripción

Permite al usuario personalizar los colores del tema en tiempo real con validación de accesibilidad WCAG 2.1.

## Archivos

| Archivo | Tipo | Propósito |
|---------|------|-----------|
| `BrandColorSettings.tsx` | Container | Orquestador principal — renderiza editor de tokens, preview y contrast checker |
| `BrandColorSettings.module.css` | CSS Module | Grid, color picker, hex input, botón reset |
| `ThemePreview.tsx` | Presentational | Vista previa en vivo — card con botones, badge e input |
| `ThemePreview.module.css` | CSS Module | Estilos del preview |
| `ContrastChecker.tsx` | Presentational | Validador WCAG 2.1 — evalúa 6 combinaciones fg/bg |
| `ContrastChecker.module.css` | CSS Module | Swatch, ratio display, level badges |

## Componentes

### BrandColorSettings (Container)

Itera sobre `defaultTokens` (8 keys) y renderiza:
- `<input type="color">` + `<input type="text">` por cada token
- Botón "Restaurar valores por defecto"
- `<ThemePreview />` y `<ContrastChecker />`

### ThemePreview (Presentacional)

Componente sin props ni estado — puramente estático. Usa CSS variables del tema para actualización en vivo:
- Eyebrow label
- Título
- Párrafo
- Botones primary/secondary
- Badge
- Input

### ContrastChecker (Presentacional)

Valida 6 combinaciones de contraste usando tokens reales:
1. Texto primario vs fondo
2. Texto secundario vs fondo
3. Texto de acento vs fondo
4. Texto primario vs superficie
5. Texto secundario vs superficie
6. Texto de acento vs superficie

## Dependencias

| Dependencia | Tipo | Uso |
|-------------|------|-----|
| `@theme/useTheme` | Custom hook | Acceso al ThemeContext |
| `@theme/tokens` | Constantes | defaultTokens, TokenKey |
| `@theme/contrast` | Utilidades puras | contrastRatio, wcagLevel, formatRatio |

**No usa**: React Query, servicios HTTP, hooks de auth, i18n.

## Data

| Dato | Fuente | Mecanismo |
|------|--------|-----------|
| Tokens actuales | ThemeContext | React Context |
| Persistencia | localStorage | persistence.ts (adapter pattern) |
| Valores por defecto | tokens.ts | Constante estática |

## Navegación

| Ruta | Componente | Protección |
|------|------------|------------|
| `/ajustes` | AjustesIndex | ProtectedRoute + RequirePrivilege |
| `/ajustes/colores` | BrandColorSettings | ProtectedRoute + RequirePrivilege |

## Internacionalización

⚠️ **No usa i18n**. Strings hardcodeados en español:
- "Primario", "Secundario", "Acento", etc.
- "Restaurar valores por defecto"
- "Vista previa del tema"
- "Validación de contraste"

## Patrones de Diseño

| Patrón | Aplicación |
|--------|------------|
| Container-Presentational | BrandColorSettings → ThemePreview + ContrastChecker |
| Context + Provider | ThemeContext + ThemeProvider |
| Adapter Pattern | persistence.ts (intercambiable) |
| CSS Modules | Estilos aislados por componente |
| WCAG Compliance | Validación automática de contraste |
| OKLCH Color Space | Generación de paleta semántica accesible |

## Ejemplo de Uso

```tsx
// La feature se renderiza automáticamente en /ajustes/colores
// No necesita props — todo el state viene del ThemeContext

function BrandColorSettings() {
  const { tokens, setColor, resetTheme } = useTheme();

  return (
    <div className={styles.container}>
      {Object.entries(defaultTokens).map(([key]) => (
        <div key={key}>
          <label>{tokenLabels[key]}</label>
          <input
            type="color"
            value={tokens[key as TokenKey]}
            onChange={(e) => setColor(key as TokenKey, e.target.value)}
          />
          <input
            type="text"
            value={tokens[key as TokenKey]}
            onChange={(e) => {
              if (/^#?[0-9a-fA-F]{0,6}$/.test(e.target.value)) {
                setColor(key as TokenKey, e.target.value);
              }
            }}
          />
        </div>
      ))}
      <button onClick={resetTheme}>Restaurar valores por defecto</button>
      <ThemePreview />
      <ContrastChecker />
    </div>
  );
}
```
