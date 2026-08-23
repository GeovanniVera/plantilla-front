import { useState, useMemo } from 'react'
import { CalendarView, type CalendarEvent, type EventColor, DateRangePicker } from '@components/data-display/calendar'
import { DrawerStack, ConfirmDialog } from '@components/overlays'
import { useToast } from '@components/feedback'
import { LuPencil, LuTrash2 } from 'react-icons/lu'
import { initialBlocks, TYPE_CONFIG, type AvailabilityBlock } from './demo-calendario-data'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import styles from './TablesShowcase.module.css'

// ─── Color mapping por tipo ──────────────────────────────
const TYPE_COLOR_MAP: Record<AvailabilityBlock['type'], EventColor> = {
    available: 'green',
    busy: 'red',
    'office-hours': 'yellow',
    class: 'purple',
}

// ─── Niveles del Drawer (0-indexed, como DrawerStack) ────
// Flujo day:  0=lista → 1=detalle → 2=editar
// Flujo event: 0=detalle → 1=editar

type DrawerFlow = 'day' | 'event'

export default function Calendario() {
    const toast = useToast()
    const [blocks, setBlocks] = useState<AvailabilityBlock[]>(initialBlocks)
    const [formOpen, setFormOpen] = useState(false)

    // ─── Filtros ─────────────────────────────────────────
    const [filterType, setFilterType] = useState<AvailabilityBlock['type'] | 'all'>('all')
    const [filterFrom, setFilterFrom] = useState<Date>()
    const [filterTo, setFilterTo] = useState<Date>()

    // ─── Form state ──────────────────────────────────────
    const [formTitle, setFormTitle] = useState('')
    const [formType, setFormType] = useState<AvailabilityBlock['type']>('available')
    const [formFrom, setFormFrom] = useState<Date>()
    const [formTo, setFormTo] = useState<Date>()
    const [formDescription, setFormDescription] = useState('')
    const [formLocation, setFormLocation] = useState('')
    const [formAllDay, setFormAllDay] = useState(false)
    const [formStartTime, setFormStartTime] = useState('09:00')
    const [formEndTime, setFormEndTime] = useState('10:00')

    // ─── Confirm cancel ──────────────────────────────────
    const [confirmCancel, setConfirmCancel] = useState(false)

    // ─── Drawer state ────────────────────────────────────
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [drawerFlow, setDrawerFlow] = useState<DrawerFlow>('day')
    const [drawerLevel, setDrawerLevel] = useState(0)  // 0-indexed
    const [drawerDayEvents, setDrawerDayEvents] = useState<CalendarEvent[]>([])
    const [drawerDayDate, setDrawerDayDate] = useState<Date | null>(null)
    const [drawerEvent, setDrawerEvent] = useState<CalendarEvent | null>(null)
    const [drawerBlock, setDrawerBlock] = useState<AvailabilityBlock | null>(null)

    // ─── Confirm delete ──────────────────────────────────
    const [confirmDelete, setConfirmDelete] = useState<AvailabilityBlock | null>(null)

    // ─── Edit form state ─────────────────────────────────
    const [editTitle, setEditTitle] = useState('')
    const [editType, setEditType] = useState<AvailabilityBlock['type']>('available')
    const [editFrom, setEditFrom] = useState<Date>()
    const [editTo, setEditTo] = useState<Date>()
    const [editDescription, setEditDescription] = useState('')
    const [editLocation, setEditLocation] = useState('')

    // ─── Filtrado ────────────────────────────────────────
    const filteredBlocks = useMemo(() => {
        return blocks.filter((b) => {
            if (filterType !== 'all' && b.type !== filterType) return false
            if (filterFrom && b.end < filterFrom) return false
            if (filterTo && b.start > filterTo) return false
            return true
        })
    }, [blocks, filterType, filterFrom, filterTo])

    // ─── Events ──────────────────────────────────────────
    const events: CalendarEvent[] = useMemo(() => {
        return filteredBlocks.map((block) => ({
            id: block.id,
            title: block.title,
            start: block.start,
            end: block.end,
            allDay: block.allDay,
            color: TYPE_COLOR_MAP[block.type],
        }))
    }, [filteredBlocks])

    // ─── Helpers ─────────────────────────────────────────
    const hasFormData = formTitle || formDescription || formLocation || formFrom || formTo

    const resetForm = () => {
        setFormTitle(''); setFormType('available'); setFormFrom(undefined); setFormTo(undefined)
        setFormDescription(''); setFormLocation(''); setFormAllDay(false)
        setFormStartTime('09:00'); setFormEndTime('10:00')
    }

    const handleCancelForm = () => {
        if (hasFormData) setConfirmCancel(true)
        else setFormOpen(false)
    }

    const confirmCancelForm = () => {
        resetForm(); setFormOpen(false); setConfirmCancel(false)
    }

    const getBlockFromEvent = (event: CalendarEvent) => blocks.find((b) => b.id === event.id) || null

    // ─── Handlers ────────────────────────────────────────
    const handleAddBlock = () => {
        if (!formTitle || !formFrom || !formTo) return
        const [sh, sm] = formStartTime.split(':').map(Number)
        const [eh, em] = formEndTime.split(':').map(Number)
        const start = new Date(formFrom)
        const end = new Date(formTo)
        if (!formAllDay) {
            start.setHours(sh, sm, 0, 0)
            end.setHours(eh, em, 0, 0)
        }
        setBlocks((prev) => [...prev, {
            id: Date.now(), teacherId: 1,
            title: formTitle, start, end, type: formType,
            allDay: formAllDay, description: formDescription || undefined, location: formLocation || undefined,
        }])
        resetForm(); setFormOpen(false)
        toast.success('Evento creado correctamente')
    }

    const handleDeleteBlock = (id: number) => {
        const block = blocks.find((b) => b.id === id)
        setBlocks((prev) => prev.filter((b) => b.id !== id))
        closeDrawer()
        toast.success(`"${block?.title}" eliminado`)
    }

    const handleSaveEdit = () => {
        if (!drawerBlock || !editTitle) return
        setBlocks((prev) => prev.map((b) =>
            b.id === drawerBlock.id
                ? {
                    ...b, title: editTitle, type: editType,
                    start: editFrom || b.start, end: editTo || b.end,
                    description: editDescription || undefined, location: editLocation || undefined,
                }
                : b
        ))
        // Volver al nivel de detalle
        setDrawerLevel(drawerFlow === 'day' ? 1 : 0)
        toast.success('Bloque actualizado')
    }

    // ─── Drawer Navigation (0-indexed) ───────────────────
    const closeDrawer = () => {
        setDrawerOpen(false); setDrawerLevel(0)
        setDrawerDayEvents([]); setDrawerDayDate(null)
        setDrawerEvent(null); setDrawerBlock(null)
    }

    /** Flujo day: Click "+N más" o celda día → Lista (nivel 0) */
    const openDayList = (dayEvents: CalendarEvent[], date: Date) => {
        setDrawerFlow('day')
        setDrawerDayEvents(dayEvents); setDrawerDayDate(date)
        setDrawerLevel(0); setDrawerOpen(true)
    }

    /** Flujo event: Click evento → Detalle (nivel 0) */
    const openEventDirect = (event: CalendarEvent) => {
        const block = getBlockFromEvent(event)
        if (!block) return
        setDrawerFlow('event')
        setDrawerEvent(event); setDrawerBlock(block)
        setDrawerLevel(0); setDrawerOpen(true)
    }

    /** Flujo day: Lista → Detalle (nivel 1) */
    const openEventFromList = (event: CalendarEvent) => {
        const block = getBlockFromEvent(event)
        if (!block) return
        setDrawerEvent(event); setDrawerBlock(block)
        setDrawerLevel(1)
    }

    /** Detalle → Editar */
    const openEditForm = () => {
        if (!drawerBlock) return
        setEditTitle(drawerBlock.title); setEditType(drawerBlock.type)
        setEditFrom(drawerBlock.start); setEditTo(drawerBlock.end)
        setEditDescription(drawerBlock.description || ''); setEditLocation(drawerBlock.location || '')
        setDrawerLevel(drawerFlow === 'day' ? 2 : 1)
    }

    /** Botón atrás */
    const handleBack = () => {
        if (drawerLevel === 0) closeDrawer()
        else if (drawerFlow === 'day') {
            if (drawerLevel === 2) setDrawerLevel(1)           // editar → detalle
            else if (drawerLevel === 1) { setDrawerEvent(null); setDrawerBlock(null); setDrawerLevel(0) }  // detalle → lista
        } else {
            setDrawerLevel(0)  // editar → detalle
        }
    }

    /** Click en breadcrumb → navegar a nivel específico */
    const handleNavigate = (targetLevel: number) => {
        if (drawerFlow === 'day') {
            if (targetLevel === 0) { setDrawerEvent(null); setDrawerBlock(null) }
            if (targetLevel <= 1) setDrawerBlock(null)
        }
        setDrawerLevel(targetLevel)
    }

    // ─── Breadcrumbs (0-indexed) ─────────────────────────
    const breadcrumbs = useMemo(() => {
        if (drawerFlow === 'day') {
            if (drawerLevel === 0 && drawerDayDate) {
                return [{ label: format(drawerDayDate, "d 'de' MMMM", { locale: es }), level: 0 }]
            }
            if (drawerLevel === 1 && drawerDayDate && drawerEvent) {
                return [
                    { label: format(drawerDayDate, "d 'de' MMMM", { locale: es }), level: 0 },
                    { label: drawerEvent.title, level: 1 },
                ]
            }
            if (drawerLevel === 2 && drawerDayDate && drawerEvent) {
                return [
                    { label: format(drawerDayDate, "d 'de' MMMM", { locale: es }), level: 0 },
                    { label: drawerEvent.title, level: 1 },
                    { label: 'Editar', level: 2 },
                ]
            }
        } else {
            if (drawerLevel === 0 && drawerEvent) {
                return [{ label: drawerEvent.title, level: 0 }]
            }
            if (drawerLevel === 1 && drawerEvent) {
                return [
                    { label: drawerEvent.title, level: 0 },
                    { label: 'Editar', level: 1 },
                ]
            }
        }
        return undefined
    }, [drawerFlow, drawerLevel, drawerDayDate, drawerEvent])

    // ─── Styles ──────────────────────────────────────────
    const inputStyle: React.CSSProperties = {
        width: '100%', padding: '8px 12px', border: '1px solid var(--border)',
        borderRadius: 8, fontSize: 13, background: 'var(--bg)', color: 'var(--text-h)',
        boxSizing: 'border-box', fontFamily: 'var(--sans)',
    }
    const labelStyle: React.CSSProperties = {
        fontSize: 12, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 4,
    }
    const selectStyle: React.CSSProperties = {
        width: '100%', padding: '8px 32px 8px 12px', borderRadius: 8, border: '1px solid var(--border)',
        background: 'var(--bg)', color: 'var(--text)', fontSize: 13, fontFamily: 'var(--sans)',
        cursor: 'pointer', appearance: 'none', boxSizing: 'border-box',
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%236b7280' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E\")",
        backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center',
    }

    // ─── Render ──────────────────────────────────────────
    return (
        <div className={styles.page}>

            {/* ═══ Filtros ═══ */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: '1 1 auto' }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap' }}>Tipo:</label>
                    <select value={filterType} onChange={(e) => setFilterType(e.target.value as AvailabilityBlock['type'] | 'all')} style={{ ...selectStyle, minWidth: 0 }}>
                        <option value="all">Todos</option>
                        {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
                            <option key={key} value={key}>{cfg.label}</option>
                        ))}
                    </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: '1 1 auto' }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap' }}>Fecha:</label>
                    <div style={{ minWidth: 0, flex: 1 }}>
                        <DateRangePicker from={filterFrom} to={filterTo} onChange={(range) => { setFilterFrom(range.from); setFilterTo(range.to) }} placeholder="Filtrar período" />
                    </div>
                </div>
                {(filterType !== 'all' || filterFrom || filterTo) && (
                    <button onClick={() => { setFilterType('all'); setFilterFrom(undefined); setFilterTo(undefined) }} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', fontSize: 12, fontWeight: 500, fontFamily: 'var(--sans)', cursor: 'pointer' }}>
                        Limpiar filtros
                    </button>
                )}
            </div>

            {/* ═══ Formulario de creación ═══ */}
            {formOpen && (
                <div style={{ padding: 20, borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg)', marginBottom: 20, overflow: 'hidden' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 12 }}>
                        <div><label style={labelStyle}>Título del evento *</label><input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="Ej: Reunión de equipo" style={inputStyle} autoFocus /></div>
                        <div><label style={labelStyle}>Tipo *</label><select value={formType} onChange={(e) => setFormType(e.target.value as AvailabilityBlock['type'])} style={inputStyle}>{Object.entries(TYPE_CONFIG).map(([key, cfg]) => <option key={key} value={key}>{cfg.label}</option>)}</select></div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 12, alignItems: 'end' }}>
                        <div><label style={labelStyle}>Fecha *</label><DateRangePicker from={formFrom} to={formTo} onChange={(range) => { setFormFrom(range.from); setFormTo(range.to) }} placeholder="Inicio — Fin" /></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingBottom: 8 }}><input type="checkbox" id="allDay" checked={formAllDay} onChange={(e) => setFormAllDay(e.target.checked)} style={{ cursor: 'pointer' }} /><label htmlFor="allDay" style={{ fontSize: 12, color: 'var(--text)', cursor: 'pointer' }}>Todo el día</label></div>
                    </div>
                    {!formAllDay && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                            <div><label style={labelStyle}>Hora inicio *</label><input type="time" value={formStartTime} onChange={(e) => setFormStartTime(e.target.value)} style={inputStyle} /></div>
                            <div><label style={labelStyle}>Hora fin *</label><input type="time" value={formEndTime} onChange={(e) => setFormEndTime(e.target.value)} style={inputStyle} /></div>
                        </div>
                    )}
                    <div style={{ marginBottom: 12 }}><label style={labelStyle}>Descripción</label><textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} placeholder="Notas o detalles del evento..." rows={2} style={{ ...inputStyle, resize: 'vertical', minHeight: 52 }} /></div>
                    <div style={{ marginBottom: 16 }}><label style={labelStyle}>Ubicación</label><input value={formLocation} onChange={(e) => setFormLocation(e.target.value)} placeholder="Ej: Sala de juntas / https://meet.google.com/..." style={inputStyle} /></div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                        <button onClick={handleCancelForm} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', fontSize: 13, fontWeight: 500, fontFamily: 'var(--sans)', cursor: 'pointer' }}>Cancelar</button>
                        <button onClick={handleAddBlock} disabled={!formTitle || !formFrom || !formTo} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: formTitle && formFrom && formTo ? 'var(--accent)' : 'var(--border)', color: formTitle && formFrom && formTo ? '#fff' : 'var(--text)', fontSize: 13, fontWeight: 600, fontFamily: 'var(--sans)', cursor: formTitle && formFrom && formTo ? 'pointer' : 'not-allowed' }}>Crear evento</button>
                    </div>
                </div>
            )}

            {/* ═══ Calendario ═══ */}
            <div style={{ overflow: 'visible' }}>
                <CalendarView
                    events={events}
                    onEventClick={openEventDirect}
                    onDayClick={(date, dayEvents) => { if (dayEvents.length > 0) openDayList(dayEvents, date) }}
                    onMoreClick={openDayList}
                    onEventDrop={(event, newDate) => {
                        setBlocks((prev) => prev.map((b) =>
                            b.id === event.id ? { ...b, start: newDate, end: new Date(newDate.getTime() + (b.end.getTime() - b.start.getTime())) } : b
                        ))
                        toast.success(`"${event.title}" movido a ${format(newDate, 'd MMM', { locale: es })}`)
                    }}
                    onAddEvent={() => setFormOpen(true)}
                />
            </div>

            {/* ═══ Leyenda ═══ */}
            <div style={{ display: 'flex', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
                {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
                    <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text)' }}>
                        <span style={{ width: 10, height: 10, borderRadius: '50%', background: cfg.color }} />
                        {cfg.label}
                    </div>
                ))}
            </div>

            {/* ═══════════════════════════════════════════════
                DRAWER STACK — Multi-nivel
               ═══════════════════════════════════════════════ */}
            <DrawerStack
                isOpen={drawerOpen}
                onClose={closeDrawer}
                level={drawerLevel}
                onBack={handleBack}
                onNavigate={handleNavigate}
                breadcrumbs={breadcrumbs}
                width={480}
            >
                {/* ═══ Flujo day, Nivel 0 — Lista de eventos ═══ */}
                {drawerFlow === 'day' && drawerLevel === 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ fontSize: 13, color: 'var(--text)', opacity: 0.6, marginBottom: 4 }}>
                            {drawerDayEvents.length} evento{drawerDayEvents.length !== 1 ? 's' : ''}
                        </div>
                        {drawerDayEvents.map((event) => {
                            const block = getBlockFromEvent(event)
                            const cfg = block ? TYPE_CONFIG[block.type] : null
                            return (
                                <button
                                    key={event.id}
                                    onClick={() => openEventFromList(event)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 12,
                                        padding: '12px 14px', borderRadius: 10,
                                        border: '1px solid var(--border)', background: 'var(--bg)',
                                        cursor: 'pointer', textAlign: 'left', width: '100%',
                                        fontFamily: 'var(--sans)', transition: 'all 0.12s',
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-border)'; e.currentTarget.style.background = 'var(--code-bg)' }}
                                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg)' }}
                                >
                                    <span style={{ width: 4, height: 36, borderRadius: 2, background: cfg?.color || '#6b7280', flexShrink: 0 }} />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-h)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{event.title}</div>
                                        <div style={{ fontSize: 12, color: 'var(--text)', opacity: 0.6, marginTop: 2 }}>{cfg?.label}</div>
                                    </div>
                                    <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', opacity: 0.5, whiteSpace: 'nowrap' }}>
                                        {!event.allDay && event.start ? format(event.start, 'HH:mm') : 'Todo el día'}
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                )}

                {/* ═══ Flujo day Nivel 1 / Flujo event Nivel 0 — Detalle ═══ */}
                {((drawerFlow === 'day' && drawerLevel === 1) || (drawerFlow === 'event' && drawerLevel === 0)) && drawerBlock && (() => {
                    const cfg = TYPE_CONFIG[drawerBlock.type]
                    return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                                <div style={{
                                    width: 44, height: 44, borderRadius: 12,
                                    background: `${cfg?.color || '#6b7280'}15`,
                                    border: `1px solid ${cfg?.color || '#6b7280'}25`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                }}>
                                    <span style={{ width: 12, height: 12, borderRadius: '50%', background: cfg?.color || '#6b7280' }} />
                                </div>
                                <div>
                                    <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-h)' }}>{drawerBlock.title}</div>
                                    <div style={{ fontSize: 12, color: 'var(--text)', opacity: 0.6, marginTop: 2 }}>{cfg?.label}</div>
                                </div>
                            </div>
                            {[
                                { label: 'Inicio', value: format(drawerBlock.start, "EEEE d 'de' MMMM, HH:mm", { locale: es }) },
                                { label: 'Fin', value: format(drawerBlock.end, "EEEE d 'de' MMMM, HH:mm", { locale: es }) },
                                drawerBlock.description ? { label: 'Descripción', value: drawerBlock.description } : null,
                                drawerBlock.location ? { label: 'Ubicación', value: drawerBlock.location } : null,
                            ].filter(Boolean).map((f) => f && (
                                <div key={f.label}>
                                    <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4, color: 'var(--text)', opacity: 0.5, marginBottom: 6 }}>{f.label}</div>
                                    <div style={{ padding: '10px 12px', borderRadius: 8, background: 'var(--code-bg)', border: '1px solid var(--border)', fontSize: 13, color: 'var(--text-h)', whiteSpace: 'pre-wrap' }}>{f.value}</div>
                                </div>
                            ))}
                            {drawerBlock.attendees && drawerBlock.attendees.length > 0 && (
                                <div>
                                    <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4, color: 'var(--text)', opacity: 0.5, marginBottom: 6 }}>Participantes</div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                        {drawerBlock.attendees.map((a, i) => (
                                            <span key={i} style={{ padding: '4px 10px', borderRadius: 6, background: 'var(--accent-bg)', border: '1px solid var(--accent-border)', fontSize: 12, fontWeight: 500, color: 'var(--accent)' }}>{a}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                                <button onClick={openEditForm} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 16px', borderRadius: 8, border: '1px solid var(--accent-border)', background: 'var(--accent-bg)', color: 'var(--accent)', fontSize: 13, fontWeight: 600, fontFamily: 'var(--sans)', cursor: 'pointer' }}>
                                    <LuPencil size={14} /> Editar
                                </button>
                                <button onClick={() => setConfirmDelete(drawerBlock)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 16px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: '#dc2626', fontSize: 13, fontWeight: 600, fontFamily: 'var(--sans)', cursor: 'pointer' }}>
                                    <LuTrash2 size={14} /> Eliminar
                                </button>
                            </div>
                        </div>
                    )
                })()}

                {/* ═══ Flujo day Nivel 2 / Flujo event Nivel 1 — Editar ═══ */}
                {((drawerFlow === 'day' && drawerLevel === 2) || (drawerFlow === 'event' && drawerLevel === 1)) && drawerBlock && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div><label style={labelStyle}>Título *</label><input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} style={inputStyle} /></div>
                        <div><label style={labelStyle}>Tipo *</label><select value={editType} onChange={(e) => setEditType(e.target.value as AvailabilityBlock['type'])} style={inputStyle}>{Object.entries(TYPE_CONFIG).map(([key, cfg]) => <option key={key} value={key}>{cfg.label}</option>)}</select></div>
                        <div><label style={labelStyle}>Fecha *</label><DateRangePicker from={editFrom} to={editTo} onChange={(range) => { setEditFrom(range.from); setEditTo(range.to) }} placeholder="Inicio — Fin" /></div>
                        <div><label style={labelStyle}>Descripción</label><textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} placeholder="Notas o detalles..." rows={2} style={{ ...inputStyle, resize: 'vertical', minHeight: 52 }} /></div>
                        <div><label style={labelStyle}>Ubicación</label><input value={editLocation} onChange={(e) => setEditLocation(e.target.value)} placeholder="Sala, enlace, etc." style={inputStyle} /></div>
                        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                            <button onClick={handleBack} style={{ flex: 1, padding: '10px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', fontSize: 13, fontWeight: 500, fontFamily: 'var(--sans)', cursor: 'pointer' }}>Cancelar</button>
                            <button onClick={handleSaveEdit} disabled={!editTitle} style={{ flex: 1, padding: '10px 16px', borderRadius: 8, border: 'none', background: editTitle ? 'var(--accent)' : 'var(--border)', color: editTitle ? '#fff' : 'var(--text)', fontSize: 13, fontWeight: 600, fontFamily: 'var(--sans)', cursor: editTitle ? 'pointer' : 'not-allowed' }}>Guardar</button>
                        </div>
                    </div>
                )}
            </DrawerStack>

            {/* ═══ Confirm Dialog — Cancelar formulario ═══ */}
            <ConfirmDialog
                isOpen={confirmCancel}
                onClose={() => setConfirmCancel(false)}
                onConfirm={confirmCancelForm}
                title="Descartar evento"
                message="Tienes datos sin guardar. ¿Deseas descartar el formulario?"
                confirmLabel="Descartar"
                cancelLabel="Seguir editando"
                variant="warning"
            />

            {/* ═══ Confirm Dialog — Eliminar evento ═══ */}
            <ConfirmDialog
                isOpen={!!confirmDelete}
                onClose={() => setConfirmDelete(null)}
                onConfirm={() => confirmDelete && handleDeleteBlock(confirmDelete.id)}
                title="Eliminar evento"
                message={`¿Eliminar "${confirmDelete?.title}"?`}
                confirmLabel="Eliminar"
                cancelLabel="Cancelar"
                variant="destructive"
            />
        </div>
    )
}
