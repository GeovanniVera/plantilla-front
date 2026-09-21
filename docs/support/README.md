# Módulos de soporte — Documentación

## Propósito

Inventario y mapa de dependencias de los módulos de soporte de la aplicación: configuración de entorno (`config`), internacionalización (`i18n`), librerías (`lib`), infraestructura de testing (`test`) y composición de la app (`app`). Sirve como punto de entrada para entender la infraestructura que sostiene a las features.

## Inventario de documentación

| Documento | Cubre | Ruta fuente |
|---|---|---|
| [config.md](config.md) | Variables de entorno, validación y defaults | `src/config/env.ts` |
| [i18n.md](i18n.md) | Configuración de i18next, mapas de error, locales | `src/lib/i18n/` |
| [lib.md](lib.md) | API client, token store y servicios | `src/lib/api/`, `src/lib/auth/` |
| [test.md](test.md) | Proyectos Vitest, setup, mocks MSW, cobertura | `vite.config.ts`, `src/test/` |
| [app.md](app.md) | Orden de providers, rutas, guards, layouts y estilos | `src/main.tsx`, `src/App.tsx`, `src/auth/`, `src/layouts/`, `src/styles/` |

> Complementario: la documentación detallada del cliente HTTP vive en [../api-client/README.md](../api-client/README.md).

## Mapa de dependencias entre módulos

```
config (src/config/env.ts)
  └── usado por: lib/api/interceptors/refresh.ts        (único consumidor real)

i18n (src/lib/i18n/)
  ├── config.ts  ── instancia i18next (side-effect en main.tsx)
  ├── errors.ts  ── usa ApiErrorCode de lib/api/types
  └── locales/es.json + en.json

lib (src/lib/)
  ├── api/client.ts        ── usa i18n/errors + auth/token-store
  ├── api/interceptors/refresh.ts ── usa api/client + auth/token-store + config/env
  ├── api/types/api-response.ts   ── contrato de tipos (fuente de verdad)
  ├── api/services/               ── usa api/client + api/types
  └── auth/token-store.ts   ── storage de tokens (local/sessionStorage)

test (src/test/)
  ├── setup.ts             ── jest-dom + MSW (mocks/handlers/auth.ts)
  └── consume el contrato de lib/api/types (parcialmente desincronizado, ver test.md)

app (src/main.tsx + src/App.tsx)
  ├── main.tsx  ── QueryClient + Router + ThemeProvider + ToastProvider
  ├── App.tsx   ── AuthProvider + ErrorBoundary + Suspense + rutas (guards/layouts)
  └── usa lib/i18n/config como side-effect
```

## Flujo de dependencias en una petición típica

1. `main.tsx` importa `lib/i18n/config` como side-effect (idioma disponible antes de renderizar).
2. Un servicio (`lib/api/services/auth.service.ts`) llama a `client.post(...)`.
3. `client.ts` consulta el token en memoria (`tokenManager`) y la expiración en `auth/token-store`.
4. Si expiró, `interceptors/refresh.ts` renueva con `config/env` + cookie HttpOnly.
5. Los errores se traducen vía `i18n/errors.ts` (mapea `ApiErrorCode` → clave `errors.*`).

## Deudas conocidas (resumen)

- **Config con dos fuentes de verdad**: `env.ts` vs lectura directa de `import.meta.env` en `client.ts` (ver [config.md](config.md#deudas-conocidas)).
- **Mocks MSW desincronizados** con el contrato `ApiResponse` actual (ver [test.md](test.md#deudas-conocidas)).
- **`es.json` en voseo rioplatense**, no neutral (ver [i18n.md](i18n.md#deudas-conocidas)).