import { Link } from 'react-router'
import { LuChevronDown } from 'react-icons/lu'
import styles from './NavGroup.module.css'
import type { GroupItem } from './types'

interface NavGroupProps {
    group: GroupItem
    open: boolean
    active: boolean
    expanded?: boolean
    onToggle: () => void
    isChildActive: (path: string) => boolean
}

export default function NavGroup({ group, open, active, expanded, onToggle, isChildActive }: NavGroupProps) {
    const toggleClass = [
        styles.toggle,
        expanded && styles.toggleExpanded,
        active && styles.active,
    ].filter(Boolean).join(' ')

    const chevronClass = [
        styles.chevron,
        expanded && styles.chevronVisible,
        open && styles.chevronOpen,
    ].filter(Boolean).join(' ')

    return (
        <div className={styles.group}>
            <button className={toggleClass} onClick={onToggle}>
                <group.icon size={20} className={styles.icon} />
                <span className={`${styles.label} ${expanded ? styles.labelVisible : ''}`}>
                    {group.label}
                </span>
                <LuChevronDown size={16} className={chevronClass} />
            </button>

            <div className={`${styles.subNav} ${open ? styles.subNavOpen : ''}`}>
                <div className={styles.subNavInner}>
                    {group.children.map((item) => {
                        const subClass = [
                            styles.subItem,
                            expanded && styles.subItemExpanded,
                            isChildActive(item.to) && styles.subItemActive,
                        ].filter(Boolean).join(' ')

                        return (
                            <Link key={item.to} to={item.to} className={subClass}>
                                <item.icon size={16} className={styles.subIcon} />
                                <span className={`${styles.subLabel} ${expanded ? styles.subLabelVisible : ''}`}>
                                    {item.label}
                                </span>
                            </Link>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
