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

/* Event category colors are part of CalendarView's visualization API —
 * deliberate local literals (.12 tint + strong text), NOT design tokens
 * (phase 6B decision). */
const PILL_COLORS: Record<EventColor, string> = {
    blue:   'bg-[rgba(59,130,246,0.12)] text-[#2563eb]',
    green:  'bg-[rgba(34,197,94,0.12)] text-[#16a34a]',
    purple: 'bg-[rgba(139,92,246,0.12)] text-[#7c3aed]',
    pink:   'bg-[rgba(236,72,153,0.12)] text-[#db2777]',
    yellow: 'bg-[rgba(245,158,11,0.12)] text-[#d97706]',
    red:    'bg-[rgba(239,68,68,0.12)] text-[#dc2626]',
    gray:   'bg-[rgba(107,114,128,0.12)] text-[#6b7280]',
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

// ─── Styling ────────────────────────────────────────────
const ROOT_CLASSES = 'bg-background border border-border-base rounded-[16px] overflow-hidden'

const HEADER_CLASSES = 'flex items-center justify-between px-5 py-4 border-b border-border-base gap-4 flex-wrap'
const HEADER_LEFT_CLASSES = 'flex items-center gap-4'
const DATE_BLOCK_CLASSES = 'flex flex-col items-center justify-center w-[52px] h-[52px] rounded-lg bg-accent text-white shrink-0'
const DATE_BLOCK_DAY_CLASSES = 'text-xl font-bold leading-none'
const DATE_BLOCK_MONTH_CLASSES = 'text-[9px] font-semibold uppercase tracking-[0.05em] opacity-85'
const HEADER_TITLE_CLASSES = 'flex flex-col gap-0.5'
const MONTH_TITLE_CLASSES = 'text-lg font-bold text-heading leading-[1.2]'
const MONTH_RANGE_CLASSES = 'text-xs text-foreground opacity-50'
const WEEK_BADGE_CLASSES =
    'inline-flex items-center px-2 py-0.5 rounded-sm bg-surface border border-border-base text-[11px] font-semibold text-foreground opacity-60'
const HEADER_RIGHT_CLASSES = 'flex items-center gap-2'

const NAV_BTN_CLASSES =
    'flex items-center justify-center size-8 rounded-md border border-border-base bg-background text-foreground cursor-pointer transition-all duration-150 hover:bg-surface hover:border-accent-line'
const NAV_BTN_TEXT_CLASSES =
    'flex items-center gap-1 px-3 py-1.5 rounded-md border border-border-base bg-background text-foreground text-xs font-medium font-sans cursor-pointer transition-all duration-150 hover:bg-surface hover:border-accent-line'
const ADD_BTN_CLASSES =
    'flex items-center gap-1.5 px-4 py-2 rounded-md bg-accent text-white text-[13px] font-semibold font-sans cursor-pointer transition-all duration-150 hover:opacity-90 hover:-translate-y-px'

const WEEKDAYS_ROW_CLASSES = 'grid grid-cols-7 border-b border-border-base'
const WEEKDAY_CLASSES = 'py-2.5 px-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-foreground opacity-45 text-left'

const GRID_CLASSES = 'grid grid-cols-7'

/* Cell states have real precedence (dragOver > today > outside > normal),
 * resolved here instead of relying on stylesheet order. */
function cellClasses(isOutside: boolean, isTodayDate: boolean, isDragTarget: boolean) {
    const state = isDragTarget
        ? 'bg-accent-subtle outline-2 outline-dashed outline-accent -outline-offset-2'
        : isTodayDate
            ? 'bg-accent-subtle hover:bg-accent-subtle'
            : isOutside
                ? 'bg-transparent'
                : 'hover:bg-surface'
    return [
        'relative min-h-[100px] p-2 border-r border-b border-border-base transition-colors duration-100 [&:nth-child(7n)]:border-r-0',
        state,
        isOutside ? '[&_.day-number]:opacity-25' : '',
    ].filter(Boolean).join(' ')
}

const DAY_NUMBER_CLASSES = 'day-number text-[13px] font-semibold text-foreground mb-1 w-[26px] h-[26px] flex items-center justify-center rounded-full'
const DAY_NUMBER_TODAY_CLASSES = 'bg-accent text-white'

const EVENTS_CONTAINER_CLASSES = 'flex flex-col gap-0.5'

const PILL_BASE_CLASSES =
    'flex items-center justify-between gap-1 px-1.5 py-[3px] rounded-sm text-[11px] cursor-grab transition-all duration-150 border border-transparent hover:translate-x-px hover:border-current active:cursor-grabbing active:opacity-70'
const PILL_DRAGGING_CLASSES = 'opacity-40'
const PILL_TITLE_BASE_CLASSES = 'font-semibold whitespace-nowrap overflow-hidden text-ellipsis max-w-[80px]'
const PILL_TIME_CLASSES = 'font-medium opacity-70 whitespace-nowrap text-[10px]'

const OVERFLOW_CLASSES =
    'flex items-center px-1.5 py-0.5 rounded-[4px] text-[10px] font-semibold text-foreground opacity-50 cursor-pointer transition-opacity duration-150 hover:opacity-80 hover:bg-surface'

// ══════════════════════════════════════════════════════
// MÓVIL — estilos de lista vertical
// ══════════════════════════════════════════════════════
const MOBILE_LIST_CLASSES = 'flex flex-col'

function mobileDayClasses(isTodayDate: boolean, isDragTarget: boolean) {
    const state = isDragTarget
        ? 'bg-accent-subtle outline-2 outline-dashed outline-accent -outline-offset-2'
        : isTodayDate
            ? 'bg-accent-subtle'
            : 'hover:bg-surface'
    return `px-4 py-3 border-b border-border-base transition-colors duration-100 ${state}`
}

const MOBILE_DAY_HEADER_CLASSES = 'flex items-center justify-between mb-2'
const MOBILE_DAY_LEFT_CLASSES = 'flex items-center gap-2'
const MOBILE_DAY_NUM_CLASSES = 'text-lg font-bold text-heading w-8 h-8 flex items-center justify-center rounded-md'
const MOBILE_DAY_NUM_TODAY_CLASSES = 'bg-accent text-white'
const MOBILE_DAY_NAME_CLASSES = 'text-[13px] font-medium text-foreground opacity-60 capitalize'
const MOBILE_DAY_COUNT_CLASSES = 'text-[11px] font-semibold text-foreground opacity-40 bg-surface px-2 py-0.5 rounded-[10px]'
const MOBILE_EVENTS_CLASSES = 'flex flex-col gap-1 pl-1'

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
        <div className={HEADER_CLASSES}>
            <div className={HEADER_LEFT_CLASSES}>
                <div className={DATE_BLOCK_CLASSES}>
                    <span className={DATE_BLOCK_DAY_CLASSES}>{format(displayDate, 'dd')}</span>
                    <span className={DATE_BLOCK_MONTH_CLASSES}>{format(displayDate, 'MMM', { locale: es })}</span>
                </div>
                <div className={HEADER_TITLE_CLASSES}>
                    <span className={MONTH_TITLE_CLASSES}>
                        {format(currentMonth, 'MMMM yyyy', { locale: es })}
                    </span>
                    <span className={MONTH_RANGE_CLASSES}>
                        {format(monthStart, 'd MMM', { locale: es })} – {format(monthEnd, 'd MMM yyyy', { locale: es })}
                    </span>
                </div>
                {!isMobile && <span className={WEEK_BADGE_CLASSES}>Week {weekNum}</span>}
            </div>
            <div className={HEADER_RIGHT_CLASSES}>
                {!isMobile && (
                    <button className={NAV_BTN_CLASSES} title="Buscar">
                        <LuSearch size={15} />
                    </button>
                )}
                <button className={NAV_BTN_CLASSES} onClick={goToPrevMonth} title="Mes anterior">
                    <LuChevronLeft size={16} />
                </button>
                <button className={NAV_BTN_TEXT_CLASSES} onClick={goToToday}>Hoy</button>
                <button className={NAV_BTN_CLASSES} onClick={goToNextMonth} title="Mes siguiente">
                    <LuChevronRight size={16} />
                </button>
                <button className={ADD_BTN_CLASSES} onClick={onAddEvent}>
                    <LuPlus size={16} />
                    {isMobile ? 'Add' : 'Add event'}
                </button>
            </div>
        </div>
    )

    // ─── Render: Event Pill ────────────────────────────
    const renderPill = (event: CalendarEvent, options: { wide?: boolean } = {}) => {
        // Mobile pills drop the desktop max-width caps (legacy descendant
        // rules .mobileEvents .pill / .pillTitle, resolved via props).
        const titleClasses = options.wide
            ? PILL_TITLE_BASE_CLASSES.replace('max-w-[80px]', 'max-w-none')
            : PILL_TITLE_BASE_CLASSES

        return (
            <div
                key={event.id}
                className={[
                    PILL_BASE_CLASSES,
                    PILL_COLORS[event.color || 'blue'],
                    options.wide ? 'max-w-none' : '',
                    dragEvent?.id === event.id && PILL_DRAGGING_CLASSES,
                ].filter(Boolean).join(' ')}
                draggable
                onDragStart={(e) => handleDragStart(e, event)}
                onDragEnd={handleDragEnd}
                onClick={(e) => { e.stopPropagation(); onEventClick?.(event) }}
                title={`${event.title}${event.start ? ` — ${format(event.start, 'HH:mm')}` : ''}`}
            >
                <span className={titleClasses}>{event.title}</span>
                {event.start && !event.allDay && (
                    <span className={PILL_TIME_CLASSES}>{format(event.start, 'h:mm a')}</span>
                )}
            </div>
        )
    }

    // ═════════════════════════════════════════════════════
    // DESKTOP — Grid 7 columnas
    // ═════════════════════════════════════════════════════
    const renderDesktop = () => (
        <>
            {/* Weekday headers */}
            <div className={WEEKDAYS_ROW_CLASSES}>
                {WEEKDAYS.map((day) => (
                    <div key={day} className={WEEKDAY_CLASSES}>{day}</div>
                ))}
            </div>

            {/* Grid */}
            <div className={GRID_CLASSES}>
                {calendarDays.map((day) => {
                    const dayKey = format(day, 'yyyy-MM-dd')
                    const dayEvents = eventsByDay.get(dayKey) || []
                    const isCurrentMonth = isSameMonth(day, currentMonth)
                    const isTodayDate = isToday(day)
                    const isDragTarget = dragOverDate && isSameDay(dragOverDate, day)

                    return (
                        <div
                            key={dayKey}
                            className={cellClasses(!isCurrentMonth, isTodayDate, !!isDragTarget)}
                            onDragOver={(e) => handleDragOver(e, day)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, day)}
                            onClick={() => onDayClick?.(day, dayEvents)}
                        >
                            <div className={`${DAY_NUMBER_CLASSES} ${isTodayDate ? DAY_NUMBER_TODAY_CLASSES : ''}`}>
                                {format(day, 'd')}
                            </div>
                            <div className={EVENTS_CONTAINER_CLASSES}>
                                {dayEvents.slice(0, 3).map((evt) => renderPill(evt))}
                                {dayEvents.length > 3 && (
                                    <div
                                        className={OVERFLOW_CLASSES}
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
            <div className={MOBILE_LIST_CLASSES}>
                {daysInMonth.map((day) => {
                    const dayKey = format(day, 'yyyy-MM-dd')
                    const dayEvents = eventsByDay.get(dayKey) || []
                    const isTodayDate = isToday(day)
                    const isDragTarget = dragOverDate && isSameDay(dragOverDate, day)

                    return (
                        <div
                            key={dayKey}
                            className={mobileDayClasses(isTodayDate, !!isDragTarget)}
                            onDragOver={(e) => handleDragOver(e, day)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, day)}
                        >
                            {/* Day header */}
                            <div className={MOBILE_DAY_HEADER_CLASSES}>
                                <div className={MOBILE_DAY_LEFT_CLASSES}>
                                    <span className={[
                                        MOBILE_DAY_NUM_CLASSES,
                                        isTodayDate && MOBILE_DAY_NUM_TODAY_CLASSES,
                                    ].filter(Boolean).join(' ')}>
                                        {format(day, 'd')}
                                    </span>
                                    <span className={MOBILE_DAY_NAME_CLASSES}>
                                        {format(day, 'EEE', { locale: es })}
                                    </span>
                                </div>
                                {dayEvents.length > 0 && (
                                    <span className={MOBILE_DAY_COUNT_CLASSES}>
                                        {dayEvents.length}
                                    </span>
                                )}
                            </div>

                            {/* Events */}
                            {dayEvents.length > 0 && (
                                <div className={MOBILE_EVENTS_CLASSES}>
                                    {dayEvents.map((evt) => renderPill(evt, { wide: true }))}
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
        <div className={ROOT_CLASSES}>
            {renderHeader()}
            {isMobile ? renderMobile() : renderDesktop()}
        </div>
    )
}
