# Testing — Plantilla Front

## Estado actual

| Métrica | Valor |
|---------|-------|
| Tests totales | 165 |
| Archivos de test | 13 |
| Framework | Vitest + @testing-library/react |
| Mock server | MSW (Mock Service Worker) |
| Cobertura | @vitest/coverage-v8 |

## Scripts

```bash
npm run test              # Ejecutar todos los tests
npm run test:watch        # Modo watch
npm run test:coverage     # Con cobertura
```

## Estructura de tests

```
src/
├── components/
│   ├── primitives/
│   │   ├── Button.test.tsx        (7 tests)
│   │   ├── Input.test.tsx         (12 tests)
│   │   ├── Select.test.tsx        (9 tests)
│   │   ├── Checkbox.test.tsx      (8 tests)
│   │   ├── Radio.test.tsx         (12 tests)
│   │   └── Textarea.test.tsx      (9 tests)
│   ├── feedback/
│   │   └── Toast.test.tsx         (14 tests)
│   └── overlays/
│       ├── Modal.test.tsx         (9 tests)
│       └── Drawer.test.tsx        (9 tests)
├── lib/
│   ├── i18n/
│   │   └── config.test.ts         (17 tests)
│   └── api/
│       └── client.test.ts         (7 tests)
├── test/
│   ├── setup.ts                   (jest-dom + MSW)
│   └── mocks/
│       ├── server.ts              (MSW server)
│       └── handlers/
│           └── auth.ts            (MSW auth handlers)
```

## Configuración

### Vitest

Configurado en `vite.config.ts` bajo el workspace `unit`:

```ts
test: {
  project: 'unit',
  environment: 'jsdom',
  setupFiles: ['./src/test/setup.ts'],
  globals: true,
  include: ['src/**/*.test.{ts,tsx}'],
  coverage: {
    provider: 'v8',
    reporter: ['text', 'html', 'lcov'],
    include: ['src/**/*.{ts,tsx}'],
    exclude: ['src/**/*.stories.*', 'src/**/*.test.*'],
  },
}
```

### MSW (Mock Service Worker)

MSW intercepta requests de red en tests. Configurado en:

- `src/test/setup.ts` — Lifecycle (beforeAll, afterEach, afterAll)
- `src/test/mocks/server.ts` — Instancia del servidor MSW
- `src/test/mocks/handlers/auth.ts` — Handlers de auth

### Setup file

`src/test/setup.ts`:
```ts
import '@testing-library/jest-dom/vitest'
import { server } from './mocks/server'

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

## Convenciones

### Nombres de archivos

- Tests van junto al componente: `Button.tsx` → `Button.test.tsx`
- Tests de servicios: `auth.service.ts` → `auth.service.test.ts`
- Tests de utilidades: `utils.ts` → `utils.test.ts`

### Estructura de un test

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './Button'

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Click</Button>)
    fireEvent.click(screen.getByText('Click'))
    expect(onClick).toHaveBeenCalledOnce()
  })
})
```

### Testing hooks

```tsx
import { renderHook } from '@testing-library/react'
import { useMediaQuery } from './useMediaQuery'

describe('useMediaQuery', () => {
  it('returns false when no match', () => {
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))

    const { result } = renderHook(() => useMediaQuery('(max-width: 768px)'))
    expect(result.current).toBe(false)
  })
})
```

### Testing with MSW

```ts
import { server } from '../test/mocks/server'
import { http, HttpResponse } from 'msw'

it('handles API error', async () => {
  server.use(
    http.get('/api/users', () => {
      return HttpResponse.json(
        { success: false, message: 'Error', code: 'INTERNAL_ERROR' },
        { status: 500 }
      )
    })
  )

  // ... test the error handling
})
```

### Coverage

La cobertura se reporta con `@vitest/coverage-v8`. El CI workflow falla si la cobertura es menor al 70%.

Para ver el reporte HTML:
```bash
npm run test:coverage
open coverage/index.html
```
