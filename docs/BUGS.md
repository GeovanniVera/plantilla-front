# Bug Tracking

Issues detectados durante la documentación del proyecto plantilla-front.

## 🔴 Bugs Críticos

### 1. VerifyEmailConfirmPage — Falta navigate en éxito

**Página**: `src/pages/auth/VerifyEmailConfirmPage.tsx`
**Severidad**: 🔴 Crítica
**Estado**: Pendiente

**Descripción**: En estado de éxito dice "Redirigiendo al login..." pero nunca redirige. Falta `navigate('/login')`.

**Comportamiento actual**:
```tsx
// Muestra texto pero no redirige
if (success) {
  return <p>Redirigiendo al login...</p>;
}
```

**Comportamiento esperado**:
```tsx
if (success) {
  useEffect(() => {
    setTimeout(() => navigate('/login'), 2000);
  }, []);
  return <p>Redirigiendo al login...</p>;
}
```

---

### 2. TermsPage — Typo carácter chino

**Página**: `src/pages/auth/TermsPage.tsx`
**Severidad**: 🔴 Crítica
**Estado**: Pendiente

**Descripción**: Sección 8 tiene un carácter chino `终止` en medio de texto español.

**Ubicación**: Sección 8 del array `SECTIONS`

**Fix**: Remover el carácter chino del texto.

---

## 🟠 Inconsistencias

### 3. ServerErrorPage — No usa ErrorLayout

**Página**: `src/pages/auth/ServerErrorPage.tsx`
**Severidad**: 🟠 Media
**Estado**: Pendiente

**Descripción**: A diferencia de ForbiddenPage (403) y NotFoundPage (404), ServerErrorPage (500) NO usa `ErrorLayout` ni `Button` del design system. Usa estilos inline propios con colores hardcodeados (`#1a1a1a`, `#dc2626`).

**Impacto**: Break de consistencia visual con las otras páginas de error.

**Fix**: Reemplazar estilos inline por `ErrorLayout` + `Button` del design system.

---

## 🟡 Déuditos Técnicos

### 4. Strings hardcodeados sin i18n

**Módulos afectados**: Pages, Features
**Severidad**: 🟡 Baja
**Estado**: Pendiente

**Descripción**: Varios strings están hardcodeados en español sin pasar por i18n:
- LoginPage: "Recordarme", "¿Olvidaste tu contraseña?"
- RegisterPage: "Debés aceptar los términos y condiciones", "Las contraseñas no coinciden"
- VerifyEmailPage: "Revisá tu bandeja de entrada", "Revisá la carpeta de spam"
- VerifyOTPPage: "Volver", "El código expira en 10 minutos"
- AjustesIndex: "Colores de marca", "Personaliza los colores..."
- Features/settings/: Todos los labels de tokens

**Fix**: Migrar todos los strings a keys de i18n.

---

### 5. Sin schema de validación

**Módulo**: Pages (auth)
**Severidad**: 🟡 Baja
**Estado**: Pendiente

**Descripción**: Ninguna página usa Zod, Yup u otra librería de validación. Toda la validación es manual o HTML5 nativa.

**Impacto**: 
- Validación duplicada en cada página
- Mensajes de error inconsistentes
- Difícil de mantener

**Fix**: Agregar schema de validación con Zod o Yup.

---

### 6. Falta useDebounce

**Módulo**: Hooks
**Severidad**: 🟡 Baja
**Estado**: Pendiente

**Descripción**: No existe hook de debounce. Sin esto, cualquier búsqueda en tiempo real hará una llamada API por cada keystroke.

**Fix**: Crear hook `useDebouncedValue`:

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

---

### 7. Falta useLocalStorage

**Módulo**: Hooks
**Severidad**: 🟡 Baja
**Estado**: Pendiente

**Descripción**: No existe hook genérico para persistir cualquier estado en storage. Solo existe `authStorage` para tokens.

**Fix**: Crear hook `useLocalStorage`:

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

---

### 8. useMediaQuery e useIsMobile no están en barrel

**Módulo**: Hooks
**Severidad**: 🟡 Baja
**Estado**: Pendiente

**Descripción**: `useMediaQuery` e `useIsMobile` no están exportados desde `src/hooks/index.ts`. Esto es inconsistente con los hooks de auth que sí están en el barrel.

**Fix**: Agregar al barrel o eliminar `useIsMobile` (es trivial).

---

## Resumen

| Severidad | Cantidad | Estado |
|-----------|----------|--------|
| 🔴 Crítica | 2 | Pendientes |
| 🟠 Media | 1 | Pendiente |
| 🟡 Baja | 5 | Pendientes |
| **Total** | **8** | **Pendientes** |

---

## Próximos Pasos

1. **Priorizar fixes**: Empezar por bugs críticos (VerifyEmailConfirmPage, TermsPage)
2. **Unificar ServerErrorPage**: Reemplazar estilos inline por ErrorLayout
3. **Migrar a i18n**: Strings hardcodeados
4. **Agregar validación**: Zod o Yup para formularios
5. **Crear hooks faltantes**: useDebouncedValue, useLocalStorage
6. **Limpiar barrel**: useMediaQuery, useIsMobile

---

## Nota

Estos issues fueron detectados durante la documentación del proyecto. No son bloqueantes para el desarrollo del backend, pero deberían resolverse antes de una release de producción.
