# Build, Deploy y Ambientes — Semilla Tecnologica

## Build

### Comando de build

```bash
npm run build
```

Ejecuta: `tsc -b && vite build`

**Proceso:**
1. **TypeScript compilation** (`tsc -b`): Compila todos los archivos `.ts`/`.tsx` según `tsconfig.json`
2. **Vite build** (`vite build`): Bundling, minificación, code splitting

### Output del build

```
dist/
├── index.html          # HTML entry point
├── assets/
│   ├── index-[hash].js   # Bundle principal (code-split chunks)
│   ├── index-[hash].css  # Estilos compilados
│   └── ...               # Chunks lazy-loaded por ruta
└── ...
```

### Code splitting

Vite genera chunks automáticamente por:
- **Lazy routes**: Cada `React.lazy()` genera un chunk separado
- **React core**: `react`, `react-dom` en vendor chunk
- **React Router**: Chunk separado

Las rutas lazy están definidas en:
- `src/App.tsx` — Páginas de auth
- `src/routes/showcase.tsx` — Showcase de componentes
- `src/routes/ajustes.tsx` — Configuración
- `src/routes/examples.tsx` — Ejemplos

### Variables de entorno en build

| Variable | Uso en build | Archivo |
|----------|-------------|---------|
| `VITE_API_BASE` | URL base de API inyectada en bundle | `.env` |

⚠️ Las variables `VITE_*` se inyectan en tiempo de build, no de runtime. Se requiere rebuild para cambiar el valor.

## Preview

```bash
npm run preview
```

Sirve el build de producción en `http://localhost:4173` (puerto por defecto de Vite).

## Deploy

⚠️ POR CONFIRMAR: No hay configuración de deploy específica (Dockerfile, CI/CD, platform config).

### Opciones de deploy recomendadas

| Plataforma | Configuración requerida |
|-----------|------------------------|
| Vercel | `vercel.json` o auto-detect |
| Netlify | `netlify.toml` con `build = "npm run build"` |
| Cloudflare Pages | Build command: `npm run build`, output: `dist` |
| Docker | Multi-stage build con nginx para SPA |
| AWS S3 + CloudFront | Subir `dist/` a bucket S3 |

###SPA Routing

Para deploy en servidores que no soportan fallback automático, configurar rewrite:

```nginx
# nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

```toml
# netlify.toml
[[redirects]]
from = "/*"
to = "/index.html"
status = 200
```

## Ambientes

⚠️ No hay configuración multi-ambiente. Se espera crear:

| Ambiente | Variable `VITE_API_BASE` | Propósito |
|----------|--------------------------|-----------|
| Development | `/api` (mock local) | Desarrollo con datos mock |
| Staging | `https://staging-api.example.com/api` | QA y testing |
| Production | `https://api.example.com/api` | Producción |

## Scripts de package.json

```jsonc
{
  "dev": "vite",                    // Dev server + HMR
  "build": "tsc -b && vite build",  // Type-check + production build
  "lint": "oxlint",                 // Linting
  "preview": "vite preview",        // Preview production build
  "storybook": "storybook dev -p 6006",         // Storybook dev
  "build-storybook": "storybook build"          // Storybook estático
}
```

⚠️ No hay scripts de `test`, `lint:fix`, `format`, o `prepare`.

## Bundle analysis

Para analizar el tamaño del bundle:

```bash
# Instalar plugin de visualización
npm i -D rollup-plugin-visualizer

# Agregar a vite.config.ts
import visualizer from 'rollup-plugin-visualizer'
export default {
  plugins: [visualizer({ open: true })]
}
```

⚠️ POR CONFIRMAR: No hay `rollup-plugin-visualizer` configurado actualmente.

## Performance

### Optimizaciones aplicadas

1. **Lazy loading**: Todas las páginas usan `React.lazy()` + `Suspense`
2. **Code splitting**: Vite genera chunks separados por ruta
3. **CSS-first Tailwind**: Sin runtime JS para estilos
4. **ErrorBoundary**: Captura errores de lazy loading sin crash total

### Métricas pendientes

⚠️ No hay métricas de performance configuradas:
- Lighthouse CI
- Bundle size tracking
- Core Web Vitals monitoring
