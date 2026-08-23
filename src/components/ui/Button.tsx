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
    /** Override text/icon color */
    color?: string
    /** Override background color */
    colorBg?: string
    children: ReactNode
}

export default function Button({
    variant = 'primary',
    size = 'md',
    shape = 'default',
    animation = 'none',
    color,
    colorBg,
    children,
    className,
    disabled,
    style,
    ...props
}: ButtonProps) {
    const customStyle = (color || colorBg)
        ? { ...style, ...(color ? { color } : {}), ...(colorBg ? { background: colorBg } : {}) }
        : style

    return (
        <button
            className={`${styles.button} ${styles[variant]} ${styles[size]} ${styles[shape]} ${animation !== 'none' ? styles[`anim_${animation}`] : ''} ${className ?? ''}`}
            disabled={disabled}
            style={customStyle}
            {...props}
        >
            {children}
        </button>
    )
}
