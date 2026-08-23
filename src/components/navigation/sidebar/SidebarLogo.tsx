import { Link } from 'react-router'
import styles from './SidebarLogo.module.css'
import { useSidebar } from './context'

interface SidebarLogoProps {
    src: string
    name: string
}

export default function SidebarLogo({ src, name }: SidebarLogoProps) {
    const { expanded } = useSidebar()

    return (
        <Link to="/" className={`${styles.logo} ${expanded ? styles.expanded : ''}`}>
            <img src={src} alt={name} className={styles.img} />
            <span className={`${styles.name} ${expanded ? styles.nameVisible : ''}`}>
                {name}
            </span>
        </Link>
    )
}
