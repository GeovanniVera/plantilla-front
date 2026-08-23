import type { ReactNode, ImgHTMLAttributes } from 'react'
import styles from './Card.module.css'

// ─── Types ────────────────────────────────────────────────
export type CardVariant = 'default' | 'outlined' | 'elevated' | 'flat'

interface CardRootProps {
    variant?: CardVariant
    onClick?: () => void
    children: ReactNode
    className?: string
}

interface CardImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'className'> {
    className?: string
}

interface CardHeaderProps {
    children: ReactNode
    className?: string
}

interface CardTitleProps {
    children: ReactNode
    className?: string
}

interface CardDescriptionProps {
    children: ReactNode
    className?: string
}

interface CardBodyProps {
    children: ReactNode
    className?: string
}

interface CardFooterProps {
    children: ReactNode
    className?: string
}

// ─── Card Root ────────────────────────────────────────────
function CardRoot({ variant = 'default', onClick, children, className = '' }: CardRootProps) {
    const isClickable = !!onClick

    return (
        <div
            className={[
                styles.card,
                styles[variant],
                isClickable ? styles.clickable : '',
                className,
            ]
                .filter(Boolean)
                .join(' ')}
            onClick={onClick}
            role={isClickable ? 'button' : undefined}
            tabIndex={isClickable ? 0 : undefined}
            onKeyDown={
                isClickable
                    ? (e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              onClick()
                          }
                      }
                    : undefined
            }
        >
            {children}
        </div>
    )
}

// ─── Card.Image ───────────────────────────────────────────
function CardImage({ className = '', ...props }: CardImageProps) {
    return (
        <div className={`${styles.imageWrapper} ${className}`}>
            <img className={styles.image} {...props} />
        </div>
    )
}

// ─── Card.Header ──────────────────────────────────────────
function CardHeader({ children, className = '' }: CardHeaderProps) {
    return (
        <div className={`${styles.header} ${className}`}>
            {children}
        </div>
    )
}

// ─── Card.Title ───────────────────────────────────────────
function CardTitle({ children, className = '' }: CardTitleProps) {
    return (
        <div className={`${styles.title} ${className}`}>
            {children}
        </div>
    )
}

// ─── Card.Description ─────────────────────────────────────
function CardDescription({ children, className = '' }: CardDescriptionProps) {
    return (
        <div className={`${styles.description} ${className}`}>
            {children}
        </div>
    )
}

// ─── Card.Body ────────────────────────────────────────────
function CardBody({ children, className = '' }: CardBodyProps) {
    return (
        <div className={`${styles.body} ${className}`}>
            {children}
        </div>
    )
}

// ─── Card.Footer ──────────────────────────────────────────
function CardFooter({ children, className = '' }: CardFooterProps) {
    return (
        <div className={`${styles.footer} ${className}`}>
            {children}
        </div>
    )
}

// ─── Compound Export ──────────────────────────────────────
const Card = Object.assign(CardRoot, {
    Image: CardImage,
    Header: CardHeader,
    Title: CardTitle,
    Description: CardDescription,
    Body: CardBody,
    Footer: CardFooter,
})

export default Card
