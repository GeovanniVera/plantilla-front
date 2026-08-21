import { LuChevronRight, LuEllipsis } from 'react-icons/lu'
import styles from './Breadcrumb.module.css'
import type { BreadcrumbProps } from './types'

// ─── Default separator icon ───────────────────────────────
function DefaultSeparator() {
    return <LuChevronRight size={14} className={styles.separatorIcon} />
}

// ─── Component ────────────────────────────────────────────
export function Breadcrumb({ items, separator, className }: BreadcrumbProps) {
    const sep = separator === undefined ? <DefaultSeparator /> : separator === '/' || separator === '>' || separator === '›'
        ? <span className={styles.separatorText}>{separator}</span>
        : separator

    // If more than 3 items, collapse middle ones
    const shouldCollapse = items.length > 3
    const firstItem = items[0]
    const lastItem = items[items.length - 1]
    const middleItems = items.slice(1, -1)

    return (
        <nav className={`${styles.breadcrumb} ${className ?? ''}`} aria-label="Breadcrumb">
            <ol className={styles.list}>
                {/* First item */}
                <li className={styles.item}>
                    {firstItem.href ? (
                        <a href={firstItem.href} className={styles.link}>
                            {firstItem.icon && <span className={styles.itemIcon}>{firstItem.icon}</span>}
                            {firstItem.label}
                        </a>
                    ) : (
                        <span className={styles.current}>
                            {firstItem.icon && <span className={styles.itemIcon}>{firstItem.icon}</span>}
                            {firstItem.label}
                        </span>
                    )}
                </li>

                {/* Collapsed middle or individual items */}
                {shouldCollapse ? (
                    <>
                        <li className={styles.item} aria-hidden="true">{sep}</li>
                        <li className={styles.item}>
                            <button className={styles.collapseBtn} title={middleItems.map((i) => i.label).join(', ')}>
                                <LuEllipsis size={16} />
                            </button>
                        </li>
                    </>
                ) : (
                    middleItems.map((item, i) => (
                        <li key={i} className={styles.item}>
                            <span aria-hidden="true">{sep}</span>
                            {item.href ? (
                                <a href={item.href} className={styles.link}>
                                    {item.icon && <span className={styles.itemIcon}>{item.icon}</span>}
                                    {item.label}
                                </a>
                            ) : (
                                <span className={styles.current}>
                                    {item.icon && <span className={styles.itemIcon}>{item.icon}</span>}
                                    {item.label}
                                </span>
                            )}
                        </li>
                    ))
                )}

                {/* Last item (always text, never a link) */}
                {items.length > 1 && (
                    <li className={styles.item}>
                        <span aria-hidden="true">{sep}</span>
                        <span className={styles.current} aria-current="page">
                            {lastItem.icon && <span className={styles.itemIcon}>{lastItem.icon}</span>}
                            {lastItem.label}
                        </span>
                    </li>
                )}
            </ol>
        </nav>
    )
}
