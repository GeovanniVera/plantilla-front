# Convenciones de Código — Semilla Tecnologica

## Convenciones de archivos

### Nombres de archivos

| Tipo | Convención | Ejemplo |
|------|-----------|---------|
| Componentes | PascalCase | `Button.tsx`, `Modal.tsx` |
| Hooks | camelCase con `use` prefix | `useTheme.ts`, `useToast.ts` |
| Tipos/Interfaces | PascalCase | `AuthState`, `ToastItem` |
| CSS Modules | `Componente.module.css` | `Sidebar.module.css` |
| Stories | `Componente.stories.tsx` | `Button.stories.tsx` |
| Tests | `archivo.test.ts` | `semantic.test.ts` |
| Barrel exports | `index.ts` | Re-exports de cada módulo |
| Constantes | UPPER_SNAKE_CASE | `MOCK_USERS`, `TOKEN_KEY` |

### Estructura de directorios

```
src/
├── api/           # Capa HTTP
├── auth/          # Autenticación
├── components/    # Design system (atomic design simplificado)
│   ├── primitives/
│   ├── layout/
│   ├── forms/
│   ├── data-display/
│   ├── navigation/
│   ├── feedback/
│   └── overlays/
├── hooks/         # Custom hooks globales
├── layouts/       # Layouts de página
├── pages/         # Páginas (vistas)
├── routes/        # Definición de rutas
├── styles/        # Configuración Tailwind
└── theme/         # Sistema de theming
```

## Convenciones de TypeScript

### Tipado

- Usar `interface` para props de componentes y objetos con estructura conocida
- Usar `type` para uniones, aliases y tipos derivados
- Evitar `any` — usar `unknown` cuando el tipo sea incierto
- Exportar tipos necesarios desde `types.ts` o `index.ts`

```ts
// ✅ Correcto
interface ButtonProps {
  variant: ButtonVariant
  size?: ButtonSize
  children: ReactNode
}

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

// ❌ Evitar
const Button = (props: any) => { ... }
```

### Generics

Usar generics para componentes reutilizables con tipos flexibles:

```ts
// client.ts
async function request<T>(method: string, path: string): Promise<T> {
  // ...
}

export const client = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
}
```

### Imports

```ts
// 1. React y librerías externas
import { useState, useCallback, useEffect } from 'react'
import { LuX } from 'react-icons/lu'

// 2. Paths absolutos (configurados en tsconfig)
import { useAuth } from '@components/auth'
import { useTheme } from '@theme/useTheme'
import { client } from '@api/client'

// 3. Paths relativos
import { Button } from './Button'
import type { ButtonProps } from './types'
```

⚠️ POR CONFIRMAR: Verificar alias configurados en `tsconfig.app.json` — `@components`, `@theme`, `@api`, `@hooks`.

## Convenciones de componentes

### Component structure

```tsx
// 1. Imports
import { forwardRef, useState, useCallback } from 'react'
import type { ComponentPropsWithRef } from 'react'

// 2. Types/Interfaces
interface MyComponentProps {
  variant?: 'default' | 'alternative'
  children: ReactNode
}

// 3. Constants (styling)
const BASE_CLASSES = 'flex items-center gap-2'

// 4. Component implementation
export function MyComponent({ variant = 'default', children }: MyComponentProps) {
  // Hooks
  // State
  // Handlers
  // Render
  return (
    <div className={BASE_CLASSES}>
      {children}
    </div>
  )
}
```

### Compound Components

Usar compound components para componentes con sub-parteles:

```tsx
// Modal
<Modal isOpen onClose={close}>
  <Modal.Header title="Título" />
  <Modal.Body>Contenido</Modal.Body>
  <Modal.Footer>Acciones</Modal.Footer>
</Modal>

// Sidebar
<Sidebar>
  <Sidebar.Header>...</Sidebar.Header>
  <Sidebar.Toggle />
  <Sidebar.Nav>...</Sidebar.Nav>
  <Sidebar.Footer>...</Sidebar.Footer>
</Sidebar>
```

**Implementación:**

```tsx
export function Modal({ isOpen, onClose, children }: ModalProps) {
  return createPortal(
    <ModalContext.Provider value={onClose}>
      <div role="dialog" aria-modal="true">
        {children}
      </div>
    </ModalContext.Provider>,
    document.body,
  )
}

Modal.Header = function ModalHeader({ title }: ModalHeaderProps) {
  const onClose = useModalClose()
  return <div>{title}<button onClick={onClose}>×</button></div>
}
```

### forwardRef

Usar `forwardRef` para componentes que necesitan exponer ref:

```tsx
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ size, validationState, ...props }, ref) => {
    return <input ref={ref} className={classes} {...props} />
  }
)
```

⚠️ **Nota:** `Radio.tsx` actualmente NO usa `forwardRef` (inconsistente con Input, Select, Textarea).

## Convenciones de CSS

### Tailwind CSS v4

- **Utility-first**: Usar clases de Tailwind directamente en JSX
- **CSS-first config**: `src/styles/tailwind.css` usa `@theme` blocks
- **Runtime variables**: Los tokens de theme son CSS variables (`var(--primary)`)
- **Sin literales hardcodeadas**: Los colores siempre vienen de tokens

```tsx
// ✅ Correcto: usando tokens
<button className="bg-accent text-white hover:brightness-110">

// ❌ Evitar: colores hardcodeados
<button className="bg-[#0d9488] text-[#ffffff]">
```

### CSS Modules

Se usan para estilos legacy que aún no se migraron a Tailwind:

```tsx
import styles from './Sidebar.module.css'

<aside className={`${styles.sidebar} ${expanded ? styles.expanded : ''}`}>
```

### Animaciones

Definidas en `src/styles/tailwind.css` bajo `@theme`:

```css
--animate-btn-pulse: btn-pulse 0.4s ease;
--animate-toast-in: toast-in 0.3s cubic-bezier(0.16, 1, 0.3, 1);

@keyframes btn-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
```

Uso en JSX:

```tsx
<button className="hover:animate-btn-pulse">
```

### Dark mode

Actualmente usa `prefers-color-scheme` en `src/styles/tailwind.css`:

```css
@media (prefers-color-scheme: dark) {
  :root {
    --success: #4dc06c;
    --warning: #ed990e;
    /* ... */
  }
}
```

⚠️ Pendiente migrar a `data-theme` para control manual.

## Convenciones de naming

### Variables y funciones

| Tipo | Convención | Ejemplo |
|------|-----------|---------|
| Variables | camelCase | `accessToken`, `isLoading` |
| Funciones | camelCase | `restoreSession()`, `applyTokensToDOM()` |
| Constantes | UPPER_SNAKE_CASE | `MOCK_USERS`, `TOKEN_KEY` |
| Booleanos | `is`, `has`, `should` prefix | `isAuthenticated`, `hasAccess` |
| Callbacks | `handle` prefix | `handleClick`, `handleLogout` |
| Eventos | `on` prefix | `onClose`, `onSubmit` |

### Componentes y hooks

| Tipo | Convención | Ejemplo |
|------|-----------|---------|
| Componentes | PascalCase | `Button`, `AuthProvider` |
| Hooks | camelCase con `use` | `useAuth()`, `useTheme()` |
| Contexts | PascalCase + `Context` | `AuthContext`, `ThemeContext` |
| Providers | PascalCase + `Provider` | `AuthProvider`, `ThemeProvider` |

### CSS classes

| Tipo | Convención | Ejemplo |
|------|-----------|---------|
| Tailwind utilities | kebab-case | `bg-accent`, `text-white` |
| CSS Modules | camelCase | `styles.sidebar`, `styles.expanded` |
| Animation tokens | `animate-*` prefix | `animate-btn-pulse` |
| Color tokens | `--{name}` | `--primary`, `--success-strong` |

## Convenciones de commits

⚠️ POR CONFIRMAR: No hay convención de commits documentada ni Husky/lint-staged configurado.

### Formato sugerido (Conventional Commits)

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: Nueva funcionalidad
- `fix`: Bug fix
- `docs`: Documentación
- `style`: Cambios de estilo (no afectan lógica)
- `refactor`: Refactorización (sin cambio de funcionalidad)
- `test`: Tests
- `chore`: Tareas de mantenimiento

**Ejemplos:**
```
feat(theme): add dark mode toggle
fix(input): handle password visibility toggle
docs(components): add Button prop tables
refactor(forms): extract shared classes() function
```

## Convenciones de exports

### Barrel exports

Cada módulo tiene un `index.ts` que re-exporta lo público:

```ts
// src/auth/index.ts
export { AuthProvider } from './provider'
export { useAuth, useHasPrivilege, useHasRole } from './hooks'
export type { AuthState, AuthContextValue } from './types'
```

### Named exports vs default exports

- **Componentes**: Named exports (`export function Button()`)
- **Pages**: Default exports (`export default function LoginPage()`)
- **Hooks**: Named exports (`export function useAuth()`)
- **Types**: Named exports (`export type AuthState`)

⚠️ Las pages usan default exports para compatibilidad con `React.lazy()`:
```tsx
const LoginPage = lazy(() => import('./pages/auth/LoginPage'))
```

## Convenciones de documentación

### JSDoc

Usar JSDoc para funciones públicas y tipos:

```tsx
/**
 * Botón con múltiples variantes, tamaños y animaciones.
 *
 * @param variant - Variante visual del botón
 * @param size - Tamaño del botón
 * @param animation - Animación al hacer hover
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="lg" animation="pulse">
 *   Click me
 * </Button>
 * ```
 */
export function Button({ variant = 'primary', size = 'md', animation = 'none', ...props }: ButtonProps) {
```

### Storybook stories

Incluir `parameters.docs.description.story` para documentación auto-generada:

```tsx
export default {
  title: 'Primitives/Button',
  component: Button,
  parameters: {
    docs: {
      description: {
        story: 'Botón con múltiples variantes, tamaños y animaciones.',
      },
    },
  },
}
```

⚠️ POR CONFIRMAR: No todas las stories tienen `parameters.docs.description.story` configurado.
