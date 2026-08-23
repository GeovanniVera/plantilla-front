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
        <div className={styles.calendar}>
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
        <div className={styles.calendar}>
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
        <div className={styles.datePickerWrap}>
            <button
                className={`${styles.datePickerInput} ${size === 'sm' ? styles.inputSm : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                type="button"
            >
                <span className={value ? styles.inputValue : styles.inputPlaceholder}>
                    {value ? format(value, 'dd/MM/yyyy', { locale: es }) : placeholder}
                </span>
                <span className={styles.inputIcon}><LuCalendarDays size={16} /></span>
            </button>

            {isOpen && (
                <div className={styles.popover}>
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
    const label = from && to
        ? `${format(from, 'dd/MM/yyyy')} — ${format(to, 'dd/MM/yyyy')}`
        : from
        ? `${format(from, 'dd/MM/yyyy')} — ...`
        : placeholder

    return (
        <div className={styles.datePickerWrap}>
            <button
                className={styles.datePickerInput}
                onClick={() => setIsOpen(!isOpen)}
                type="button"
            >
                <span className={from ? styles.inputValue : styles.inputPlaceholder}>
                    {label}
                </span>
                <span className={styles.inputIcon}><LuCalendarDays size={16} /></span>
            </button>

            {isOpen && (
                <div className={styles.popover}>
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
