# Arquitectura

## Diagrama de capas

```mermaid
flowchart TB
    subgraph UI["🖥️ UI Layer"]
        Pages["pages/\n(auth, ajustes)"]
        Components["components/\n(primitives, feedback, overlays, layout, navigation, data-display)"]
        Features["features/\n(settings)"]
    end

    subgraph Domain["⚙️ Domain Layer"]
        Auth["auth/\n(provider, guards, hooks, context)"]
        Theme["theme/\n(tokens, semantic, contrast, provider)"]
        Hooks["hooks/\n(useAuth, useMediaQuery, useIsMobile)"]
    end

    subgraph Infra["🔌 Infrastructure Layer"]
        API["lib/api/\n(client, services, interceptors, types)"]
        AuthStore["lib/auth/\n(token-store)"]
        I18n["lib/i18n/\n(config, errors, locales)"]
        Config["config/\n(env)"]
    end

    subgraph Cross["🔄 Cross-cutting"]
        Routes["routes/\n(index, ajustes, examples)"]
        Layouts["layouts/\n(MainLayout, AuthLayout, ErrorLayout)"]
        TestMocks["test/mocks/\n(MSW server, handlers)"]
    end

    Pages --> Components
    Pages --> Auth
    Pages --> Theme
    Components --> Hooks
    Auth --> API
    Auth --> AuthStore
    API --> Config
    API --> I18n
    Routes --> Layouts
    Routes --> Pages
    TestMocks --> API

    classDef uiStyle fill:#dbeafe,stroke:#3b82f6
    classDef domainStyle fill:#fed7aa,stroke:#f97316
    classDef infraStyle fill:#e9d5ff,stroke:#a855f7
    classDef crossStyle fill:#bbf7d0,stroke:#22c55e

    class Pages,Components,Features uiStyle
    class Auth,Theme,Hooks domainStyle
    class API,AuthStore,I18n,Config infraStyle
    class Routes,Layouts,TestMocks crossStyle
```

## Flujo de una petición

```mermaid
sequenceDiagram
    participant C as Component
    participant H as React Query Hook
    participant S as Service
    participant CL as client.ts
    participant I as Interceptor
    participant API as Backend

    C->>H: useQuery / useMutation
    H->>S: authService.login(email, password)
    S->>CL: client.post('/auth/login', body)
    CL->>CL: isExpired()? → refresh si necesario
    CL->>CL: Inject Authorization header
    CL->>CL: Execute request interceptors
    CL->>API: POST /api/auth/login
    API-->>CL: Response
    CL->>CL: Execute response interceptors
    CL->>CL: Parse JSON → ApiResponse<T>

    alt 401 Unauthorized
        CL->>CL: tryRefreshToken()
        CL->>API: POST /auth/refresh
        API-->>CL: New tokens
        CL->>CL: Retry original request
    end

    CL-->>S: ApiResponse<T>
    S-->>H: { success, data, message }
    H-->>C: { data, isLoading, error }
```

## Tabla de responsabilidades

| Capa | Archivos | Responsabilidad |
|------|----------|-----------------|
| **UI** | `pages/`, `components/` | Renderizado, interacción del usuario |
| **Domain** | `auth/`, `theme/`, `hooks/` | Lógica de negocio, estado de aplicación |
| **Infrastructure** | `lib/api/`, `lib/auth/`, `lib/i18n/`, `config/` | Comunicación externa, persistencia |
| **Cross-cutting** | `routes/`, `layouts/`, `test/mocks/` | Navegación, estructura visual, testing |

## Decisiones arquitectónicas

1. **Fetch nativo con wrapper** — No Axios. `client.ts` abstrae fetch con interceptores, timeout, y refresh automático.
2. **React Query para server state** — No SWR. `@tanstack/react-query` para caching, dedup, y lifecycle.
3. **Auth centralizado** — `AuthProvider` + `GuestOnly`/`ProtectedRoute` guards. Token en memoria + localStorage.
4. **Tailwind CSS** — Utility-first con CSS Modules para casos complejos (table, sidebar).
5. **MSW para tests** — Mock Service Worker en tests unitarios. No se testea contra backend real.
6. **Storybook para documentación visual** — Cada primitive tiene stories con interacciones.
