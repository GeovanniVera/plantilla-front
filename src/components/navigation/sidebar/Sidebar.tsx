import { useState, useEffect, type ReactNode } from 'react'
import { useLocation } from 'react-router'
import { useMediaQuery } from '@hooks/useMediaQuery'
import styles from './Sidebar.module.css'
import { SidebarContext, useSidebar } from './context'
import {
    LuPanelLeftClose, LuPanelLeftOpen, LuSettings, LuLogOut, LuMenu,
} from 'react-icons/lu'

// ─── Sidebar Root ─────────────────────────────────────────
interface SidebarRootProps {
    children: ReactNode
    className?: string
}

function SidebarRoot({ children, className = '' }: SidebarRootProps) {
    const { pathname } = useLocation()
    const isMobile = useMediaQuery('(max-width: 768px)')
    const [expanded, setExpanded] = useState(false)

    // Auto-close mobile al navegar
    useEffect(() => {
        if (isMobile) setExpanded(false)
    }, [pathname, isMobile])

    // Bloquear scroll del body cuando mobile sidebar está abierto
    useEffect(() => {
        if (isMobile && expanded) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => { document.body.style.overflow = '' }
    }, [isMobile, expanded])

    const toggleExpanded = () => setExpanded((p) => !p)

    return (
        <SidebarContext.Provider value={{ expanded, toggleExpanded }}>
            {/* Bottom bar — solo en mobile */}
            {isMobile && (
                <MobileBottomBar
                    onOpenMenu={toggleExpanded}
                    items={[
                        { to: '/ajustes', icon: <LuSettings size={22} />, label: 'Ajustes' },
                        { to: '/logout', icon: <LuLogOut size={22} />, label: 'Cerrar sesión', danger: true },
                    ]}
                />
            )}

            {/* Backdrop — solo en mobile cuando está abierto */}
            {isMobile && expanded && (
                <div
                    className={styles.backdrop}
                    onClick={() => setExpanded(false)}
                    aria-hidden="true"
                />
            )}

            <aside
                className={[
                    styles.sidebar,
                    expanded && styles.sidebarExpanded,
                    isMobile && styles.sidebarMobile,
                    isMobile && expanded && styles.sidebarMobileOpen,
                    className,
                ].filter(Boolean).join(' ')}
            >
                {children}
            </aside>
        </SidebarContext.Provider>
    )
}

// ─── Sidebar.Header ───────────────────────────────────────
function SidebarHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
    return (
        <div className={`${styles.header} ${className}`}>
            {children}
        </div>
    )
}

// ─── Sidebar.Toggle ──────────────────────────────────────
function SidebarToggle({ className = '' }: { className?: string }) {
    const { expanded, toggleExpanded } = useSidebar()

    return (
        <button className={`${styles.toggleBtn} ${className}`} onClick={toggleExpanded}>
            {expanded
                ? <LuPanelLeftClose size={20} className={styles.toggleIcon} />
                : <LuPanelLeftOpen size={20} className={styles.toggleIcon} />
            }
            <span className={`${styles.toggleLabel} ${expanded ? styles.toggleLabelVisible : ''}`}>
                {expanded ? 'Colapsar' : 'Expandir'}
            </span>
        </button>
    )
}

// ─── Sidebar.Nav ──────────────────────────────────────────
function SidebarNav({ children, className = '' }: { children: ReactNode; className?: string }) {
    return (
        <nav className={`${styles.nav} ${className}`} aria-label="Navegación principal">
            {children}
        </nav>
    )
}

// ─── Sidebar.Footer ───────────────────────────────────────
function SidebarFooter({ children, className = '' }: { children: ReactNode; className?: string }) {
    return (
        <div className={`${styles.footer} ${className}`}>
            {children}
        </div>
    )
}

// ─── Mobile Bottom Bar ────────────────────────────────────
interface MobileBottomBarItem {
    to: string
    icon: ReactNode
    label: string
    danger?: boolean
}

interface MobileBottomBarProps {
    onOpenMenu: () => void
    items?: MobileBottomBarItem[]
}

function MobileBottomBar({ onOpenMenu, items = [] }: MobileBottomBarProps) {
    const { pathname } = useLocation()

    return (
        <nav className={styles.mobileBar} aria-label="Navegación móvil">
            <button className={styles.mobileItem} onClick={onOpenMenu} aria-label="Abrir menú">
                <LuMenu size={22} />
            </button>

            {items.map((item) => {
                const isActive = pathname === item.to
                return (
                    <a
                        key={item.to}
                        href={item.to}
                        className={`${styles.mobileItem} ${isActive ? styles.mobileItemActive : ''} ${item.danger ? styles.mobileItemDanger : ''}`}
                        aria-label={item.label}
                        aria-current={isActive ? 'page' : undefined}
                    >
                        {item.icon}
                    </a>
                )
            })}
        </nav>
    )
}

// ─── Compound Export ──────────────────────────────────────
const Sidebar = Object.assign(SidebarRoot, {
    Header: SidebarHeader,
    Toggle: SidebarToggle,
    Nav: SidebarNav,
    Footer: SidebarFooter,
})

export default Sidebar
export { MobileBottomBar }
export type { MobileBottomBarItem }
