# Frontend — Pendientes documentados (v1)

Estado: **v1 funcional** — cerrada con pendientes conocidos documentados.

## 🔴 Pendientes que bloquean funcionalidad

| # | Pendiente | Detalle |
|---|---|---|
| 1 | Integración de pagos | Falta el controller REST en backend + pantalla de checkout en frontend |
| 2 | Cloudinary | Cuando el backend use Cloudinary, verificar URLs de imagen (ya son absolutas y agnósticas) |

## 🟡 Pendientes de UX / features

| # | Pendiente | Detalle |
|---|---|---|
| 3 | Pantalla de checkout | Formulario de pago con InMemory (y luego Stripe/PayPal) |
| 4 | Notificaciones in-app en UI | El backend expone `/notifications` pero no hay campana/panel en el frontend |
| 5 | Gestión de archivos para el usuario | El backend tiene storage pero no hay UI de "mis archivos" |
| 6 | Paginación real de tablas | `ResponsiveTable` pagina client-side; migrar a paginación server-side con el backend |

## 🟢 Mejoras recomendadas

| # | Mejora | Detalle |
|---|---|---|
| 7 | Tests | Cubrir auth flow, guards, hooks, servicios |
| 8 | i18n | Hay traducciones parciales; completar textos propios en es/en |
| 9 | Storybook | Los componentes nuevos (ResponsiveTable, CheckboxSearchList) sin stories |

## Pruebas manuales realizadas

- [x] Registro → verificación email → login
- [x] Login con cuenta no verificada → redirige a /verify-email
- [x] Suspensión de cuenta → 403 + logout automático
- [x] Gestión de usuarios (listar, suspender, reactivar)
- [x] Roles + permisos (CRUD, asignación, checkboxes con búsqueda)
- [x] Auditoría (admin técnica + usuario legible)
- [x] Perfil + foto (upload multipart)
- [x] Responsive: tablas → cards en mobile
- [x] Menú móvil (full-width, logout real, ajustes)