import { type ReactNode, type ElementType } from 'react'
import { LuChevronDown } from 'react-icons/lu'
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

/*
 * Accordion via the grid-template-rows 0fr -> 1fr technique (no max-height
 * guessing). Chevron is absolutely positioned and only visible when the
 * sidebar is expanded; label reveal mirrors NavItem's per-property
 * durations.
 */
const GROUP_CLASSES = 'flex flex-col w-full'

const TOGGLE_BASE_CLASSES =
    'relative flex items-center justify-center p-3 rounded-[10px] transition-[background-color,color] duration-200 whitespace-nowrap w-full cursor-pointer bg-transparent border-none text-sm font-medium text-foreground'
const TOGGLE_EXPANDED_CLASSES = 'justify-start'
const TOGGLE_ACTIVE_CLASSES = 'bg-accent-subtle text-accent'
const TOGGLE_HOVER_CLASSES = 'hover:bg-accent-subtle hover:text-accent'

const ICON_CLASSES = 'min-w-5 w-5 h-5'

const LABEL_BASE_CLASSES =
    'opacity-0 w-0 overflow-hidden ml-0 transition-[opacity,width,margin] [transition-duration:200ms,300ms,300ms]'
const LABEL_VISIBLE_CLASSES = 'opacity-100 w-auto ml-3'

const CHEVRON_BASE_CLASSES =
    'absolute right-4 transition-[transform,opacity] [transition-duration:250ms,200ms] text-foreground opacity-0'
const CHEVRON_VISIBLE_CLASSES = 'opacity-100'
const CHEVRON_OPEN_CLASSES = 'rotate-180'

const SUBNAV_BASE_CLASSES = 'grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-in-out'
const SUBNAV_OPEN_CLASSES = 'grid-rows-[1fr]'
const SUBNAV_INNER_CLASSES = 'overflow-hidden flex flex-col gap-0.5 mt-1'

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
        TOGGLE_BASE_CLASSES,
        expanded && TOGGLE_EXPANDED_CLASSES,
        active ? TOGGLE_ACTIVE_CLASSES : TOGGLE_HOVER_CLASSES,
        className,
    ].filter(Boolean).join(' ')

    const chevronClass = [
        CHEVRON_BASE_CLASSES,
        expanded && CHEVRON_VISIBLE_CLASSES,
        open && CHEVRON_OPEN_CLASSES,
    ].filter(Boolean).join(' ')

    return (
        <div className={GROUP_CLASSES}>
            <button className={toggleClass} onClick={onToggle}>
                <Icon size={20} className={ICON_CLASSES} />
                <span className={`${LABEL_BASE_CLASSES} ${expanded ? LABEL_VISIBLE_CLASSES : ''}`}>
                    {label}
                </span>
                <LuChevronDown size={16} className={chevronClass} />
            </button>

            <div className={`${SUBNAV_BASE_CLASSES} ${open ? SUBNAV_OPEN_CLASSES : ''}`}>
                <div className={SUBNAV_INNER_CLASSES}>
                    {children}
                </div>
            </div>
        </div>
    )
}
