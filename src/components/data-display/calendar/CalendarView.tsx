import { useState, useMemo, useCallback } from 'react'
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    addDays,
    addMonths,
    subMonths,
    isSameMonth,
    isSameDay,
    isToday,
    getISOWeek,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { LuChevronLeft, LuChevronRight, LuSearch, LuPlus } from 'react-icons/lu'
import { useIsMobile } from '@hooks/useIsMobile'
import styles from './CalendarView.module.css'

// ─── Types ──────────────────────────────────────────────
export type EventColor = 'blue' | 'green' | 'purple' | 'pink' | 'yellow' | 'red' | 'gray'

export interface CalendarEvent {
    id: number | string
    title: string
    start: Date
    end?: Date
    allDay?: boolean
    color?: EventColor
    meta?: Record<string, unknown>
}

export interface CalendarViewProps {
    events?: CalendarEvent[]
    onEventClick?: (event: CalendarEvent) => void
    onEventDrop?: (event: CalendarEvent, newDate: Date) => void
    onAddEvent?: () => void
    /** Click en celda de día (sin evento específico) */
    onDayClick?: (date: Date, events: CalendarEvent[]) => void
    /** Click en "+N más" */
    onMoreClick?: (events: CalendarEvent[], date: Date) => void
    selectedDate?: Date
    onDateSelect?: (date: Date) => void
}

// ─── Helpers ────────────────────────────────────────────
const WEEKDAYS = ['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom']

const PILL_COLORS: Record<EventColor, string> = {
    blue: styles.pillBlue,
    green: styles.pillGreen,
    purple: styles.pillPurple,
    pink: styles.pillPink,
    yellow: styles.pillYellow,
    red: styles.pillRed,
    gray: styles.pillGray,
}

function getCalendarDays(currentMonth: Date): Date[] {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 })
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

    const days: Date[] = []
    let day = calStart
    while (day <= calEnd) {
        days.push(day)
        day = addDays(day, 1)
    }
    return days
}

/** Agrupa eventos por día y retorna días ordenados que tienen eventos */
function groupEventsByDay(events: CalendarEvent[]): Map<string, CalendarEvent[]> {
    const map = new Map<string, CalendarEvent[]>()
    events.forEach((evt) => {
        const key = format(evt.start, 'yyyy-MM-dd')
        if (!map.has(key)) map.set(key, [])
        map.get(key)!.push(evt)
    })
    return map
}

// ─── Component ──────────────────────────────────────────
export function CalendarView({
    events = [],
    onEventClick,
    onEventDrop,
    onAddEvent,
    onDayClick,
    onMoreClick,
    selectedDate,
    onDateSelect,
}: CalendarViewProps) {
    const isMobile = useIsMobile()
    const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date())
    const [dragEvent, setDragEvent] = useState<CalendarEvent | null>(null)
    const [dragOverDate, setDragOverDate] = useState<Date | null>(null)

    const today = new Date()
    const calendarDays = useMemo(() => getCalendarDays(currentMonth), [currentMonth])
    const monthKey = format(currentMonth, 'yyyy-MM')
    const eventsByDay = useMemo(() => groupEventsByDay(events), [events, monthKey])

    // Navegación
    const goToPrevMonth = () => setCurrentMonth((m) => subMonths(m, 1))
    const goToNextMonth = () => setCurrentMonth((m) => addMonths(m, 1))
    const goToToday = () => {
        setCurrentMonth(new Date())
        onDateSelect?.(new Date())
    }

    // Drag handlers
    const handleDragStart = useCallback((e: React.DragEvent, event: CalendarEvent) => {
        setDragEvent(event)
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('text/plain', String(event.id))
    }, [])

    const handleDragOver = useCallback((e: React.DragEvent, date: Date) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
        setDragOverDate(date)
    }, [])

    const handleDragLeave = useCallback(() => setDragOverDate(null), [])

    const handleDrop = useCallback((e: React.DragEvent, date: Date) => {
        e.preventDefault()
        if (dragEvent && onEventDrop) onEventDrop(dragEvent, date)
        setDragEvent(null)
        setDragOverDate(null)
    }, [dragEvent, onEventDrop])

    const handleDragEnd = useCallback(() => {
        setDragEvent(null)
        setDragOverDate(null)
    }, [])

    // Header data
    const displayDate = selectedDate || today
    const weekNum = getISOWeek(displayDate)
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)

    // ─── Render: Header (compartido) ───────────────────
    const renderHeader = () => (
        <div className={styles.header}>
            <div className={styles.headerLeft}>
                <div className={styles.dateBlock}>
                    <span className={styles.dateBlockDay}>{format(displayDate, 'dd')}</span>
                    <span className={styles.dateBlockMonth}>{format(displayDate, 'MMM', { locale: es })}</span>
                </div>
                <div className={styles.headerTitle}>
                    <span className={styles.monthTitle}>
                        {format(currentMonth, 'MMMM yyyy', { locale: es })}
                    </span>
                    <span className={styles.monthRange}>
                        {format(monthStart, 'd MMM', { locale: es })} – {format(monthEnd, 'd MMM yyyy', { locale: es })}
                    </span>
                </div>
                {!isMobile && <span className={styles.weekBadge}>Week {weekNum}</span>}
            </div>
            <div className={styles.headerRight}>
                {!isMobile && (
                    <button className={styles.navBtn} title="Buscar">
                        <LuSearch size={15} />
                    </button>
                )}
                <button className={styles.navBtn} onClick={goToPrevMonth} title="Mes anterior">
                    <LuChevronLeft size={16} />
                </button>
                <button className={styles.navBtnText} onClick={goToToday}>Hoy</button>
                <button className={styles.navBtn} onClick={goToNextMonth} title="Mes siguiente">
                    <LuChevronRight size={16} />
                </button>
                <button className={styles.addBtn} onClick={onAddEvent}>
                    <LuPlus size={16} />
                    {isMobile ? 'Add' : 'Add event'}
                </button>
            </div>
        </div>
    )

    // ─── Render: Event Pill ────────────────────────────
    const renderPill = (event: CalendarEvent) => (
        <div
            key={event.id}
            className={[
                styles.pill,
                PILL_COLORS[event.color || 'blue'],
                dragEvent?.id === event.id && styles.pillDragging,
            ].filter(Boolean).join(' ')}
            draggable
            onDragStart={(e) => handleDragStart(e, event)}
            onDragEnd={handleDragEnd}
            onClick={(e) => { e.stopPropagation(); onEventClick?.(event) }}
            title={`${event.title}${event.start ? ` — ${format(event.start, 'HH:mm')}` : ''}`}
        >
            <span className={styles.pillTitle}>{event.title}</span>
            {event.start && !event.allDay && (
                <span className={styles.pillTime}>{format(event.start, 'h:mm a')}</span>
            )}
        </div>
    )

    // ═════════════════════════════════════════════════════
    // DESKTOP — Grid 7 columnas
    // ═════════════════════════════════════════════════════
    const renderDesktop = () => (
        <>
            {/* Weekday headers */}
            <div className={styles.weekdays}>
                {WEEKDAYS.map((day) => (
                    <div key={day} className={styles.weekday}>{day}</div>
                ))}
            </div>

            {/* Grid */}
            <div className={styles.grid}>
                {calendarDays.map((day) => {
                    const dayKey = format(day, 'yyyy-MM-dd')
                    const dayEvents = eventsByDay.get(dayKey) || []
                    const isCurrentMonth = isSameMonth(day, currentMonth)
                    const isTodayDate = isToday(day)
                    const isDragTarget = dragOverDate && isSameDay(dragOverDate, day)

                    return (
                        <div
                            key={dayKey}
                            className={[
                                styles.cell,
                                !isCurrentMonth && styles.cellOutside,
                                isTodayDate && styles.cellToday,
                                isDragTarget && styles.cellDragOver,
                            ].filter(Boolean).join(' ')}
                            onDragOver={(e) => handleDragOver(e, day)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, day)}
                            onClick={() => onDayClick?.(day, dayEvents)}
                        >
                            <div className={[
                                styles.dayNumber,
                                isTodayDate && styles.dayNumberToday,
                            ].filter(Boolean).join(' ')}>
                                {format(day, 'd')}
                            </div>
                            <div className={styles.events}>
                                {dayEvents.slice(0, 3).map((evt) => renderPill(evt))}
                                {dayEvents.length > 3 && (
                                    <div
                                        className={styles.overflow}
                                        onClick={(e) => { e.stopPropagation(); onMoreClick?.(dayEvents, day) }}
                                    >
                                        +{dayEvents.length - 3} más
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </>
    )

    // ═════════════════════════════════════════════════════
    // MÓVIL — Lista vertical por día
    // ═════════════════════════════════════════════════════
    const renderMobile = () => {
        // Solo mostrar días del mes actual que tengan eventos, + hoy
        const daysInMonth = calendarDays.filter((d) => isSameMonth(d, currentMonth))

        return (
            <div className={styles.mobileList}>
                {daysInMonth.map((day) => {
                    const dayKey = format(day, 'yyyy-MM-dd')
                    const dayEvents = eventsByDay.get(dayKey) || []
                    const isTodayDate = isToday(day)
                    const isDragTarget = dragOverDate && isSameDay(dragOverDate, day)

                    return (
                        <div
                            key={dayKey}
                            className={[
                                styles.mobileDay,
                                isTodayDate && styles.mobileDayToday,
                                isDragTarget && styles.cellDragOver,
                            ].filter(Boolean).join(' ')}
                            onDragOver={(e) => handleDragOver(e, day)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, day)}
                        >
                            {/* Day header */}
                            <div className={styles.mobileDayHeader}>
                                <div className={styles.mobileDayLeft}>
                                    <span className={[
                                        styles.mobileDayNum,
                                        isTodayDate && styles.mobileDayNumToday,
                                    ].filter(Boolean).join(' ')}>
                                        {format(day, 'd')}
                                    </span>
                                    <span className={styles.mobileDayName}>
                                        {format(day, 'EEE', { locale: es })}
                                    </span>
                                </div>
                                {dayEvents.length > 0 && (
                                    <span className={styles.mobileDayCount}>
                                        {dayEvents.length}
                                    </span>
                                )}
                            </div>

                            {/* Events */}
                            {dayEvents.length > 0 && (
                                <div className={styles.mobileEvents}>
                                    {dayEvents.map((evt) => renderPill(evt))}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        )
    }

    // ─── Main Render ───────────────────────────────────
    return (
        <div className={styles.calendar}>
            {renderHeader()}
            {isMobile ? renderMobile() : renderDesktop()}
        </div>
    )
}
