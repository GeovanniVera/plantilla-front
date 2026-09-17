# Error Pages

Páginas de error: Forbidden (403), NotFound (404), ServerError (500).

---

## ForbiddenPage (403)

### Ruta

`/403`

### Componente

Layout de error con imagen 403 + info del usuario (email + roles) + 3 botones.

### Dependencias

- `useAuth()` para `user` y `logout()`
- `react-router` (useNavigate)

### Botones

| Botón | Acción |
|-------|--------|
| "Volver" | `navigate(-1)` |
| "Inicio" | `navigate('/')` |
| "Cerrar sesión" | `logout()` → `/login` |

### i18n Keys

- `pages.forbidden.title`
- `pages.forbidden.message`
- `pages.forbidden.backToHome`
- `common.back`

### Design System

- `Button` (variant: primary, secondary, danger)
- `ErrorLayout`

### Uso

```tsx
function ForbiddenPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <ErrorLayout image={forbiddenImage} title={t('pages.forbidden.title')}>
      <p>{user.email}</p>
      <p>{user.roles.join(', ')}</p>
      <Button onClick={() => navigate(-1)}>{t('common.back')}</Button>
      <Button onClick={() => navigate('/')}>{t('pages.forbidden.backToHome')}</Button>
      <Button variant="danger" onClick={() => logout.mutate()}>Cerrar sesión</Button>
    </ErrorLayout>
  );
}
```

---

## NotFoundPage (404)

### Ruta

`*` (catch-all)

### Componente

Layout de error con imagen 404 + 2 botones.

### Botones

| Botón | Acción |
|-------|--------|
| "Volver" | `navigate(-1)` |
| "Inicio" | `navigate('/')` |

### i18n Keys

- `pages.notFound.title`
- `pages.notFound.message`
- `pages.notFound.backToHome`
- `common.back`

### Design System

- `Button` (variant: primary, secondary)
- `ErrorLayout`

---

## ServerErrorPage (500)

### Ruta

`/500`

### Componente

Página standalone con imagen 500 + diseño dark con tonos rojos.

### Botones

| Botón | Acción |
|-------|--------|
| "Volver" | `navigate(-1)` |
| "Inicio" | `navigate('/')` |

### i18n Keys

- `pages.serverError.title`
- `pages.serverError.message`
- `pages.serverError.backToHome`
- `common.back`

### ⚠️ Inconsistencia

**NO usa `ErrorLayout` ni `Button` del design system**. Estilos inline propios con colores hardcodeados (`#1a1a1a`, `#dc2626`). Break de consistencia visual con 403 y 404.

### Uso

```tsx
// NO usa ErrorLayout
function ServerErrorPage() {
  const navigate = useNavigate();

  return (
    <div style={{ background: '#1a1a1a', color: '#fff' }}>
      <h1 style={{ color: '#dc2626' }}>{t('pages.serverError.title')}</h1>
      <p>{t('pages.serverError.message')}</p>
      <button onClick={() => navigate(-1)}>{t('common.back')}</button>
      <button onClick={() => navigate('/')}>{t('pages.serverError.backToHome')}</button>
    </div>
  );
}
```
