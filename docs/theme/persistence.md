# Theme Persistence

Sistema de persistencia con Strategy Pattern.

## Concepto

El tema se persiste automáticamente en cada cambio. El adaptador de persistencia es intercambiable.

## Interface

```typescript
export type ThemeMap = Partial<Record<TokenKey, string>>;

export interface ThemeStorage {
  load(): ThemeMap;
  save(theme: ThemeMap): void;
  reset(): void;
}
```

## Adaptador por Defecto: localStorage

```typescript
export const localStorageAdapter: ThemeStorage = {
  load() {
    try {
      const data = localStorage.getItem('brand-theme-v1');
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },
  
  save(theme) {
    try {
      localStorage.setItem('brand-theme-v1', JSON.stringify(theme));
    } catch {
      // localStorage lleno o inaccesible — falla silenciosamente
    }
  },
  
  reset() {
    try {
      localStorage.removeItem('brand-theme-v1');
    } catch {
      // Ignorar errores
    }
  },
};
```

## Funciones Exportadas

```typescript
export function setStorageAdapter(adapter: ThemeStorage): void
export function loadTheme(): ThemeMap
export function saveTheme(theme: ThemeMap): void
export function resetTheme(): void
```

## Cambiar Adaptador

### Ejemplo: API Remota

```typescript
import { setStorageAdapter } from '@theme/persistence';

const apiAdapter: ThemeStorage = {
  async load() {
    const response = await fetch('/api/user/theme');
    return response.json();
  },
  
  async save(theme) {
    await fetch('/api/user/theme', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(theme),
    });
  },
  
  async reset() {
    await fetch('/api/user/theme', { method: 'DELETE' });
  },
};

setStorageAdapter(apiAdapter);
```

### Ejemplo: Mock para Tests

```typescript
import { setStorageAdapter } from '@theme/persistence';

const mockStorage: ThemeMap = {};

const mockAdapter: ThemeStorage = {
  load: () => ({ ...mockStorage }),
  save: (theme) => Object.assign(mockStorage, theme),
  reset: () => Object.keys(mockStorage).forEach(k => delete mockStorage[k]),
};

setStorageAdapter(mockAdapter);
```

## Clave de Storage

```typescript
const STORAGE_KEY = 'brand-theme-v1';
```

La clave está versionada (`v1`) para soportar migraciones futuras si la estructura del tema cambia.

## Flujo de Persistencia

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Montaje del ThemeProvider                                    │
│    │                                                            │
│    └─ loadTheme() → lee de localStorage                         │
│        ├─ Si existe → parsea JSON → ThemeMap                    │
│        └─ Si no existe o falla → {}                             │
└───────────────────────────┬─────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. Cambio de Tema                                               │
│    │                                                            │
│    ├─ setColor('primary', '#ff0000')                            │
│    │   └─ setTokens(merge)                                      │
│    │       └─ React re-render                                   │
│    │           └─ useEffect([tokens])                           │
│    │               └─ saveTheme(tokens)                         │
│    │                   └─ localStorage.setItem(...)             │
│    │                                                            │
│    └─ resetTheme()                                              │
│        ├─ resetSaved() → localStorage.removeItem()              │
│        └─ setTokens(defaultTokens)                              │
└─────────────────────────────────────────────────────────────────┘
```

## Manejo de Errores

Todas las operaciones usan `try/catch`:

- **`load()`**: Si falla, retorna `{}` (usa defaults)
- **`save()`**: Si falla, silenciosamente ignora (el tema funciona en memoria)
- **`reset()`**: Si falla, silenciosamente ignora

**Filosofía**: La persistencia es un "nice to have". El tema siempre funciona en memoria aunque el storage falle.
