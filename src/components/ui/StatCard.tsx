import type { IconType } from 'react-icons'
import styles from './StatCard.module.css'

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
    return (
        <div
            className={styles.statCard}
            style={{ '--accent-color': accent, '--icon-bg': `${accent}12` } as React.CSSProperties}
        >
            {Icon && (
                <div className={styles.iconBox}>
                    <Icon size={20} />
                </div>
            )}
            <div className={styles.value}>{value}</div>
            <div className={styles.label}>{label}</div>
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
        <div className={styles.statGroup}>
            {children}
        </div>
    )
}
