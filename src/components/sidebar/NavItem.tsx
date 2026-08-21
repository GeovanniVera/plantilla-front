import { Link } from 'react-router'
import styles from './NavItem.module.css'
import type { NavItem as NavItemType } from './types'

interface NavItemProps {
    item: NavItemType
    active: boolean
    expanded?: boolean
}

export default function NavItem({ item, active, expanded }: NavItemProps) {
    const className = [
        styles.item,
        expanded && styles.itemExpanded,
        active && styles.active,
        item.danger && styles.danger,
    ].filter(Boolean).join(' ')

    const textClass = [
        styles.text,
        expanded && styles.textVisible,
    ].filter(Boolean).join(' ')

    return (
        <Link to={item.to} className={className}>
            <item.icon size={20} className={styles.icon} />
            <span className={textClass}>{item.label}</span>
        </Link>
    )
}
