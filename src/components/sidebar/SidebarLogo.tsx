import { Link } from 'react-router'
import styles from './SidebarLogo.module.css'

interface SidebarLogoProps {
    src: string
    name: string
    expanded: boolean
}

export default function SidebarLogo({ src, name, expanded }: SidebarLogoProps) {
    return (
        <Link to="/" className={`${styles.logo} ${expanded ? styles.expanded : ''}`}>
            <img src={src} alt={name} className={styles.img} />
            <span className={`${styles.name} ${expanded ? styles.nameVisible : ''}`}>
                {name}
            </span>
        </Link>
    )
}
