import styles from './UserAvatar.module.css'
import { useSidebar } from './context'

interface UserAvatarProps {
    /** Nombre o alias del usuario (corto) */
    name: string
    /** Rol del usuario */
    role?: string
}

function getInitial(name: string) {
    return name.charAt(0).toUpperCase()
}

export default function UserAvatar({ name, role }: UserAvatarProps) {
    const { expanded } = useSidebar()

    return (
        <div className={`${styles.card} ${expanded ? styles.cardExpanded : ''}`}>
            <div className={styles.avatar}>
                {getInitial(name)}
            </div>
            <div className={`${styles.info} ${expanded ? styles.infoVisible : ''}`}>
                <span className={styles.name}>{name}</span>
                {role && <span className={styles.role}>{role}</span>}
            </div>
        </div>
    )
}
