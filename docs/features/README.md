# Features

Funcionalidades de negocio del proyecto plantilla-front.

## Inventario

| Feature | Estado | Descripción |
|---------|--------|-------------|
| `settings/` | ✅ Implementada | Configuración de brand colors |
| `dashboard/` | 🔲 No implementada | Dashboard principal |
| `profile/` | 🔲 No implementada | Gestión de perfil |
| `landing/` | 🔲 No implementada | Página de aterrizaje |

**Nota**: Este es un proyecto plantilla, no una aplicación completa. Solo `settings/` está implementada.

## Arquitectura

```
features/
└── settings/
    ├── BrandColorSettings.tsx      ← Orquestador principal
    ├── BrandColorSettings.module.css
    ├── ThemePreview.tsx            ← Vista previa en vivo
    ├── ThemePreview.module.css
    ├── ContrastChecker.tsx         ← Validador WCAG 2.1
    └── ContrastChecker.module.css
```

## Documentación

- [Settings](./settings.md) — Configuración de brand colors y theming

## Patrones de Diseño

| Patrón | Aplicación |
|--------|------------|
| Feature-Sliced (light) | Cada feature encapsula funcionalidad |
| Container-Presentational | BrandColorSettings (container) → ThemePreview + ContrastChecker (presentational) |
| Context + Provider | ThemeContext + ThemeProvider |
| Adapter Pattern | persistence.ts (intercambiable) |
| Lazy Loading | Route-level |
| CSS Modules | Estilos aislados por componente |
| WCAG Compliance | Validación automática de contraste |

## Dependencias Comunes

- `@theme/*` — Hooks y utilidades del tema
- `@components/*` — Design system
- `@hooks/*` — Hooks personalizados

## Crear Nueva Feature

1. Crear directorio en `src/features/nombre-feature/`
2. Crear componente orquestador (container)
3. Crear componentes presentacionales
4. Agregar route en `src/routes/`
5. Envolver con `ProtectedRoute` si es necesario
6. Agregar i18n para strings

## Nota: Déudito Técnico

Los strings en `settings/` están hardcodeados en español. Para internacionalización, hay que migrarlos a i18n keys.
