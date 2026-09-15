# Auditoría Técnica — plantilla-front

**Fecha**: 2026-09-12  
**Auditor**: Gentle AI (automatizado)

---

## Stack

| Categoría | Paquete | Versión |
|-----------|---------|---------|
| **Framework** | react | ^19.2.8 |
| **Routing** | react-router | ^8.3.0 |
| **State server** | @tanstack/react-query | ^5.102.8 |
| **HTTP** | fetch API nativa | — |
| **i18n** | i18next + react-i18next | ^26.4.2 / ^17.0.13 |
| **CSS** | tailwindcss | ^4.3.3 |
| **Build** | vite | ^8.2.0 |
| **Test** | vitest + @testing-library/react | latest / ^16.3.3 |
| **MSW** | msw | ^2.15.0 |
| **Storybook** | @storybook/react-vite | ^10.5.10 |
| **TS** | typescript | ~6.0.2 |
| **Lint** | oxlint | ^1.75.0 |
| **Format** | prettier + prettier-plugin-tailwindcss | ^3.4.2 / ^0.6.9 |
| **Icons** | react-icons | ^5.7.0 |
| **Date** | date-fns | ^4.4.0 |

---

## Métricas

| Métrica | Valor |
|---------|-------|
| Archivos fuente (.ts/.tsx) | ~120 |
| Archivos de test | 20 |
| Archivos de story | 29 |
| CSS Modules | 12 |
| Líneas de código fuente | 12,498 |
| Líneas de test | 1,659 |
| Líneas de stories | 3,878 |
| **Total líneas** | **18,035** |

### Coverage

| Métrica | Valor |
|---------|-------|
| Statements | 56.82% |
| Branches | 54.81% |
| Functions | 45.98% |
| Lines | 58.41% |
| Tests que pasan | 388/388 |

---

## Scores

| Dimensión | Score | Notas |
|-----------|-------|-------|
| **Arquitectura** | 8/10 | Capas claras, separación de concerns. Calendar/Table son Legacy. |
| **Consistencia** | 7/10 | Auth e i18n son consistentes. Components mezclan CSS Modules + Tailwind. |
| **Testabilidad** | 6/10 | Primitives bien cubiertas. Auth pages y theme con 0% coverage. |
| **Manejo de errores** | 8/10 | ApiError normalizado, error boundaries, toast system. |
| **Configurabilidad** | 8/10 | env.ts tipado, theme configurable, MSW para tests. |
| **Documentación** | 2/10 | Recién borrada. Esta auditoría la reemplaza. |
| **DX** | 7/10 | Scripts útiles, storybook, lint-staged. Build roto por tsconfig. |
| **General** | **6.6/10** | |

---

## Top 5 Acciones Críticas

1. **Arreglar tsconfig.app.json** — Agregar `"types": ["vitest/globals"]` para que `tsc -b` pase. Sin esto, `npm run build` falla.
2. **Resolver TS 6.0 en primitives** — `ComponentPropsWithoutRef` ya no existe. Cambiar a `ComponentPropsWithRef` o import correcto.
3. **Arreglar ApiError erasableSyntaxOnly** — Los constructores con parámetros públicos no son válidos en TS6. Refactorizar.
4. **Subir coverage a >70%** — Las páginas de auth (VerifyEmail, VerifyOTP, NotFound, etc.) tienen 0% coverage.
5. **Eliminar strings hardcodeados** — 18 strings en producción no están en i18n. Mover a locale files.

---

## Top 5 A Preservar

1. **Sistema de auth completo** — Provider, guards, hooks, token store, refresh interceptor. Funcional y bien estructurado.
2. **MSW para tests** — Handlers de auth configurados, patrón estable para agregar endpoints.
3. **Theme system** — Tokens, semantic colors, contrast checker, persistence. Sofisticado y configurable.
4. **Primitives UI** — Button, Input, Select, Checkbox, Radio, Badge, Textarea. Consistentes y documentados en Storybook.
5. **i18n setup** — Configurado con locales es/en, error mapping, lazy loading.
