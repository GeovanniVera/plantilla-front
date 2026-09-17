# Support

Módulos de soporte del proyecto plantilla-front.

## Inventario

| Módulo | Archivo | Descripción |
|--------|---------|-------------|
| Config | `src/config/env.ts` | Variables de entorno tipadas |
| i18n | `src/lib/i18n/` | Internacionalización (i18next) |
| API Client | `src/lib/api/client.ts` | Cliente HTTP centralizado |
| Token Store | `src/lib/auth/token-store.ts` | Persistencia dual de tokens |
| Test Infra | `src/test/` | MSW handlers y setup |
| App | `src/App.tsx` | Orquestación principal |
| Routes | `src/routes/` | Definición de rutas |
| Layouts | `src/layouts/` | Estructura de página |
| Styles | `src/styles/` | Estilos globales |
| Entry | `src/main.tsx` | Punto de entrada |

## Documentación

- [Config](./config.md) — Variables de entorno tipadas
- [i18n](./i18n.md) — Internacionalización con i18next
- [Lib](./lib.md) — API Client, Token Store, servicios
- [Test](./test.md) — Infraestructura de testing con MSW
- [App](./app.md) — App.tsx, routes, layouts, styles, main.tsx

## Mapa de Dependencias

```
main.tsx
  ├── i18n/config ──→ i18next, react-i18next
  ├── App.tsx
  │     ├── auth (AuthProvider, guards)
  │     ├── routes/index ──→ ajustes.tsx
  │     ├── layouts/MainLayout ──→ auth, components/navigation
  │     └── layouts/AuthLayout
  └── providers: QueryClient, Theme, Toast

lib/api/client.ts
  ├── config/env
  ├── i18n/errors ──→ i18n/config ──→ i18next
  ├── auth/token-store
  └── interceptors/refresh.ts ──→ auth/token-store, config/env
```

## Patrones Arquitectónicos

| Patrón | Dónde se aplica |
|--------|-----------------|
| Fail-fast validation | `config/env.ts` |
| Service Layer | `lib/api/services/` |
| Interceptor Chain | `client.ts` |
| Singleton Promise | `interceptors/refresh.ts` |
| Dual Persistence | `auth/token-store.ts` |
| Code Splitting | `App.tsx` (lazy) |
| Guard Pattern | `ProtectedRoute`, `RequirePrivilege`, `GuestOnly` |
| Layout Routes | `AuthLayout`, `MainLayout` |
| Design Tokens | `index.css` + `tailwind.css` |
| Contract Testing | MSW handlers |
| Type Guards | `isApiSuccess()`, `isApiError()` |
| Adapter Pattern | `authStorage` |
