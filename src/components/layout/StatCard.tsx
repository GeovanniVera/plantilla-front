import type { IconType } from 'react-icons'

export interface StatCardProps {
    /** Valor numérico a mostrar */
    value: number
    /** Label descriptivo (se muestra en mayúsculas) */
    label: string
    /** Color de acento (borde superior + ícono) */
    accent?: string
    /** Componente ícono de react-icons (ej: LuTriangleAlert) */
    icon?: IconType
}

/**
 * Tarjeta de estadísticas estilo dashboard corporativo.
 * Diseño minimalista con borde superior de color, ícono en caja y número destacado.
 *
 * @example
 * <StatCard value={25} label="Total" icon={LuCalendar} accent="#64748b" />
 * <StatCard value={5} label="Disponibles" icon={LuCheck} accent="#10b981" />
 */
export function StatCard({ value, label, accent = '#94a3b8', icon: Icon }: StatCardProps) {
    /* --accent-color / --icon-bg stay prop-driven inline variables: they
     * are per-instance values, NOT design tokens. The component always
     * sets them, so the utilities below can reference them without
     * fallbacks. */
    return (
        <div
            className={STAT_CARD_CLASSES}
            style={{ '--accent-color': accent, '--icon-bg': `${accent}12` } as React.CSSProperties}
        >
            {Icon && (
                <div className={ICON_BOX_CLASSES}>
                    <Icon size={20} />
                </div>
            )}
            <div className={VALUE_CLASSES}>{value}</div>
            <div className={LABEL_CLASSES}>{label}</div>
        </div>
    )
}

export interface StatCardGroupProps {
    children: React.ReactNode
}

/**
 * Grid responsivo para agrupar StatCards.
 * Se adapta automáticamente: 4 columnas en desktop, 2 en tablet, 1 en móvil.
 */
export function StatCardGroup({ children }: StatCardGroupProps) {
    return (
        <div className={STAT_GROUP_CLASSES}>
            {children}
        </div>
    )
}

/* ─── Styling ────────────────────────────────────────────── */
const STAT_CARD_CLASSES =
    'relative flex flex-col gap-3 p-6 bg-background border border-border-base border-t-4 border-t-(--accent-color) rounded-[16px] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)] transition-[transform,box-shadow] duration-200 overflow-hidden hover:-translate-y-0.5 hover:shadow-[0_10px_25px_rgba(0,0,0,0.06),0_4px_10px_rgba(0,0,0,0.03)]'

const ICON_BOX_CLASSES =
    'flex items-center justify-center size-10 rounded-[10px] bg-(--icon-bg) text-(--accent-color) shrink-0'

const VALUE_CLASSES = 'text-[32px] font-bold leading-none text-heading tabular-nums tracking-[-0.02em]'

const LABEL_CLASSES = 'text-xs font-semibold uppercase tracking-[0.08em] text-foreground opacity-60 leading-none'

const STAT_GROUP_CLASSES = 'grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 mb-6'
