# Testing

## Framework

- **Runner**: Vitest (configurado en `vite.config.ts`)
- **DOM**: jsdom
- **Rendering**: @testing-library/react
- **User events**: @testing-library/user-event
- **Mocks**: MSW (Mock Service Worker) v2
- **Coverage**: @vitest/coverage-v8

## Comandos

```bash
npm run test              # Todos los tests
npm run test:coverage     # Con coverage
npm run test -- --run     # Sin watch
```

## Estructura de tests

```
src/
  components/primitives/Checkbox.test.tsx    # Test junto al componente
  pages/auth/LoginPage.test.tsx              # Test junto a la página
  auth/ForgotPasswordContext.test.tsx         # Test del context
  lib/api/client.test.ts                     # Test del cliente HTTP
  lib/auth/token-store.test.ts              # Test del token store
```

## Convenciones

1. **Archivos**: `*.test.ts` o `*.test.tsx` junto al archivo fuente
2. **Describe**: Nombre del componente o módulo
3. **It**: Descripción en inglés del comportamiento
4. **MSW handlers**: En `src/test/mocks/handlers/`
5. **Setup**: `src/test/setup.ts` configura MSW globalmente

## MSW

### Handler existente

```ts
// src/test/mocks/handlers/auth.ts
http.post('*/auth/login', async ({ request }) => {
  const body = await request.json();
  // ... lógica mock
  return HttpResponse.json({ success: true, data: { ... } });
});
```

### Agregar handler nuevo

1. Crear archivo en `src/test/mocks/handlers/{resource}.ts`
2. Exportar array de handlers
3. Importar y agregar en `src/test/mocks/server.ts`

### Override en test individual

```ts
import { server } from '../../test/mocks/server';
import { http, HttpResponse } from 'msw';

it('handles error', async () => {
  server.use(
    http.post('*/auth/login', () => {
      return HttpResponse.error();
    }),
  );
  // ... test
});
```

## Coverage objetivo

| Métrica | Objetivo | Actual |
|---------|----------|--------|
| Statements | >70% | 56.82% |
| Branches | >70% | 54.81% |
| Functions | >70% | 45.98% |
| Lines | >70% | 58.41% |

## Áreas con 0% coverage

- `App.tsx`
- `main.tsx`
- `ThemeProvider.tsx`, `persistence.ts`, `useTheme.ts`
- `VerifyEmailPage.tsx`, `VerifyEmailConfirmPage.tsx`, `VerifyOTPPage.tsx`
- `NotFoundPage.tsx`, `ServerErrorPage.tsx`, `TermsPage.tsx`
