import { type ElementType } from 'react'
import { Link } from 'react-router'
import styles from './NavItem.module.css'
import { useSidebar } from './context'

interface NavItemProps {
    /** Componente renderizador. Default: Link de react-router */
    as?: ElementType
    /** Props adicionales pasadas al componente renderizador */
    to?: string
    /** Icono del componente react-icons */
    icon: ElementType
    /** Texto de la etiqueta */
    label: string
    /** Estado activo */
    active?: boolean
    /** Estilo de peligro (rojo) */
    danger?: boolean
    /** Clase CSS adicional */
    className?: string
}

export default function NavItem({
    as,
    to,
    icon: Icon,
    label,
    active = false,
    danger = false,
    className = '',
}: NavItemProps) {
    const { expanded } = useSidebar()
    const Component = as || Link

    const itemClass = [
        styles.item,
        expanded && styles.itemExpanded,
        active && styles.active,
        danger && styles.danger,
        className,
    ].filter(Boolean).join(' ')

    const textClass = [
        styles.text,
        expanded && styles.textVisible,
    ].filter(Boolean).join(' ')

    const linkProps = to ? { to } : {}

    return (
        <Component {...linkProps} className={itemClass}>
            <Icon size={20} className={styles.icon} />
            <span className={textClass}>{label}</span>
        </Component>
    )
}
