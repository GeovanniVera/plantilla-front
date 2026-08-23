import type { ReactNode } from 'react'

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

// ─── Styling ──────────────────────────────────────────────
// Colors come from the semantic status tokens (see src/styles/tailwind.css).
const BADGE_CLASSES: Record<BadgeVariant, string> = {
    default: 'bg-accent-subtle text-accent',
    success: 'bg-success-bg text-success-strong',
    warning: 'bg-warning-bg text-warning-strong',
    info: 'bg-info-bg text-info-strong',
}

// ─── Badge Root ───────────────────────────────────────────
function BadgeRoot({ variant = 'default', children, className = '' }: BadgeRootProps) {
    return (
        <span
            className={`inline-flex items-center px-2.5 py-1 rounded-[20px] text-xs font-semibold tracking-[0.2px] whitespace-nowrap ${BADGE_CLASSES[variant]} ${className}`}
        >
            {children}
        </span>
    )
}

// ─── Badge.Icon ───────────────────────────────────────────
function BadgeIcon({ children, className = '' }: BadgeIconProps) {
    return (
        <span className={`inline-flex items-center mr-1 ${className}`}>
            {children}
        </span>
    )
}

// ─── Compound Export ──────────────────────────────────────
const Badge = Object.assign(BadgeRoot, {
    Icon: BadgeIcon,
})

export default Badge
