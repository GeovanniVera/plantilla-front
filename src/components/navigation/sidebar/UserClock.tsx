import { useState, useEffect } from 'react'
import { useSidebar } from './context'

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

const CLOCK_BASE_CLASSES = 'flex flex-col items-center py-2.5 mb-4 transition-[align-items] duration-200 ease-in-out'
const CLOCK_EXPANDED_CLASSES = 'w-full'
const TIME_CLASSES = 'text-[13px] font-medium text-accent tabular-nums leading-[1.3]'
const DATE_CLASSES = 'text-[11px] text-foreground leading-[1.3]'

export default function UserClock() {
    const { expanded } = useSidebar()
    const [now, setNow] = useState(new Date())

    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 1000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className={`${CLOCK_BASE_CLASSES} ${expanded ? CLOCK_EXPANDED_CLASSES : ''}`}>
            <span className={TIME_CLASSES}>{formatTime(now)}</span>
            <span className={DATE_CLASSES}>{formatDate(now)}</span>
        </div>
    )
}
