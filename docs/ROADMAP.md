# Roadmap — Plantilla Front

> Estado actualizado del proyecto. Items completados se mueven al final.

## Completado ✅

| Item | Fecha |
|------|-------|
| Tests para primitives (Button, Input, Select, Checkbox, Radio, Textarea) | Fase 2 |
| Tests para overlays (Modal, Drawer) | Fase 2 |
| Tests para feedback (Toast) | Fase 2 |
| Configurar Vitest + script `test` | Fase 2 |
| Configurar cobertura con `@vitest/coverage-v8` | Fase 2 |
| Extraer `classes()` e `isAriaInvalid()` a módulo compartido | Fase 2 |
| Configurar Prettier + pre-commit hooks | Fase 4 |
| Configurar CI pipeline (GitHub Actions) | Fase 4 |
| Servicio de auth real (authService) | Fase 3 |
| React Query hooks para auth | Fase 3 |
| MSW para tests | Fase 3 |
| Refresh token flow | Fase 4 |
| i18n con i18next | Fase 5 |
| Mover API layer a `src/lib/api/` | Fase 5 |
| Mover token store a `src/lib/auth/` | Fase 5 |
| Documentación del template | Fase 6 |

## Pendiente — Alto 🔴

| # | Item | Descripción |
|---|------|-------------|
| 1 | Tests para tablas | DataTable, ExcelTable, hooks de tabla |
| 2 | Tests para auth guards | ProtectedRoute, RequirePrivilege, GuestOnly |
| 3 | Tests para theme system | ThemeProvider, persistence, contrast |
| 4 | Tests para toast system | ToastProvider, useToast |
| 5 | Tests para form system | useForm, FormField, FormContext |

## Pendiente — Medio 🟡

| # | Item | Descripción |
|---|------|-------------|
| 6 | Virtualización para tablas grandes | React Virtual o similar |
| 7 | Migrar dark mode a `data-theme` | Toggle manual en vez de prefers-color-scheme |
| 8 | Tests para sidebar responsive | Comportamiento móvil, NavGroup toggle |
| 9 | Tests para calendar | Date calculations, range selection |
| 10 | READMEs por componente | Prop tables en Storybook |

## Pendiente — Bajo ⚪

| # | Item | Descripción |
|---|------|-------------|
| 11 | Evaluar migración de README a inglés | Documentación bilingual |
| 12 | Bundle analysis | rollup-plugin-visualizer |
| 13 | Lighthouse CI | Métricas de performance |
| 14 | Visual regression testing | Chromatic o similar |

## Decisiones pendientes

| Decisión | Estado | Notas |
|----------|--------|-------|
| Dark mode toggle | Pendiente | Actualmente solo `prefers-color-scheme` |
| Fuentes tipográficas | Pendiente | Verificar si se cargan vía Google Fonts |
| .vscode/config | Pendiente | Configuración de workspace |
