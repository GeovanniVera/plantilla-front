# Estructura del Proyecto — Semilla Tecnologica

## Árbol de directorios comentado

```
/
├── public/                          # Assets estáticos servidos directamente
│   ├── 403.png                      # Imagen de página de acceso denegado
│   ├── 404.png                      # Imagen de página no encontrada
│   ├── 500.png                      # Imagen de error de servidor
│   ├── logo.svg                     # Logo de la aplicación
│   └── favicon.svg                  # Favicon del sitio
│
├── src/
│   ├── main.tsx                     # Entry point: monta React + providers
│   ├── App.tsx                      # Árbol de rutas (Routes + lazy loading)
│   ├── index.css                    # Reset global + fuentes + dark mode overrides
│   │
│   ├── api/                         # Capa HTTP centralizada
│   │   ├── client.ts                # Fetch wrapper con interceptores, JWT, 401/403
│   │   ├── auth.ts                  # API mock de auth (login, logout, me, etc.)
│   │   └── index.ts                 # Re-exports
│   │
│   ├── auth/                        # Sistema de autenticación
│   │   ├── context.tsx              # AuthContext (React context)
│   │   ├── provider.tsx             # AuthProvider (estado + login/logout/me)
│   │   ├── guards.tsx               # ProtectedRoute, RequirePrivilege, RequireRole, GuestOnly, RequireVerification
│   │   ├── hooks.ts                 # useAuth, useHasPrivilege, useHasAnyPrivilege, useHasRole
│   │   ├── storage.ts               # authStorage (localStorage adapter para tokens)
│   │   ├── types.ts                 # AuthState, AuthContextValue, User
│   │   ├── ForgotPasswordContext.tsx # Context del flujo forgot-password (3 pasos)
│   │   └── index.ts                 # Re-exports públicos
│   │
│   ├── theme/                       # Sistema de theming
│   │   ├── tokens.ts                # 8 design tokens (primary, secondary, accent, etc.)
│   │   ├── theme-context.ts         # ThemeContext + TokenValues type
│   │   ├── ThemeProvider.tsx         # Aplica tokens como CSS variables + paletas semánticas
│   │   ├── useTheme.ts              # Hook useTheme()
│   │   ├── semantic.ts              # Generador de paletas semánticas OKLCH (success/warning/danger/info)
│   │   ├── contrast.ts              # Cálculos de contraste WCAG (contrastRatio, wcagLevel)
│   │   ├── persistence.ts           # Adaptador de persistencia (localStorage, swappable)
│   │   └── semantic.test.ts         # Único archivo de tests unitarios
│   │
│   ├── components/                  # Design system completo
│   │   ├── primitives/              # Componentes atómicos base
│   │   │   ├── Button.tsx           # 4 variantes, 3 tamaños, 3 formas, 3 animaciones
│   │   │   ├── Badge.tsx            # Compound: Badge.Icon
│   │   │   ├── Input.tsx            # Shorthand + compound (Root/Control/StartAddon/EndAdornment/EndAction)
│   │   │   ├── Select.tsx           # Shorthand + compound (Root/Control/StartAddon)
│   │   │   ├── Checkbox.tsx         # Checkbox con label
│   │   │   ├── Radio.tsx            # Radio button (⚠️ sin forwardRef)
│   │   │   ├── Textarea.tsx         # Textarea multiline
│   │   │   ├── StatusDot.tsx        # Dot de estado con color
│   │   │   ├── Form.module.css      # Estilos compartidos de forms
│   │   │   ├── index.ts             # Re-exports
│   │   │   └── stories/             # Historias de Input, Select, etc.
│   │   │
│   │   ├── layout/                  # Componentes de layout
│   │   │   ├── Card.tsx             # Tarjeta contenedora
│   │   │   ├── StatCard.tsx         # Tarjeta de estadística
│   │   │   ├── FormLayout.tsx       # Layout para formularios
│   │   │   └── index.ts
│   │   │
│   │   ├── forms/                   # Sistema de formularios
│   │   │   ├── Form.tsx             # Formulario con validación
│   │   │   ├── FormField.tsx        # Campo individual con label/error
│   │   │   ├── useForm.ts           # Custom hook para form state
│   │   │   ├── FormContext.ts       # Context del form
│   │   │   ├── types.ts             # Tipos de Input, Select, etc.
│   │   │   └── index.ts
│   │   │
│   │   ├── data-display/            # Componentes de visualización de datos
│   │   │   ├── calendar/            # Sistema de calendario
│   │   │   │   ├── Calendar.tsx     # Calendario principal
│   │   │   │   ├── CalendarGrid.tsx # Grid de días
│   │   │   │   ├── CalendarHeader.tsx # Header con navegación
│   │   │   │   ├── CalendarList.tsx # Vista de lista
│   │   │   │   ├── CalendarView.tsx # Wrapper con selección de rango
│   │   │   │   ├── calendarHelpers.ts # Utilidades de fecha
│   │   │   │   ├── types.ts
│   │   │   │   └── stories/
│   │   │   │
│   │   │   └── table/               # Sistema de tablas
│   │   │       ├── BaseTable.tsx    # Tabla base con CSS Modules
│   │   │       ├── DataTable.tsx    # Tabla con filtros, paginación, sort
│   │   │       ├── ExcelTable.tsx   # Tabla editable tipo Excel
│   │   │       ├── excel-types.ts   # Tipos para ExcelTable
│   │   │       ├── hooks/           # Custom hooks de tabla
│   │   │       ├── parts/           # Sub-componentes de tabla
│   │   │       ├── types.ts
│   │   │       └── stories/
│   │   │
│   │   ├── navigation/              # Componentes de navegación
│   │   │   ├── sidebar/             # Sidebar completo
│   │   │   │   ├── Sidebar.tsx      # Root + compound (Header/Toggle/Nav/Footer)
│   │   │   │   ├── SidebarLogo.tsx  # Logo en sidebar
│   │   │   │   ├── NavItem.tsx      # Item de navegación
│   │   │   │   ├── NavGroup.tsx     # Grupo colapsable
│   │   │   │   ├── UserAvatar.tsx   # Avatar de usuario
│   │   │   │   ├── UserClock.tsx    # Reloj en sidebar
│   │   │   │   ├── context.ts       # SidebarContext
│   │   │   │   ├── types.ts
│   │   │   │   ├── Sidebar.module.css
│   │   │   │   └── stories/
│   │   │   │
│   │   │   ├── Tabs.tsx             # Tabs con 3 variantes
│   │   │   ├── Breadcrumb.tsx       # Breadcrumb responsive
│   │   │   ├── types.ts
│   │   │   └── stories/
│   │   │
│   │   ├── feedback/                # Componentes de feedback
│   │   │   ├── Toast.tsx            # Toast notification
│   │   │   ├── ToastProvider.tsx    # Provider + portal rendering
│   │   │   ├── useToast.ts          # Hook imperative API
│   │   │   ├── Skeleton.tsx         # Skeleton placeholder
│   │   │   ├── Spinner.tsx          # Loading spinner
│   │   │   ├── types.ts             # ToastItem, ToastAPI, ToastPosition
│   │   │   └── stories/
│   │   │
│   │   ├── overlays/                # Componentes de overlay
│   │   │   ├── Modal.tsx            # Modal portal-based, compound (Header/Body/Footer)
│   │   │   ├── Drawer.tsx           # Slide-in drawer, responsive
│   │   │   ├── DrawerStack.tsx      # Multi-level drawer stack
│   │   │   ├── ConfirmDialog.tsx    # Dialog de confirmación
│   │   │   ├── context.ts           # ModalContext
│   │   │   ├── types.ts
│   │   │   └── stories/
│   │   │
│   │   └── ErrorBoundary.tsx        # Error boundary global
│   │
│   ├── hooks/                       # Custom hooks globales
│   │   ├── useIsMobile.ts           # Detección de móvil (breakpoint 768px)
│   │   └── useMediaQuery.ts         # Media query genérica
│   │
│   ├── layouts/                     # Layouts de página
│   │   ├── MainLayout.tsx           # Layout principal (sidebar + contenido)
│   │   ├── MainLayout.module.css
│   │   ├── AuthLayout.tsx           # Layout de autenticación (split + hero)
│   │   ├── AuthLayout.module.css
│   │   ├── ErrorLayout.tsx          # Layout de errores
│   │   └── auth/                    # Sub-componentes del auth layout
│   │
│   ├── routes/                      # Definición de rutas por dominio
│   │   ├── index.ts                 # Combina todas las rutas
│   │   ├── showcase.tsx             # Rutas de componentes UI
│   │   ├── ajustes.tsx              # Rutas de configuración
│   │   └── examples.tsx             # Rutas de ejemplos
│   │
│   ├── pages/                       # Páginas (vistas completas)
│   │   ├── auth/                    # Páginas de auth (11 archivos)
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── ForgotPasswordPage.tsx
│   │   │   ├── VerifyOTPPage.tsx
│   │   │   ├── ResetPasswordPage.tsx
│   │   │   ├── VerifyEmailPage.tsx
│   │   │   ├── VerifyEmailConfirmPage.tsx
│   │   │   ├── TermsPage.tsx
│   │   │   ├── ForbiddenPage.tsx
│   │   │   ├── NotFoundPage.tsx
│   │   │   └── ServerErrorPage.tsx
│   │   │
│   │   ├── ajustes/                 # Páginas de configuración
│   │   │   └── AjustesIndex.tsx
│   │   │
│   │   └── examples/                # Ejemplos reales
│   │       ├── ExamplesIndex.tsx
│   │       ├── auditoria/
│   │       ├── calendario/
│   │       └── registro/
│   │
│   ├── features/                    # Feature modules
│   │   └── settings/
│   │       └── BrandColorSettings.tsx
│   │
│   ├── dev/                         # Páginas de desarrollo (showcase)
│   │   ├── ComponentesIndex.tsx
│   │   ├── ComponentesBotones.tsx
│   │   ├── ComponentesCards.tsx
│   │   ├── TablesShowcase.tsx
│   │   ├── FormShowcase.tsx
│   │   ├── ComponentesModales.tsx
│   │   ├── ComponentesNotificaciones.tsx
│   │   ├── ComponentesNavegacion.tsx
│   │   └── ComponentesCalendario.tsx
│   │
│   └── styles/
│       └── tailwind.css             # Configuración Tailwind v4 (CSS-first)
│
├── docs/                            # Esta documentación
├── package.json
├── tsconfig.json                    # References a tsconfig.app.json + tsconfig.node.json
└── README.md
```

## Convenciones de nombres

| Tipo | Convención | Ejemplo |
|------|-----------|---------|
| Componentes | PascalCase | `Button.tsx`, `Modal.tsx` |
| Hooks | camelCase con `use` | `useTheme.ts`, `useToast.ts` |
| Tipos/Interfaces | PascalCase | `AuthState`, `ToastItem` |
| CSS Modules | `Componente.module.css` | `Sidebar.module.css` |
| Stories | `Componente.stories.tsx` | `Button.stories.tsx` |
| Tests | `archivo.test.ts` | `semantic.test.ts` |
| Constantes | UPPER_SNAKE_CASE | `MOCK_USERS`, `TOKEN_KEY` |
| Exports barrel | `index.ts` | Re-exports de cada módulo |
