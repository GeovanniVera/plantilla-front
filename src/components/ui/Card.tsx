import type { ReactNode } from 'react'
import styles from './Card.module.css'

interface CardProps {
    title?: string
    children: ReactNode
}

export default function Card({ title, children }: CardProps) {
    return (
        <div className={styles.card}>
            {title && <div className={styles.header}>{title}</div>}
            <div className={styles.body}>{children}</div>
        </div>
    )
}
