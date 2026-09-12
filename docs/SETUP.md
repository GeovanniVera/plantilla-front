# Guía de Instalación y Desarrollo — Semilla Tecnologica

## Requisitos previos

| Requisito | Versión mínima | Verificar con |
|-----------|---------------|---------------|
| Node.js | 18+ | `node --version` |
| npm | 9+ | `npm --version` |
| Git | 2.x | `git --version` |

## Instalación

```bash
# Clonar el repositorio
git clone <repo-url>
cd components

# Instalar dependencias
npm install
```

## Scripts de desarrollo

```bash
# Dev server (http://localhost:5173)
npm run dev

# Storybook (http://localhost:6006)
npm run storybook

# Linting
npm run lint

# Build para producción
npm run build

# Preview del build
npm run preview
```

## Credenciales mock

Para probar el sistema de autenticación:

| Email | Password | Rol | Verificado |
|-------|----------|-----|------------|
| `admin@test.com` | `admin123` | admin | ✅ |
| `editor@test.com` | `editor123` | editor | ✅ |
| `viewer@test.com` | `viewer123` | viewer | ✅ |
| `noverify@test.com` | `test123` | viewer | ❌ |

## Variables de entorno

Crear un archivo `.env` en la raíz:

```env
# URL base para la API (default: /api)
VITE_API_BASE=/api
```

⚠️ No hay archivos `.env` en el repositorio. Se requiere crear uno para cada ambiente.

## Estructura de development

### Storybook

Storybook es la herramienta principal para desarrollar componentes en aislamiento.

```bash
npm run storybook  # http://localhost:6006
```

**Addons disponibles:**
- `@storybook/addon-a11y` — Verificación de accesibilidad
- `@storybook/addon-docs` — Documentación auto-generada
- `@storybook/addon-vitest` — Integración con tests
- `@storybook/addon-mcp` — Integración MCP

**Historias disponibles:** 29 archivos en `src/components/*/stories/`

### HMR (Hot Module Replacement)

Vite soporta HMR nativo. Los cambios en componentes se reflejan instantáneamente sin recarga completa.

### Rutas de desarrollo

Las páginas de showcase están en `src/dev/` y son accesibles en las rutas:

- `/` — Inicio (índice de componentes)
- `/componentes/*` — Showcase de cada categoría
- `/examples/*` — Ejemplos reales
- `/ajustes/*` — Configuración (requiere privilegio `settings:manage`)

## Debugging

### DevTools de React

Vite incluye soporte para React DevTools. Instalar la extensión del navegador.

### TypeScript

```bash
# Type-check completo
tsc -b --noEmit
```

### Linting

```bash
npm run lint  # Ejecuta oxlint
```

## Troubleshooting

### Errores de tipos

```bash
# Limpiar build de TypeScript
rm -rf dist
tsc -b
```

### Cache de Vite

```bash
# Limpiar cache
rm -rf node_modules/.vite
```

### Storybook no inicia

```bash
# Reinstalar dependencias de Storybook
npx storybook@latest init --force
```

## IDE Setup

### VS Code (recomendado)

Extensiones recomendadas:
- **ESLint** — Linting en tiempo real
- **Tailwind CSS IntelliSense** — Autocompletado de clases
- **Pretty TypeScript Errors** — Errores más legibles

Configuración de workspace (`.vscode/settings.json`):
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

⚠️ POR CONFIRMAR: No hay `.vscode/` configurado en el repo.
