import { useState } from 'react'
import { LuCalendarDays } from 'react-icons/lu'
import { Calendar, CalendarRange, DatePicker, DateRangePicker, CalendarView, type CalendarEvent } from '../components/ui/Calendar'
import { ExampleCard } from '../components/ui/Showcase'
import styles from './TablesShowcase.module.css'

// ─── Code Snippets ────────────────────────────────────────
const CODE = {
    calendar: `import { Calendar } from '../components/ui/Calendar'

export default function MyComponent() {
    const [date, setDate] = useState<Date | undefined>()

    return (
        <Calendar
            selected={date}
            onSelect={setDate}
        />
    )
}`,

    calendarRange: `import { CalendarRange } from '../components/ui/Calendar'

export default function MyComponent() {
    const [from, setFrom] = useState<Date>()
    const [to, setTo] = useState<Date>()

    return (
        <CalendarRange
            from={from}
            to={to}
            onSelect={(range) => {
                setFrom(range.from)
                setTo(range.to)
            }}
        />
    )
}`,

    datePicker: `import { DatePicker } from '../components/ui/Calendar'

export default function MyForm() {
    const [date, setDate] = useState<Date>()

    return (
        <DatePicker
            value={date}
            onChange={setDate}
            placeholder="Seleccionar fecha"
        />
    )
}`,

    datePickerMin: `import { DatePicker } from '../components/ui/Calendar'

export default function MyForm() {
    const [date, setDate] = useState<Date>()

    return (
        <DatePicker
            value={date}
            onChange={setDate}
            placeholder="Solo fechas futuras"
            minDate={new Date()}
        />
    )
}`,

    dateRange: `import { DateRangePicker } from '../components/ui/Calendar'

export default function ReportFilter() {
    const [from, setFrom] = useState<Date>()
    const [to, setTo] = useState<Date>()

    return (
        <DateRangePicker
            from={from}
            to={to}
            onChange={(range) => {
                setFrom(range.from)
                setTo(range.to)
            }}
            placeholder="Seleccionar período"
        />
    )
}`,

    formIntegration: `import { DatePicker } from '../components/ui/Calendar'
import Button from '../components/ui/Button'

export default function EventForm() {
    const [title, setTitle] = useState('')
    const [date, setDate] = useState<Date>()

    const handleSubmit = () => {
        if (!date) return
        console.log({ title, date })
        // POST /api/events
    }

    return (
        <form onSubmit={handleSubmit}>
            <label>Nombre del evento</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} />

            <label>Fecha</label>
            <DatePicker value={date} onChange={setDate} />

            <Button onClick={handleSubmit}>Crear evento</Button>
        </form>
    )
}`,

    propsTable: `// ─── Calendar / CalendarRange ──────────────────
interface CalendarProps {
    selected?: Date                         // Fecha seleccionada
    onSelect?: (date: Date | undefined) => void
    minDate?: Date                          // Fecha mínima
    maxDate?: Date                          // Fecha máxima
}

interface CalendarRangeProps {
    from?: Date
    to?: Date
    onSelect?: (range: { from: Date; to: Date }) => void
    minDate?: Date
    maxDate?: Date
}

// ─── DatePicker / DateRangePicker ────────────────
interface DatePickerProps {
    value?: Date
    onChange?: (date: Date | undefined) => void
    placeholder?: string                    // default: "Seleccionar fecha"
    minDate?: Date
    maxDate?: Date
    size?: 'sm' | 'md'                      // default: 'md'
}

interface DateRangePickerProps {
    from?: Date
    to?: Date
    onChange?: (range: { from?: Date; to?: Date }) => void
    placeholder?: string                    // default: "Seleccionar rango"
    minDate?: Date
    maxDate?: Date
}`,
}

// ─── Sample Events ────────────────────────────────────────
const now = new Date()
const sampleEvents: CalendarEvent[] = [
    {
        id: 1,
        title: 'Reunión de equipo',
        start: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0),
        end: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0),
        color: 'blue',
    },
    {
        id: 2,
        title: 'Standup diario',
        start: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 9, 30),
        end: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 9, 45),
        color: 'green',
    },
    {
        id: 3,
        title: 'Demo al cliente',
        start: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 14, 0),
        end: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 15, 30),
        color: 'yellow',
    },
    {
        id: 4,
        title: 'Deadline sprint',
        start: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5),
        end: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5),
        allDay: true,
        color: 'red',
    },
    {
        id: 5,
        title: 'Code review',
        start: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 11, 0),
        end: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 12, 0),
        color: 'gray',
    },
]

// ─── Page ─────────────────────────────────────────────────
export default function ComponentesCalendario() {
    // Calendar state
    const [calDate, setCalDate] = useState<Date>()
    const [calRangeFrom, setCalRangeFrom] = useState<Date>()
    const [calRangeTo, setCalRangeTo] = useState<Date>()

    // DatePicker state
    const [dpDate, setDpDate] = useState<Date>()
    const [dpFuture, setDpFuture] = useState<Date>()

    // DateRangePicker state
    const [drFrom, setDrFrom] = useState<Date>()
    const [drTo, setDrTo] = useState<Date>()

    return (
        <div className={styles.page}>

            {/* ════════════════════════════════════════════
                CALENDARIO BASE
               ════════════════════════════════════════════ */}
            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Calendario</h2>
                <p className={styles.sectionDesc}>
                    Selector de fechas con navegación por mes, idioma español y estilos del design system. Compuesto por react-day-picker + date-fns.
                </p>

                {/* Calendario simple */}
                <ExampleCard
                    title="Calendario simple"
                    desc="Selecciona una fecha haciendo clic en el día"
                    filename="CalendarExample.tsx"
                    code={CODE.calendar}
                >
                    <Calendar selected={calDate} onSelect={setCalDate} />
                    {calDate && (
                        <p style={{ fontSize: 12, color: 'var(--text)', opacity: 0.6, marginTop: 8, textAlign: 'center' }}>
                            Seleccionado: {calDate.toLocaleDateString('es-ES')}
                        </p>
                    )}
                </ExampleCard>

                {/* Calendario rango */}
                <ExampleCard
                    title="Calendario con rango"
                    desc="Selecciona un rango de fechas — clic en fecha inicio, clic en fecha fin"
                    filename="CalendarRangeExample.tsx"
                    code={CODE.calendarRange}
                >
                    <CalendarRange
                        from={calRangeFrom}
                        to={calRangeTo}
                        onSelect={(range) => { setCalRangeFrom(range.from); setCalRangeTo(range.to) }}
                    />
                    {calRangeFrom && (
                        <p style={{ fontSize: 12, color: 'var(--text)', opacity: 0.6, marginTop: 8, textAlign: 'center' }}>
                            {calRangeFrom.toLocaleDateString('es-ES')}
                            {calRangeTo && ` — ${calRangeTo.toLocaleDateString('es-ES')}`}
                            {!calRangeTo && ' — ...'}
                        </p>
                    )}
                </ExampleCard>
            </div>

            <div className={styles.divider} />

            {/* ════════════════════════════════════════════
                DATE PICKER
               ════════════════════════════════════════════ */}
            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>DatePicker</h2>
                <p className={styles.sectionDesc}>
                    Input con popover que muestra el calendario. Ideal para formularios.
                </p>

                {/* DatePicker básico */}
                <ExampleCard
                    title="DatePicker básico"
                    desc="Input que abre el calendario al hacer clic"
                    filename="DatePickerExample.tsx"
                    code={CODE.datePicker}
                >
                    <DatePicker value={dpDate} onChange={setDpDate} />
                </ExampleCard>

                {/* DatePicker con minDate */}
                <ExampleCard
                    title="DatePicker — solo fechas futuras"
                    desc="Deshabilita fechas pasadas con minDate"
                    filename="DatePickerFuture.tsx"
                    code={CODE.datePickerMin}
                >
                    <DatePicker
                        value={dpFuture}
                        onChange={setDpFuture}
                        placeholder="Solo fechas futuras"
                        minDate={new Date()}
                    />
                </ExampleCard>

                {/* DateRangePicker */}
                <ExampleCard
                    title="DateRangePicker"
                    desc="Selector de rango de fechas con input — ideal para reportes y filtros"
                    filename="DateRangeExample.tsx"
                    code={CODE.dateRange}
                >
                    <DateRangePicker
                        from={drFrom}
                        to={drTo}
                        onChange={(range) => { setDrFrom(range.from); setDrTo(range.to) }}
                        placeholder="Seleccionar período"
                    />
                </ExampleCard>
            </div>

            <div className={styles.divider} />

            {/* ════════════════════════════════════════════
                CALENDAR VIEW — Eventos
               ════════════════════════════════════════════ */}
            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Calendar View</h2>
                <p className={styles.sectionDesc}>
                    Vista de calendario mensual con eventos. Drag & drop para mover eventos entre días. Click para ver detalles en Drawer.
                </p>

                <div style={{ overflow: 'visible' }}>
                    <CalendarView
                        events={sampleEvents}
                        onEventClick={(event) => alert(`Evento: ${event.title}`)}
                        onEventDrop={(event, newDate) => alert(`Movido "${event.title}" a ${newDate.toLocaleDateString('es-ES')}`)}
                        onAddEvent={() => alert('Abrir formulario de evento')}
                    />
                </div>
            </div>

            <div className={styles.divider} />

            {/* ════════════════════════════════════════════
                INTEGRACIÓN CON FORMULARIOS
               ════════════════════════════════════════════ */}
            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Integración con formularios</h2>
                <p className={styles.sectionDesc}>
                    Ejemplo de cómo usar DatePicker dentro de un formulario real.
                </p>

                <ExampleCard
                    title="Formulario con DatePicker"
                    desc="Campos de texto + DatePicker + botón de envío"
                    filename="EventForm.tsx"
                    code={CODE.formIntegration}
                >
                    <FormExample />
                </ExampleCard>
            </div>

            <div className={styles.divider} />

            {/* ════════════════════════════════════════════
                PROPS
               ════════════════════════════════════════════ */}
            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Props</h2>
                <p className={styles.sectionDesc}>
                    Referencia de props disponibles para cada componente.
                </p>

                <ExampleCard
                    title="Referencia de props"
                    desc="Todas las props disponibles para Calendar, DatePicker y DateRangePicker"
                    filename="types.ts"
                    code={CODE.propsTable}
                >
                    <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.8 }}>
                        <p style={{ margin: '0 0 8px' }}>
                            <strong>Calendar</strong> — Calendario inline sin input
                        </p>
                        <p style={{ margin: '0 0 8px' }}>
                            <strong>DatePicker</strong> — Input + popover con calendario
                        </p>
                        <p style={{ margin: '0 0 8px' }}>
                            <strong>DateRangePicker</strong> — Input + popover con rango
                        </p>
                        <p style={{ margin: 0, fontSize: 12, opacity: 0.6 }}>
                            Todos soportan minDate, maxDate y locale español por defecto.
                        </p>
                    </div>
                </ExampleCard>
            </div>
        </div>
    )
}

// ─── Form Example ─────────────────────────────────────────
function FormExample() {
    const [title, setTitle] = useState('')
    const [date, setDate] = useState<Date>()

    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '8px 12px',
        border: '1px solid var(--border)',
        borderRadius: 8,
        fontSize: 13,
        background: 'var(--bg)',
        color: 'var(--text-h)',
        boxSizing: 'border-box',
        fontFamily: 'var(--sans)',
    }

    const labelStyle: React.CSSProperties = {
        fontSize: 12,
        fontWeight: 600,
        color: 'var(--text-h)',
        display: 'block',
        marginBottom: 4,
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
                <label style={labelStyle}>Nombre del evento</label>
                <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ej: Reunión de equipo"
                    style={inputStyle}
                />
            </div>
            <div>
                <label style={labelStyle}>Fecha</label>
                <DatePicker value={date} onChange={setDate} />
            </div>
            {title && date && (
                <div style={{
                    padding: '10px 14px',
                    borderRadius: 8,
                    background: 'var(--accent-bg)',
                    border: '1px solid var(--accent-border)',
                    fontSize: 13,
                    color: 'var(--accent)',
                }}>
                    <LuCalendarDays size={14} /> <strong>{title}</strong> — {date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            )}
        </div>
    )
}
