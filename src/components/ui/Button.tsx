import type { ButtonHTMLAttributes, ReactNode } from 'react'
import styles from './Button.module.css'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'
export type ButtonShape = 'default' | 'rounded' | 'square'
export type ButtonAnimation = 'none' | 'pulse' | 'bounce' | 'shake'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant
    size?: ButtonSize
    shape?: ButtonShape
    animation?: ButtonAnimation
    loading?: boolean
    children: ReactNode
}

export default function Button({
    variant = 'primary',
    size = 'md',
    shape = 'default',
    animation = 'none',
    loading = false,
    children,
    className,
    disabled,
    ...props
}: ButtonProps) {
    return (
        <button
            className={`${styles.button} ${styles[variant]} ${styles[size]} ${styles[shape]} ${animation !== 'none' ? styles[`anim_${animation}`] : ''} ${loading ? styles.loading : ''} ${className ?? ''}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading && <span className={styles.spinner} />}
            {children}
        </button>
    )
}
