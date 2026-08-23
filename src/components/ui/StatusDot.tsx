import styles from './StatusDot.module.css'

export type StatusColor = 'green' | 'yellow' | 'red' | 'blue' | 'gray'

export interface StatusDotProps {
    /** Color del punto */
    color: StatusColor
    /** Texto a mostrar al lado del punto */
    label?: string
    /** Variante de visualización */
    variant?: 'dot' | 'badge' | 'full'
    /** Tamaño */
    size?: 'sm' | 'md'
}

const COLOR_MAP: Record<StatusColor, { bg: string; text: string; dot: string }> = {
    green:  { bg: 'rgba(34, 197, 94, 0.1)',  text: '#16a34a', dot: '#22c55e' },
    yellow: { bg: 'rgba(245, 158, 11, 0.1)', text: '#d97706', dot: '#f59e0b' },
    red:    { bg: 'rgba(239, 68, 68, 0.1)',  text: '#dc2626', dot: '#ef4444' },
    blue:   { bg: 'rgba(59, 130, 246, 0.1)', text: '#2563eb', dot: '#3b82f6' },
    gray:   { bg: 'rgba(107, 114, 128, 0.1)', text: '#6b7280', dot: '#9ca3af' },
}

export function StatusDot({
    color,
    label,
    variant = 'dot',
    size = 'md',
}: StatusDotProps) {
    const colors = COLOR_MAP[color]

    if (variant === 'dot') {
        return (
            <span className={styles.dotContainer}>
                <span
                    className={`${styles.dot} ${size === 'sm' ? styles.dotSm : styles.dotMd}`}
                    style={{ background: colors.dot }}
                />
                {label && (
                    <span className={styles.label} style={{ color: colors.text }}>
                        {label}
                    </span>
                )}
            </span>
        )
    }

    if (variant === 'badge') {
        return (
            <span
                className={`${styles.badge} ${size === 'sm' ? styles.badgeSm : styles.badgeMd}`}
                style={{ background: colors.bg, color: colors.text }}
            >
                <span className={styles.dot} style={{ background: colors.dot }} />
                {label}
            </span>
        )
    }

    // variant === 'full' — fondo coloreado
    return (
        <span
            className={`${styles.full} ${size === 'sm' ? styles.fullSm : styles.fullMd}`}
            style={{ background: colors.bg, color: colors.text }}
        >
            {label}
        </span>
    )
}
