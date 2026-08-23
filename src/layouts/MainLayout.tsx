import { useState } from 'react'
import { Outlet, useLocation, Link, NavLink } from 'react-router'
import { LuSettings, LuHouse, LuBlocks, LuMousePointerClick, LuTable2, LuCreditCard, LuTextCursorInput, LuPanelRightOpen, LuBell, LuNavigation, LuPalette, LuShield, LuCalendar } from 'react-icons/lu'
import Sidebar from '@components/navigation/sidebar/Sidebar'
import SidebarLogo from '@components/navigation/sidebar/SidebarLogo'
import UserAvatar from '@components/navigation/sidebar/UserAvatar'
import UserClock from '@components/navigation/sidebar/UserClock'
import NavItem from '@components/navigation/sidebar/NavItem'
import NavGroup from '@components/navigation/sidebar/NavGroup'
import styles from './MainLayout.module.css'

// ─── Route config ────────────────────────────────────────
interface RouteConfig {
    title: string
    subtitle?: string
}

const ROUTE_CONFIG: Record<string, RouteConfig> = {
    '/': { title: 'Inicio', subtitle: 'Librería de UI reutilizable con composición, variantes CSS y theming.' },
    componentes: { title: 'Componentes', subtitle: 'Explora los componentes disponibles del design system.' },
    botones: { title: 'Botones', subtitle: 'Configura variantes, tamaños, formas y animaciones. Genera el código listo para usar.' },
    cards: { title: 'Cards', subtitle: 'Tarjetas para contenido agrupado con variantes de header.' },
    tablas: { title: 'Tablas', subtitle: 'Configura y personaliza tablas reutilizables. Selecciona el tipo, activa características y preview el resultado en tiempo real.' },
    formularios: { title: 'Formularios', subtitle: 'Configura formularios por secciones, con validación por campo y modo multi-paso.' },
    modales: { title: 'Modales', subtitle: 'Diálogos modales, drawers laterales, drawers multinivel y confirmaciones. Cada ejemplo es funcional.' },
    notificaciones: { title: 'Notificaciones', subtitle: 'Toasts para feedback rápido y ConfirmDialogs para acciones importantes.' },
    navegacion: { title: 'Navegación', subtitle: 'Breadcrumb con migas de pan responsive y Tabs con 3 variantes.' },
    calendario: { title: 'Calendario', subtitle: 'DatePicker, DateRangePicker y calendario inline con locale español.' },
    ajustes: { title: 'Ajustes', subtitle: 'Configuración de la aplicación.' },
    colores: { title: 'Colores de marca', subtitle: 'Personaliza los colores de la aplicación.' },
    auditoria: { title: 'Auditoría', subtitle: 'Logs del sistema, seguridad y reglas de auditoría.' },
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

    return (
        <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>{title}</h1>
            {config?.subtitle && (
                <p className={styles.pageSubtitle}>{config.subtitle}</p>
            )}
        </div>
    )
}

function useActive(path: string) {
    const { pathname } = useLocation()
    return path === '/' ? pathname === '/' : pathname.startsWith(path)
}

function AppNavItems() {
    const isActive = useActive
    const [componentesOpen, setComponentesOpen] = useState(isActive('/componentes'))

    return (
        <>
            <NavItem to="/" icon={LuHouse} label="Inicio" active={isActive('/')} />

            <NavGroup
                icon={LuBlocks}
                label="Componentes"
                open={componentesOpen}
                active={isActive('/componentes')}
                onToggle={() => setComponentesOpen((p) => !p)}
            >
                <NavItem as={NavLink} to="/componentes/botones" icon={LuMousePointerClick} label="Botones" active={isActive('/componentes/botones')} />
                <NavItem as={NavLink} to="/componentes/cards" icon={LuCreditCard} label="Cards" active={isActive('/componentes/cards')} />
                <NavItem as={NavLink} to="/componentes/tablas" icon={LuTable2} label="Tablas" active={isActive('/componentes/tablas')} />
                <NavItem as={NavLink} to="/componentes/formularios" icon={LuTextCursorInput} label="Formularios" active={isActive('/componentes/formularios')} />
                <NavItem as={NavLink} to="/componentes/modales" icon={LuPanelRightOpen} label="Modales" active={isActive('/componentes/modales')} />
                <NavItem as={NavLink} to="/componentes/notificaciones" icon={LuBell} label="Notificaciones" active={isActive('/componentes/notificaciones')} />
                <NavItem as={NavLink} to="/componentes/navegacion" icon={LuNavigation} label="Navegación" active={isActive('/componentes/navegacion')} />
                <NavItem as={NavLink} to="/componentes/calendario" icon={LuCalendar} label="Calendario" active={isActive('/componentes/calendario')} />
            </NavGroup>
            <NavItem as={NavLink} to="/calendario" icon={LuCalendar} label="Calendario" active={isActive('/calendario')} />
            <NavItem as={NavLink} to="/auditoria" icon={LuShield} label="Auditoría" active={isActive('/auditoria')} />

        </>
    )
}

function AppFooter() {
    const isActive = useActive
    const [ajustesOpen, setAjustesOpen] = useState(isActive('/ajustes'))

    return (
        <>
            <NavGroup
                icon={LuSettings}
                label="Ajustes"
                open={ajustesOpen}
                active={isActive('/ajustes')}
                onToggle={() => setAjustesOpen((p) => !p)}
            >
                <NavItem as={NavLink} to="/ajustes/colores" icon={LuPalette} label="Colores de marca" active={isActive('/ajustes/colores')} />
            </NavGroup>
        </>
    )
}

export default function MainLayout() {
    return (
        <div style={{ display: 'flex', height: '100vh' }}>
            <Sidebar>
                <Sidebar.Header>
                    <SidebarLogo src="/logo.svg" name="Semilla Tecnológica" />
                    <UserAvatar name="Geovanni V." role="Dev" />
                    <UserClock />
                </Sidebar.Header>

                <Sidebar.Toggle />

                <Sidebar.Nav>
                    <AppNavItems />
                </Sidebar.Nav>

                <Sidebar.Footer>
                    <AppFooter />
                </Sidebar.Footer>
            </Sidebar>

            <main className={styles.main}>
                <Breadcrumbs />
                <PageHeader />
                <Outlet />
            </main>
        </div>
    )
}