# Gaps

Hooks faltantes en el proyecto plantilla-front.

## Hooks No Existentes

### 1. useDebounce / useDebouncedValue

**Problema**: Sin este hook, cualquier búsqueda en tiempo real hará una llamada API por cada keystroke.

**Solución recomendada**:

```tsx
function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
```

**Uso**:

```tsx
const [search, setSearch] = useState('');
const debouncedSearch = useDebouncedValue(search, 300);

const { data } = useQuery(['users', debouncedSearch], () =>
  searchUsers(debouncedSearch)
);
```

### 2. useLocalStorage / useSessionStorage

**Problema**: No hay hook genérico para persistir cualquier estado en storage. Solo existe `authStorage` para tokens.

**Solución recomendada**:

```tsx
function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue] as const;
}
```

**Uso**:

```tsx
const [theme, setTheme] = useLocalStorage('theme', 'light');
const [filters, setFilters] = useLocalStorage('user-filters', defaultFilters);
```

### 3. useDebounce (callback)

**Problema**: No hay forma de debounced callbacks (ej: resize, scroll).

**Solución recomendada**:

```tsx
function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args);
    }, delay);
  }, [delay]) as T;
}
```

**Uso**:

```tsx
const handleResize = useDebounce((width: number) => {
  console.log('Width:', width);
}, 250);

window.addEventListener('resize', (e) => handleResize(e.target.innerWidth));
```

---

## Inconsistencias

### Barrel Export

`useMediaQuery` e `useIsMobile` **NO están exportados** desde `src/hooks/index.ts`.

**Opciones**:

1. **Agregarlos al barrel** (recomendado):
```tsx
// src/hooks/index.ts
export { useMe, useLogin, useLogout } from './useAuth';
export { useMediaQuery } from './useMediaQuery';
export { useIsMobile } from './useIsMobile';
```

2. **Eliminarlos y usar `useMediaQuery` directamente**: `useIsMobile` es trivial y puede no justificar un archivo separado.

---

## Prioridad

| Hook | Prioridad | Razón |
|------|-----------|-------|
| `useDebouncedValue` | 🔴 Alta | Búsquedas en tiempo real |
| `useLocalStorage` | 🟠 Media | Persistencia genérica |
| `useDebounce` (callback) | 🟡 Baja | Resize/scroll handlers |

---

## Recomendación

1. Crear `useDebouncedValue` inmediatamente — es prácticamente obligatorio para cualquier app con búsqueda
2. Evaluar `useLocalStorage` según necesidades reales — el proyecto ya tiene `authStorage`
3. `useDebounce` (callback) es opcional — resolverlo con `useEffect` + `setTimeout` cuando sea necesario
