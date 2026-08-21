import { useState, useEffect } from 'react'
import styles from './UserClock.module.css'

interface UserClockProps {
    expanded: boolean
}

function formatTime(date: Date) {
    return date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    })
}

function formatDate(date: Date) {
    return date.toLocaleDateString('es-ES', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
    })
}

export default function UserClock({ expanded }: UserClockProps) {
    const [now, setNow] = useState(new Date())

    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 1000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className={`${styles.clock} ${expanded ? styles.clockExpanded : ''}`}>
            <span className={styles.time}>{formatTime(now)}</span>
            <span className={styles.date}>{formatDate(now)}</span>
        </div>
    )
}
