import styles from './UserAvatar.module.css'

interface UserAvatarProps {
    name: string
    expanded: boolean
}

function getInitial(name: string) {
    return name.charAt(0).toUpperCase()
}

export default function UserAvatar({ name, expanded }: UserAvatarProps) {
    return (
        <div className={`${styles.card} ${expanded ? styles.cardExpanded : ''}`}>
            <div className={styles.avatar}>
                {getInitial(name)}
            </div>
            <div className={`${styles.info} ${expanded ? styles.infoVisible : ''}`}>
                <span className={styles.name}>{name}</span>
            </div>
        </div>
    )
}
