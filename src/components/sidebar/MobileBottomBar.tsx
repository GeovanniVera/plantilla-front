import { Link, useLocation } from 'react-router'
import { LuMenu, LuSettings, LuLogOut } from 'react-icons/lu'
import styles from './MobileBottomBar.module.css'

interface MobileBottomBarProps {
    onOpenMenu: () => void
}

export default function MobileBottomBar({ onOpenMenu }: MobileBottomBarProps) {
    const { pathname } = useLocation()
    const isAjustes = pathname === '/ajustes'

    return (
        <nav className={styles.bar} aria-label="Navegación móvil">
            <button className={styles.item} onClick={onOpenMenu} aria-label="Abrir menú">
                <LuMenu size={22} />
            </button>

            <Link
                to="/ajustes"
                className={`${styles.item} ${isAjustes ? styles.active : ''}`}
                aria-label="Ajustes"
                aria-current={isAjustes ? 'page' : undefined}
            >
                <LuSettings size={22} />
            </Link>

            <Link to="/logout" className={`${styles.item} ${styles.danger}`} aria-label="Cerrar sesión">
                <LuLogOut size={22} />
            </Link>
        </nav>
    )
}
