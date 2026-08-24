import { useState } from 'react'
import { DayPicker } from 'react-day-picker'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { LuChevronLeft, LuChevronRight, LuCalendarDays } from 'react-icons/lu'
import 'react-day-picker/src/style.css'
import styles from './Calendar.module.css'

const ChevronIcon = (props: { orientation?: string }) => (
    props.orientation === 'left' ? <LuChevronLeft size={14} /> : <LuChevronRight size={14} />
)

// ─── Styling ──────────────────────────────────────────────
/* The wrapper keeps the residual `calendar` module class: it scopes the
 * --rdp-* bridge variables and the react-day-picker internal overrides
 * living in Calendar.module.css (third-party contract — deliberately
 * NOT moved to Tailwind, phase 6G.1). */
const CALENDAR_WRAPPER_CLASS = styles.calendar

/* DatePicker trigger/popover are our own elements → Tailwind. Size and
 * value/placeholder resolve to single effective class sets. */
const PICKER_WRAP_CLASSES = 'relative inline-flex'

const PICKER_INPUT_BASE_CLASSES =
    'flex items-center justify-between gap-2 border border-border-base rounded-md bg-background text-foreground text-[13px] font-sans cursor-pointer transition-colors duration-150 hover:border-accent-line focus:outline-none focus:border-accent'

const PICKER_SIZE_CLASSES = {
    sm: 'min-w-[140px] px-2.5 py-1.5 text-xs',
    md: 'min-w-[180px] px-3 py-2',
} as const

const VALUE_CLASSES = 'text-foreground'
const PLACEHOLDER_CLASSES = 'text-foreground opacity-40'
const ICON_CLASSES = 'text-sm opacity-50'

const POPOVER_CLASSES =
    'absolute top-[calc(100%+6px)] left-0 z-[200] bg-background border border-border-base rounded-lg shadow-[0_4px_6px_-1px_rgba(0,0,0,0.08),0_10px_20px_-2px_rgba(0,0,0,0.06)] p-3 animate-popover-in'

// ─── Calendar ───────────────────────────────────────
export interface CalendarProps {
    selected?: Date
    onSelect?: (date: Date | undefined) => void
    minDate?: Date
    maxDate?: Date
}

export function Calendar({
    selected,
    onSelect,
    minDate,
    maxDate,
}: CalendarProps) {
    const disabled = []
    if (minDate) disabled.push({ before: minDate })
    if (maxDate) disabled.push({ after: maxDate })

    return (
        <div className={CALENDAR_WRAPPER_CLASS}>
            <DayPicker
                mode="single"
                selected={selected}
                onSelect={onSelect}
                locale={es}
                disabled={disabled}
                showOutsideDays
                fixedWeeks
                components={{ Chevron: ChevronIcon }}
            />
        </div>
    )
}

// ─── CalendarRange ──────────────────────────────────
export interface CalendarRangeProps {
    from?: Date
    to?: Date
    onSelect?: (range: { from: Date | undefined; to: Date | undefined }) => void
    minDate?: Date
    maxDate?: Date
}

export function CalendarRange({
    from,
    to,
    onSelect,
    minDate,
    maxDate,
}: CalendarRangeProps) {
    const disabled = []
    if (minDate) disabled.push({ before: minDate })
    if (maxDate) disabled.push({ after: maxDate })

    return (
        <div className={CALENDAR_WRAPPER_CLASS}>
            <DayPicker
                mode="range"
                selected={{ from, to }}
                onSelect={(range) => {
                    if (range) onSelect?.({ from: range.from, to: range.to })
                    else onSelect?.({ from: undefined, to: undefined })
                }}
                locale={es}
                disabled={disabled}
                showOutsideDays
                fixedWeeks
                components={{ Chevron: ChevronIcon }}
            />
        </div>
    )
}

// ─── DatePicker (input + popover) ───────────────────
export interface DatePickerProps {
    value?: Date
    onChange?: (date: Date | undefined) => void
    placeholder?: string
    minDate?: Date
    maxDate?: Date
    size?: 'sm' | 'md'
}

export function DatePicker({
    value,
    onChange,
    placeholder = 'Seleccionar fecha',
    minDate,
    maxDate,
    size = 'md',
}: DatePickerProps) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className={PICKER_WRAP_CLASSES}>
            <button
                className={`${PICKER_INPUT_BASE_CLASSES} ${PICKER_SIZE_CLASSES[size]}`}
                onClick={() => setIsOpen(!isOpen)}
                type="button"
            >
                <span className={value ? VALUE_CLASSES : PLACEHOLDER_CLASSES}>
                    {value ? format(value, 'dd/MM/yyyy', { locale: es }) : placeholder}
                </span>
                <span className={ICON_CLASSES}><LuCalendarDays size={16} /></span>
            </button>

            {isOpen && (
                <div className={POPOVER_CLASSES}>
                    <Calendar
                        selected={value}
                        onSelect={(date) => {
                            onChange?.(date)
                            setIsOpen(false)
                        }}
                        minDate={minDate}
                        maxDate={maxDate}
                    />
                </div>
            )}
        </div>
    )
}

// ─── DateRangePicker ────────────────────────────────
export interface DateRangePickerProps {
    from?: Date
    to?: Date
    onChange?: (range: { from: Date | undefined; to: Date | undefined }) => void
    placeholder?: string
    minDate?: Date
    maxDate?: Date
}

export function DateRangePicker({
    from,
    to,
    onChange,
    placeholder = 'Seleccionar rango',
    minDate,
    maxDate,
}: DateRangePickerProps) {
    const [isOpen, setIsOpen] = useState(false)
    const hasValue = !!from
    const label = from && to
        ? `${format(from, 'dd/MM/yyyy')} — ${format(to, 'dd/MM/yyyy')}`
        : from
        ? `${format(from, 'dd/MM/yyyy')} — ...`
        : placeholder

    return (
        <div className={PICKER_WRAP_CLASSES}>
            <button
                className={`${PICKER_INPUT_BASE_CLASSES} ${PICKER_SIZE_CLASSES.md}`}
                onClick={() => setIsOpen(!isOpen)}
                type="button"
            >
                <span className={hasValue ? VALUE_CLASSES : PLACEHOLDER_CLASSES}>
                    {label}
                </span>
                <span className={ICON_CLASSES}><LuCalendarDays size={16} /></span>
            </button>

            {isOpen && (
                <div className={POPOVER_CLASSES}>
                    <CalendarRange
                        from={from}
                        to={to}
                        onSelect={(range) => {
                            onChange?.(range)
                            if (range.from && range.to) setIsOpen(false)
                        }}
                        minDate={minDate}
                        maxDate={maxDate}
                    />
                </div>
            )}
        </div>
    )
}
