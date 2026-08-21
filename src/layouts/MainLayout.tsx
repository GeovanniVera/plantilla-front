import { Outlet, useLocation, Link } from 'react-router'
import Sidebar from '../components/sidebar/Sidebar'
import styles from './MainLayout.module.css'

// ─── Route config ────────────────────────────────────────
interface RouteConfig {
    title: string
    subtitle?: string
}

const ROUTE_CONFIG: Record<string, RouteConfig> = {
    '/': { title: 'Inicio', subtitle: 'Librería de UI reutilizable con composición, variantes CSS y theming.' },
    botones: { title: 'Botones', subtitle: 'Configura variantes, tamaños, formas y animaciones. Genera el código listo para usar.' },
    cards: { title: 'Cards', subtitle: 'Tarjetas para contenido agrupado con variantes de header.' },
    tablas: { title: 'Tablas', subtitle: 'Configura y personaliza tablas reutilizables. Selecciona el tipo, activa características y preview el resultado en tiempo real.' },
    formularios: { title: 'Formularios', subtitle: 'Configura formularios por secciones, con validación por campo y modo multi-paso.' },
    modales: { title: 'Modales', subtitle: 'Diálogos modales, drawers laterales, drawers multinivel y confirmaciones. Cada ejemplo es funcional.' },
    notificaciones: { title: 'Notificaciones', subtitle: 'Toasts para feedback rápido y ConfirmDialogs para acciones importantes.' },
    navegacion: { title: 'Navegación', subtitle: 'Breadcrumb con migas de pan responsive y Tabs con 3 variantes.' },
    ajustes: { title: 'Ajustes', subtitle: 'Personaliza los colores de marca de la aplicación.' },
}

function Breadcrumbs() {
    const { pathname } = useLocation()

    // Don't show on home
    if (pathname === '/') return null

    const segments = pathname.split('/').filter(Boolean)

    const items = segments.map((seg, i) => {
        const isLast = i === segments.length - 1
        const href = isLast ? undefined : '/' + segments.slice(0, i + 1).join('/')
        const config = ROUTE_CONFIG[seg]
        const label = config?.title ?? seg.charAt(0).toUpperCase() + seg.slice(1)

        return { label, href, isLast }
    })

    return (
        <nav className={styles.breadcrumbs}>
            {items.map((item, i) => (
                <span key={i} className={styles.crumb}>
                    {i > 0 && <span className={styles.crumbSep}>›</span>}
                    {item.isLast ? (
                        <span className={styles.crumbCurrent}>{item.label}</span>
                    ) : (
                        <Link to={item.href!} className={styles.crumbLink}>{item.label}</Link>
                    )}
                </span>
            ))}
        </nav>
    )
}

function PageHeader() {
    const { pathname } = useLocation()

    // Check home first
    const homeConfig = ROUTE_CONFIG['/']
    if (pathname === '/' && homeConfig) {
        return (
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>{homeConfig.title}</h1>
                {homeConfig.subtitle && (
                    <p className={styles.pageSubtitle}>{homeConfig.subtitle}</p>
                )}
            </div>
        )
    }

    const segments = pathname.split('/').filter(Boolean)
    const lastSegment = segments[segments.length - 1]
    const config = ROUTE_CONFIG[lastSegment]
    const title = config?.title ?? lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1)

    // Don't show title on index pages like /componentes
    if (segments.length === 1 && segments[0] === 'componentes') return null

    return (
        <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>{title}</h1>
            {config?.subtitle && (
                <p className={styles.pageSubtitle}>{config.subtitle}</p>
            )}
        </div>
    )
}

export default function MainLayout() {
    return (
        <div style={{ display: 'flex', height: '100vh' }}>
            <Sidebar />
            <main className={styles.main}>
                <Breadcrumbs />
                <PageHeader />
                <Outlet />
            </main>
        </div>
    )
}