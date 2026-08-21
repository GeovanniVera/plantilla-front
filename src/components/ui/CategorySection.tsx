import type { ReactNode } from 'react'
import styles from './CategorySection.module.css'

interface Variant {
    name: string
    desc: string
    preview: ReactNode
    code?: string
}

interface CategorySectionProps {
    title: string
    description?: string
    variants: Variant[]
}

export default function CategorySection({ title, description, variants }: CategorySectionProps) {
    return (
        <section className={styles.section}>
            <h2 className={styles.title}>{title}</h2>
            {description && <p className={styles.desc}>{description}</p>}

            <div className={styles.grid}>
                {variants.map((variant) => (
                    <div key={variant.name} className={styles.card}>
                        <div className={styles.cardHeader}>
                            <p className={styles.cardName}>{variant.name}</p>
                            <p className={styles.cardDesc}>{variant.desc}</p>
                        </div>
                        <div className={styles.preview}>
                            {variant.preview}
                        </div>
                        {variant.code && (
                            <code className={styles.code}>{variant.code}</code>
                        )}
                    </div>
                ))}
            </div>
        </section>
    )
}
