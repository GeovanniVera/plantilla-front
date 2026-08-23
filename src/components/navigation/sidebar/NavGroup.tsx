import { type ReactNode, type ElementType } from 'react'
import { LuChevronDown } from 'react-icons/lu'
import styles from './NavGroup.module.css'
import { useSidebar } from './context'

interface NavGroupProps {
    /** Icono del grupo */
    icon: ElementType
    /** Label del grupo */
    label: string
    /** Si el grupo está abierto */
    open?: boolean
    /** Si algún hijo está activo */
    active?: boolean
    /** Callback al hacer click en el toggle */
    onToggle?: () => void
    /** Contenido del grupo (NavItem u otros componentes) */
    children: ReactNode
    /** Clase CSS adicional */
    className?: string
}

export default function NavGroup({
    icon: Icon,
    label,
    open = false,
    active = false,
    onToggle,
    children,
    className = '',
}: NavGroupProps) {
    const { expanded } = useSidebar()

    const toggleClass = [
        styles.toggle,
        expanded && styles.toggleExpanded,
        active && styles.active,
        className,
    ].filter(Boolean).join(' ')

    const chevronClass = [
        styles.chevron,
        expanded && styles.chevronVisible,
        open && styles.chevronOpen,
    ].filter(Boolean).join(' ')

    return (
        <div className={styles.group}>
            <button className={toggleClass} onClick={onToggle}>
                <Icon size={20} className={styles.icon} />
                <span className={`${styles.label} ${expanded ? styles.labelVisible : ''}`}>
                    {label}
                </span>
                <LuChevronDown size={16} className={chevronClass} />
            </button>

            <div className={`${styles.subNav} ${open ? styles.subNavOpen : ''}`}>
                <div className={styles.subNavInner}>
                    {children}
                </div>
            </div>
        </div>
    )
}
