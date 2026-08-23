import type { FormLayoutProps } from '@components/forms/types'
import styles from '@components/primitives/Form.module.css'

export default function FormLayout({
    columns = 1,
    gap = '20px',
    children,
    className,
}: FormLayoutProps) {
    const colClass = columns === 2 ? styles.cols2 : columns === 3 ? styles.cols3 : columns === 4 ? styles.cols4 : styles.cols1

    return (
        <div
            className={`${styles.layout} ${colClass} ${className ?? ''}`}
            style={{ gap }}
        >
            {children}
        </div>
    )
}
