import type { ReactNode } from 'react'
import styles from './Badge.module.css'

// ─── Types ────────────────────────────────────────────────
type BadgeVariant = 'default' | 'success' | 'warning' | 'info'

interface BadgeRootProps {
    variant?: BadgeVariant
    children: ReactNode
    className?: string
}

interface BadgeIconProps {
    children: ReactNode
    className?: string
}

// ─── Badge Root ───────────────────────────────────────────
function BadgeRoot({ variant = 'default', children, className = '' }: BadgeRootProps) {
    return (
        <span className={`${styles.badge} ${styles[variant]} ${className}`}>
            {children}
        </span>
    )
}

// ─── Badge.Icon ───────────────────────────────────────────
function BadgeIcon({ children, className = '' }: BadgeIconProps) {
    return (
        <span className={`${styles.icon} ${className}`}>
            {children}
        </span>
    )
}

// ─── Compound Export ──────────────────────────────────────
const Badge = Object.assign(BadgeRoot, {
    Icon: BadgeIcon,
})

export default Badge
