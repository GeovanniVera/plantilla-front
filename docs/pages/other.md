# Other Pages

Páginas misceláneas: TermsPage, AjustesIndex.

---

## TermsPage

### Ruta

`/terms`

### Componente

Página standalone con header sticky + 10 secciones hardcoded + footer.

### Datos

Array `SECTIONS` hardcodeado con 10 secciones legales (título + contenido).

### Navegación

- Header: Link a `/register`
- Footer: Link a `/terms` (self-referencing)

### i18n Keys

- `auth.resetPassword.backToLogin` (reutilizado para "Volver")
- `pages.terms.title`
- `pages.terms.lastUpdated`

### Design System

Ninguno — Tailwind directo.

### Nota

Contenido en español hardcodeado, no i18n. Sección 8 tiene typo: `"终止"` (caracter chino en medio de texto español).

### Uso

```tsx
const SECTIONS = [
  { title: "1. Aceptación de los Términos", content: "..." },
  { title: "2. Uso del Servicio", content: "..." },
  // ... 10 secciones
];

function TermsPage() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0">
        <Link to="/register">Volver</Link>
      </header>
      <main>
        <h1>{t('pages.terms.title')}</h1>
        {SECTIONS.map((section) => (
          <section key={section.title}>
            <h2>{section.title}</h2>
            <p>{section.content}</p>
          </section>
        ))}
      </main>
    </div>
  );
}
```

---

## AjustesIndex

### Ruta

`/ajustes`

### Componente

Grid de cards-link a sub-secciones de ajustes. Solo 1 item: "Colores de marca".

### Layout

`MainLayout` (dentro de `ProtectedRoute` + `RequirePrivilege("settings:manage")`)

### Estado Local

`loading` con `useEffect` → `setTimeout(800)` para simular carga.

### Skeleton

Usa `CardSkeleton` del design system durante la carga simulada.

### Rutas Objetivo

`/ajustes/colores`

### i18n

NO usa i18n. Labels hardcodeados en español: "Colores de marca", "Personaliza los colores...".

### Design System

- `CardSkeleton`

### Nota

Mezcla CSS Modules + CSS-in-JS (`style={}`) + CSS variables inline (`var(--border)`, `var(--accent)`).

### Uso

```tsx
function AjustesIndex() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 800);
  }, []);

  if (loading) return <CardSkeleton />;

  return (
    <div className={styles.container}>
      <Link to="/ajustes/colores" className={styles.card}>
        <h3>Colores de marca</h3>
        <p>Personaliza los colores de tu tema</p>
      </Link>
    </div>
  );
}
```
