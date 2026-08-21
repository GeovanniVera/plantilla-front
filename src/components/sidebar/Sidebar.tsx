import { useState, useEffect } from 'react'
import { useLocation } from 'react-router'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import styles from './Sidebar.module.css'
import SidebarLogo from './SidebarLogo'
import UserAvatar from './UserAvatar'
import UserClock from './UserClock'
import NavItem from './NavItem'
import NavGroup from './NavGroup'
import MobileBottomBar from './MobileBottomBar'
import {
    LuFolder, LuSettings, LuHouse,
    LuBlocks, LuFileText, LuChartBar, LuUsers, LuMail,
    LuCalendar, LuImage, LuMusic, LuVideo,
    LuShoppingCart, LuHeart, LuStar, LuBookmark,
    LuLogOut, LuLayoutGrid, LuPalette, LuPlug, LuShield,
    LuPanelLeftClose, LuPanelLeftOpen,
    LuMousePointerClick, LuTable2, LuCreditCard, LuMonitor, LuTextCursorInput
} from "react-icons/lu"
import type { NavItem as NavItemType, GroupItem } from './types'

// --- Breakpoint mobile ---
const MOBILE_BREAKPOINT = '(max-width: 768px)'

// --- Datos de navegación ---
const navItems: NavItemType[] = [
    { to: '/', icon: LuHouse, label: 'Inicio' },
    { to: '/proyectos', icon: LuFolder, label: 'Proyectos' },
    { to: '/documentos', icon: LuFileText, label: 'Documentos' },
    { to: '/analytics', icon: LuChartBar, label: 'Analytics' },
    { to: '/equipo', icon: LuUsers, label: 'Equipo' },
    { to: '/mensajes', icon: LuMail, label: 'Mensajes' },
    { to: '/calendario', icon: LuCalendar, label: 'Calendario' },
    { to: '/galeria', icon: LuImage, label: 'Galería' },
    { to: '/musica', icon: LuMusic, label: 'Música' },
    { to: '/videos', icon: LuVideo, label: 'Videos' },
    { to: '/tienda', icon: LuShoppingCart, label: 'Tienda' },
    { to: '/favoritos', icon: LuHeart, label: 'Favoritos' },
    { to: '/destacados', icon: LuStar, label: 'Destacados' },
    { to: '/guardados', icon: LuBookmark, label: 'Guardados' },
]

const groups: GroupItem[] = [
    {
        id: 'componentes',
        icon: LuBlocks,
        label: 'Componentes',
        basePath: '/componentes',
        children: [
            { to: '/componentes/botones', icon: LuMousePointerClick, label: 'Botones' },
            { to: '/componentes/cards', icon: LuCreditCard, label: 'Cards' },
            { to: '/componentes/tablas', icon: LuTable2, label: 'Tablas' },
            { to: '/componentes/formularios', icon: LuTextCursorInput, label: 'Formularios' },
        ],
    },
    {
        id: 'diseno',
        icon: LuPalette,
        label: 'Diseño',
        basePath: '/diseno',
        children: [
            { to: '/diseno/colores', icon: LuPalette, label: 'Colores' },
            { to: '/diseno/tipografia', icon: LuFileText, label: 'Tipografía' },
            { to: '/diseno/iconos', icon: LuImage, label: 'Iconos' },
            { to: '/diseno/espaciado', icon: LuLayoutGrid, label: 'Espaciado' },
        ],
    },
    {
        id: 'integraciones',
        icon: LuPlug,
        label: 'Integraciones',
        basePath: '/integraciones',
        children: [
            { to: '/integraciones/api', icon: LuPlug, label: 'API' },
            { to: '/integraciones/webhooks', icon: LuMail, label: 'Webhooks' },
            { to: '/integraciones/auth', icon: LuShield, label: 'Auth' },
        ],
    },
    {
        id: 'herramientas',
        icon: LuSettings,
        label: 'Herramientas',
        basePath: '/herramientas',
        children: [
            { to: '/herramientas/consola', icon: LuMonitor, label: 'Consola' },
            { to: '/herramientas/logs', icon: LuFileText, label: 'Logs' },
            { to: '/herramientas/monitor', icon: LuChartBar, label: 'Monitor' },
            { to: '/herramientas/deploy', icon: LuFolder, label: 'Deploy' },
            { to: '/herramientas/backup', icon: LuBookmark, label: 'Backup' },
        ],
    },
]

const footerItems: NavItemType[] = [
    { to: '/ajustes', icon: LuSettings, label: 'Ajustes' },
    { to: '/logout', icon: LuLogOut, label: 'Cerrar sesión', danger: true },
]

// --- Componente ---
export default function Sidebar() {
    const { pathname } = useLocation()
    const isMobile = useMediaQuery(MOBILE_BREAKPOINT)

    // Un solo estado para expandir/colapsar
    const [isExpanded, setIsExpanded] = useState(false)

    // Auto-close mobile al navegar
    useEffect(() => {
        if (isMobile) setIsExpanded(false)
    }, [pathname, isMobile])

    // Bloquear scroll del body cuando mobile sidebar está abierto
    useEffect(() => {
        if (isMobile && isExpanded) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => { document.body.style.overflow = '' }
    }, [isMobile, isExpanded])

    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
        componentes: pathname.startsWith('/componentes'),
        diseno: pathname.startsWith('/diseno'),
        integraciones: pathname.startsWith('/integraciones'),
        herramientas: pathname.startsWith('/herramientas'),
    })

    const isActive = (path: string) =>
        path === '/' ? pathname === '/' : pathname.startsWith(path)

    const isGroupActive = (basePath: string) => pathname.startsWith(basePath)

    const toggleExpanded = () => setIsExpanded((p) => !p)

    return (
        <>
            {/* Bottom bar — solo en mobile */}
            {isMobile && <MobileBottomBar onOpenMenu={toggleExpanded} />}

            {/* Backdrop — solo en mobile cuando está abierto */}
            {isMobile && isExpanded && (
                <div
                    className={styles.backdrop}
                    onClick={() => setIsExpanded(false)}
                    aria-hidden="true"
                />
            )}

            <aside
                className={[
                    styles.sidebar,
                    isExpanded && styles.sidebarExpanded,
                    isMobile && styles.sidebarMobile,
                    isMobile && isExpanded && styles.sidebarMobileOpen,
                ].filter(Boolean).join(' ')}
            >
                <div className={styles.header}>
                    <SidebarLogo src="/logo.svg" name="Semilla Tecnológica" expanded={isExpanded} />
                    <UserAvatar name="Alejandro" expanded={isExpanded} />
                    <UserClock expanded={isExpanded} />
                </div>

                {/* Toggle — fijo fuera del nav, entre header y nav */}
                <button className={styles.toggleBtn} onClick={toggleExpanded}>
                    {isExpanded
                        ? <LuPanelLeftClose size={20} className={styles.toggleIcon} />
                        : <LuPanelLeftOpen size={20} className={styles.toggleIcon} />
                    }
                    <span className={`${styles.toggleLabel} ${isExpanded ? styles.toggleLabelVisible : ''}`}>
                        {isExpanded ? 'Colapsar' : 'Expandir'}
                    </span>
                </button>

                <nav className={styles.nav} aria-label="Navegación principal">
                    {navItems.map((item) => (
                        <NavItem key={item.to} item={item} active={isActive(item.to)} expanded={isExpanded} />
                    ))}

                    {groups.map((group) => (
                        <NavGroup
                            key={group.id}
                            group={group}
                            open={openGroups[group.id]}
                            active={isGroupActive(group.basePath)}
                            expanded={isExpanded}
                            onToggle={() => setOpenGroups((p) => ({ ...p, [group.id]: !p[group.id] }))}
                            isChildActive={isActive}
                        />
                    ))}
                </nav>

                <div className={styles.footer}>
                    {footerItems.map((item) => (
                        <NavItem key={item.to} item={item} active={isActive(item.to)} expanded={isExpanded} />
                    ))}
                </div>
            </aside>
        </>
    )
}
