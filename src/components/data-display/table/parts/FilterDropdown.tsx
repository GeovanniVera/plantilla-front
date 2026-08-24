import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { LuFilter, LuX } from 'react-icons/lu'
import type { FilterType } from '../types'

interface FilterDropdownProps {
    header: string
    filterType: FilterType
    uniqueValues: string[]
    /** Valores seleccionados (para text/select). Vacío = ninguno seleccionado. */
    selectedValues: Set<string>
    /** Rango numérico (para number) */
    numericRange?: { min?: number; max?: number }
    hasFilter: boolean
    onChange: (selected: Set<string>) => void
    onNumericChange?: (range: { min?: number; max?: number }) => void
    onClear: () => void
}

/* ─── Styling ──────────────────────────────────────────────
 * All chrome is Tailwind. The popover POSITION remains JS-computed
 * (getBoundingClientRect + viewport flip) via the inline style below —
 * deliberately outside the migration. Entrance reuses the shared
 * --animate-popover-in token (.12s ease, identical to the legacy rule). */
const CONTAINER_CLASSES = 'relative inline-flex items-center gap-1'

const TRIGGER_BASE_CLASSES =
    'flex items-center justify-center size-[22px] rounded-sm border-none bg-transparent cursor-pointer shrink-0 transition-colors duration-150 ease-in-out'
const TRIGGER_ACTIVE_CLASSES = 'text-accent opacity-100 bg-accent-subtle'
const TRIGGER_IDLE_CLASSES = 'text-foreground opacity-50 hover:bg-accent-subtle hover:text-accent hover:opacity-100'

const POPOVER_CLASSES =
    'w-60 bg-background border border-border-base rounded-[10px] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.08),0_10px_20px_-2px_rgba(0,0,0,0.06)] overflow-hidden animate-popover-in'

const POPOVER_HEADER_CLASSES = 'flex items-center justify-between pt-2.5 pb-2 px-3 border-b border-border-base'
const POPOVER_TITLE_CLASSES = 'text-xs font-semibold text-heading'
const CLEAR_BTN_CLASSES =
    'flex items-center gap-1 px-2 py-[3px] rounded-[5px] border-none bg-transparent text-foreground text-[11px] font-sans cursor-pointer transition-colors duration-150 ease-in-out hover:bg-danger-strong/10 hover:text-danger-strong'

const SEARCH_WRAP_CLASSES = 'px-3 py-2 border-b border-border-base'
const SEARCH_INPUT_CLASSES =
    'w-full px-2.5 py-1.5 border border-border-base rounded-sm bg-surface text-foreground text-xs font-sans outline-none box-border transition-colors duration-150 ease-in-out focus:border-accent placeholder:text-foreground/50'

const CHECK_ITEM_CLASSES = 'flex items-center gap-2 px-3 py-1.5 cursor-pointer transition-colors duration-100 ease-in-out hover:bg-accent-subtle'
const CHECKBOX_CLASSES = 'size-[15px] rounded-[4px] accent-accent cursor-pointer shrink-0'
const CHECK_LABEL_CLASSES = 'text-xs text-foreground whitespace-nowrap overflow-hidden text-ellipsis'

const DIVIDER_CLASSES = 'h-px bg-border-base m-0'
const LIST_CLASSES = 'max-h-[200px] overflow-y-auto py-1'
const NO_RESULTS_CLASSES = 'py-4 px-3 text-xs text-foreground text-center m-0 opacity-60'

const NUMBER_FILTER_CLASSES = 'p-3 flex flex-col gap-2.5'
const NUMBER_ROW_CLASSES = 'flex items-center gap-2'
const NUMBER_LABEL_CLASSES = 'text-xs text-foreground min-w-[80px] shrink-0'
const NUMBER_INPUT_CLASSES =
    'flex-1 px-2.5 py-1.5 border border-border-base rounded-sm bg-surface text-foreground text-xs font-sans outline-none box-border transition-colors duration-150 ease-in-out focus:border-accent placeholder:text-foreground/50'
const NUMBER_HINT_CLASSES = 'text-[11px] text-foreground opacity-50 m-0 text-center'

export default function FilterDropdown({
    header,
    filterType,
    uniqueValues,
    selectedValues,
    numericRange,
    hasFilter,
    onChange,
    onNumericChange,
    onClear,
}: FilterDropdownProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [search, setSearch] = useState('')
    const [position, setPosition] = useState({ top: 0, left: 0 })
    const popoverRef = useRef<HTMLDivElement>(null)
    const buttonRef = useRef<HTMLButtonElement>(null)

    // Calcular posición del popover relativa al viewport
    const updatePosition = useCallback(() => {
        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect()
            setPosition({
                top: rect.bottom + 6,
                left: rect.left,
            })
        }
    }, [])

    // Actualizar posición al abrir y al hacer scroll/resize
    useEffect(() => {
        if (!isOpen) return

        updatePosition()

        const handleUpdate = () => updatePosition()
        window.addEventListener('scroll', handleUpdate, true)
        window.addEventListener('resize', handleUpdate)

        return () => {
            window.removeEventListener('scroll', handleUpdate, true)
            window.removeEventListener('resize', handleUpdate)
        }
    }, [isOpen, updatePosition])

    // Cerrar al hacer click fuera
    useEffect(() => {
        if (!isOpen) return
        const handleClickOutside = (e: MouseEvent) => {
            if (
                popoverRef.current && !popoverRef.current.contains(e.target as Node) &&
                buttonRef.current && !buttonRef.current.contains(e.target as Node)
            ) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [isOpen])

    // Cerrar con Escape
    useEffect(() => {
        if (!isOpen) return
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false)
        }
        document.addEventListener('keydown', handleEscape)
        return () => document.removeEventListener('keydown', handleEscape)
    }, [isOpen])

    // Opening the dropdown is a UI action only — it must NOT mutate logical
    // filter state. An empty selection means "no filter" (see useTableFilters);
    // the user activates a filter by checking values explicitly.
    const handleOpen = () => {
        setIsOpen((p) => !p)
        setSearch('')
    }

    // Ajustar posición si el popover se sale de la pantalla
    const popoverStyle: React.CSSProperties = useMemo(() => {
        if (!isOpen) return { display: 'none' }

        const style: React.CSSProperties = {
            position: 'fixed',
            top: position.top,
            left: position.left,
            zIndex: 9999,
        }

        // Si se sale por la derecha, alinear a la derecha del botón
        if (position.left + 240 > window.innerWidth) {
            style.left = 'auto'
            style.right = window.innerWidth - position.left
        }

        // Si se sale por abajo, mostrar hacia arriba
        if (position.top + 300 > window.innerHeight) {
            style.top = 'auto'
            if (buttonRef.current) {
                style.bottom = window.innerHeight - buttonRef.current.getBoundingClientRect().top + 6
            }
        }

        return style
    }, [isOpen, position])

    return (
        <div className={CONTAINER_CLASSES}>
            <button
                ref={buttonRef}
                className={`${TRIGGER_BASE_CLASSES} ${hasFilter ? TRIGGER_ACTIVE_CLASSES : TRIGGER_IDLE_CLASSES}`}
                onClick={handleOpen}
                aria-label={`Filtrar ${header}`}
                aria-expanded={isOpen}
            >
                <LuFilter size={14} />
            </button>

            {isOpen && createPortal(
                <div ref={popoverRef} className={POPOVER_CLASSES} style={popoverStyle}>
                    <div className={POPOVER_HEADER_CLASSES}>
                        <span className={POPOVER_TITLE_CLASSES}>Filtrar: {header}</span>
                        {hasFilter && (
                            <button className={CLEAR_BTN_CLASSES} onClick={() => { onClear(); setIsOpen(false) }}>
                                <LuX size={14} />
                                Limpiar
                            </button>
                        )}
                    </div>

                    {filterType === 'number' ? (
                        <NumberFilterContent
                            range={numericRange}
                            onChange={onNumericChange!}
                        />
                    ) : filterType === 'boolean' ? (
                        <BooleanFilterContent
                            selectedValues={selectedValues}
                            onChange={onChange}
                        />
                    ) : (
                        <TextFilterContent
                            uniqueValues={uniqueValues}
                            selectedValues={selectedValues}
                            search={search}
                            onSearch={setSearch}
                            onChange={onChange}
                        />
                    )}
                </div>,
                document.body,
            )}
        </div>
    )
}

// ─── Text / Select filter ──────────────────────────
function TextFilterContent({
    uniqueValues,
    selectedValues,
    search,
    onSearch,
    onChange,
}: {
    uniqueValues: string[]
    selectedValues: Set<string>
    search: string
    onSearch: (s: string) => void
    onChange: (selected: Set<string>) => void
}) {
    const allSelected = selectedValues.size === uniqueValues.length

    const filteredValues = useMemo(() => {
        if (!search) return uniqueValues
        const q = search.toLowerCase()
        return uniqueValues.filter((v) => v.toLowerCase().includes(q))
    }, [uniqueValues, search])

    const indeterminate = !allSelected && selectedValues.size > 0

    const toggleValue = (value: string) => {
        const next = new Set(selectedValues)
        if (next.has(value)) next.delete(value)
        else next.add(value)
        onChange(next)
    }

    const toggleAll = () => {
        if (allSelected) onChange(new Set())
        else onChange(new Set(uniqueValues))
    }

    const handleSearch = (value: string) => {
        onSearch(value)
        if (!value) {
            onChange(new Set(uniqueValues))
            return
        }
        const q = value.toLowerCase()
        const matching = new Set(uniqueValues.filter((v) => v.toLowerCase().includes(q)))
        onChange(matching)
    }

    return (
        <>
            <div className={SEARCH_WRAP_CLASSES}>
                <input
                    type="text"
                    className={SEARCH_INPUT_CLASSES}
                    placeholder="Buscar..."
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    autoFocus
                />
            </div>

            <label className={CHECK_ITEM_CLASSES}>
                <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => { if (el) el.indeterminate = indeterminate }}
                    onChange={toggleAll}
                    className={CHECKBOX_CLASSES}
                />
                <span className={CHECK_LABEL_CLASSES}>Seleccionar todo</span>
            </label>

            <div className={DIVIDER_CLASSES} />

            <div className={LIST_CLASSES}>
                {filteredValues.length === 0 ? (
                    <p className={NO_RESULTS_CLASSES}>Sin resultados</p>
                ) : (
                    filteredValues.map((value) => (
                        <label key={value} className={CHECK_ITEM_CLASSES}>
                            <input
                                type="checkbox"
                                checked={selectedValues.has(value)}
                                onChange={() => toggleValue(value)}
                                className={CHECKBOX_CLASSES}
                            />
                            <span className={CHECK_LABEL_CLASSES}>{value}</span>
                        </label>
                    ))
                )}
            </div>
        </>
    )
}

// ─── Boolean filter (Sí/No) ────────────────────────
function BooleanFilterContent({
    selectedValues,
    onChange,
}: {
    selectedValues: Set<string>
    onChange: (selected: Set<string>) => void
}) {
    const options = ['true', 'false']

    const toggleValue = (value: string) => {
        const next = new Set(selectedValues)
        if (next.has(value)) next.delete(value)
        else next.add(value)
        onChange(next)
    }

    const allSelected = selectedValues.size === 2
    const indeterminate = !allSelected && selectedValues.size > 0

    const toggleAll = () => {
        if (allSelected) onChange(new Set())
        else onChange(new Set(options))
    }

    return (
        <>
            <label className={CHECK_ITEM_CLASSES}>
                <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => { if (el) el.indeterminate = indeterminate }}
                    onChange={toggleAll}
                    className={CHECKBOX_CLASSES}
                />
                <span className={CHECK_LABEL_CLASSES}>Seleccionar todo</span>
            </label>

            <div className={DIVIDER_CLASSES} />

            <div className={LIST_CLASSES}>
                <label className={CHECK_ITEM_CLASSES}>
                    <input
                        type="checkbox"
                        checked={selectedValues.has('true')}
                        onChange={() => toggleValue('true')}
                        className={CHECKBOX_CLASSES}
                    />
                    <span className={CHECK_LABEL_CLASSES}>Sí / Verdadero</span>
                </label>
                <label className={CHECK_ITEM_CLASSES}>
                    <input
                        type="checkbox"
                        checked={selectedValues.has('false')}
                        onChange={() => toggleValue('false')}
                        className={CHECKBOX_CLASSES}
                    />
                    <span className={CHECK_LABEL_CLASSES}>No / Falso</span>
                </label>
            </div>
        </>
    )
}

// ─── Number filter (mayor/menor que) ───────────────
function NumberFilterContent({
    range,
    onChange,
}: {
    range?: { min?: number; max?: number }
    onChange: (range: { min?: number; max?: number }) => void
}) {
    return (
        <div className={NUMBER_FILTER_CLASSES}>
            <div className={NUMBER_ROW_CLASSES}>
                <label className={NUMBER_LABEL_CLASSES}>Mayor que</label>
                <input
                    type="number"
                    className={NUMBER_INPUT_CLASSES}
                    placeholder="Mínimo"
                    value={range?.min ?? ''}
                    onChange={(e) => {
                        const val = e.target.value === '' ? undefined : Number(e.target.value)
                        onChange({ ...range, min: val })
                    }}
                />
            </div>
            <div className={NUMBER_ROW_CLASSES}>
                <label className={NUMBER_LABEL_CLASSES}>Menor que</label>
                <input
                    type="number"
                    className={NUMBER_INPUT_CLASSES}
                    placeholder="Máximo"
                    value={range?.max ?? ''}
                    onChange={(e) => {
                        const val = e.target.value === '' ? undefined : Number(e.target.value)
                        onChange({ ...range, max: val })
                    }}
                />
            </div>
            <p className={NUMBER_HINT_CLASSES}>Deja vacío para no aplicar límite.</p>
        </div>
    )
}
