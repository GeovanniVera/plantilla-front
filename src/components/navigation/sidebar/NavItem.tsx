import { type ElementType } from 'react'
import { Link } from 'react-router'
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

/*
 * Icons inherit currentColor, so state colors set on the root are enough.
 * Danger wins over active/hover exactly like the legacy .danger.active
 * rules did — resolved logically instead of via cascade order.
 */
const ITEM_BASE_CLASSES =
    'flex items-center justify-center p-3 rounded-[10px] transition-[background-color,color] duration-200 whitespace-nowrap no-underline text-foreground w-full cursor-pointer'
const EXPANDED_CLASSES = 'justify-start'

const ACTIVE_CLASSES = 'bg-accent-subtle text-accent'
const HOVER_CLASSES = 'hover:bg-accent-subtle hover:text-accent'
const DANGER_CLASSES = 'text-danger-strong'
const DANGER_HOVER_CLASSES = 'hover:bg-danger-strong/10 hover:text-danger-strong'
const DANGER_ACTIVE_CLASSES = 'bg-danger-strong/10 text-danger-strong'

/* Label reveal: opacity is faster than width/margin, matching the
 * original per-property durations. */
const TEXT_BASE_CLASSES =
    'opacity-0 w-0 overflow-hidden ml-0 text-sm font-medium transition-[opacity,width,margin] [transition-duration:200ms,300ms,300ms]'
const TEXT_VISIBLE_CLASSES = 'opacity-100 w-auto ml-3'

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

    const stateClasses = danger
        ? active
            ? DANGER_ACTIVE_CLASSES
            : `${DANGER_CLASSES} ${DANGER_HOVER_CLASSES}`
        : active
            ? ACTIVE_CLASSES
            : HOVER_CLASSES

    const itemClass = [
        ITEM_BASE_CLASSES,
        expanded && EXPANDED_CLASSES,
        stateClasses,
        className,
    ].filter(Boolean).join(' ')

    const textClass = [
        TEXT_BASE_CLASSES,
        expanded && TEXT_VISIBLE_CLASSES,
    ].filter(Boolean).join(' ')

    const linkProps = to ? { to } : {}

    return (
        <Component {...linkProps} className={itemClass}>
            <Icon size={20} />
            <span className={textClass}>{label}</span>
        </Component>
    )
}
