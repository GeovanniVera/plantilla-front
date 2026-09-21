# Otras páginas

Dos páginas que no pertenecen a los flujos de auth, admin ni ajustes: la landing post-login y los términos legales.

## DashboardPage

**Ruta**: `/dashboard` · **Acceso**: autenticado (bajo `ProtectedRoute`) · **Lazy**: sí

Landing post-login dentro de `MainLayout`. Contenido:

| Sección | Detalle |
|---|---|
| Bienvenida | `Card` elevada con "Bienvenido, {user.name}" y un `Badge` por rol del usuario. |
| Estadísticas | `StatCardGroup` con 3 `StatCard`s (Notificaciones, Archivos, Pagos). ⚠ **Valores placeholder hardcodeados en `0`** — no consumen ninguna API. |
| Acciones rápidas | 3 cards navegables (Usuarios, Roles, Permisos), cada una gateada con `Can privilege="…"` (`users.read`, `roles.read`, `permissions.read`). |

**Deuda conocida**: los `StatCard`s son placeholder con valores `0`; no hay datos reales de notificaciones/archivos/pagos en esta plantilla.

## TermsPage

**Ruta**: `/terms` · **Acceso**: público · **Lazy**: sí

Términos y Condiciones estáticos. Puntos clave:

- El **cuerpo legal está hardcodeado en español** en el archivo (constante `SECTIONS` con secciones numeradas: Aceptación, Uso de la Aplicación, Cuenta de Usuario, Propiedad Intelectual, Limitación de Responsabilidad, etc.) — **no pasa por i18n**.
- El encabezado de la página sí usa `useTranslation`.
- Incluye navegación de retorno (ícono de flecha + enlace).
- Es un documento genérico de plantilla: el desarrollador debe personalizarlo según el caso de uso.

**Deuda conocida**: contenido legal no traducido (solo en español) y no parametrizado; requiere personalización por proyecto.