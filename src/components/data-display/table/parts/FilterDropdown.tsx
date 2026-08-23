import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { LuFilter, LuX } from 'react-icons/lu'
import type { FilterType } from '../types'
import styles from './FilterDropdown.module.css'

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

    const handleOpen = () => {
        if (!isOpen) {
            // Al abrir por primera vez sin selección → seleccionar todos (text/select)
            if (filterType !== 'number' && selectedValues.size === 0) {
                onChange(new Set(uniqueValues))
            }
        }
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
        <div className={styles.container}>
            <button
                ref={buttonRef}
                className={`${styles.trigger} ${hasFilter ? styles.triggerActive : ''}`}
                onClick={handleOpen}
                aria-label={`Filtrar ${header}`}
                aria-expanded={isOpen}
            >
                <LuFilter size={14} />
            </button>

            {isOpen && createPortal(
                <div ref={popoverRef} className={styles.popover} style={popoverStyle}>
                    <div className={styles.popoverHeader}>
                        <span className={styles.popoverTitle}>Filtrar: {header}</span>
                        {hasFilter && (
                            <button className={styles.clearBtn} onClick={() => { onClear(); setIsOpen(false) }}>
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
            <div className={styles.searchWrap}>
                <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="Buscar..."
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    autoFocus
                />
            </div>

            <label className={styles.checkItem}>
                <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => { if (el) el.indeterminate = indeterminate }}
                    onChange={toggleAll}
                    className={styles.checkbox}
                />
                <span className={styles.checkLabel}>Seleccionar todo</span>
            </label>

            <div className={styles.divider} />

            <div className={styles.list}>
                {filteredValues.length === 0 ? (
                    <p className={styles.noResults}>Sin resultados</p>
                ) : (
                    filteredValues.map((value) => (
                        <label key={value} className={styles.checkItem}>
                            <input
                                type="checkbox"
                                checked={selectedValues.has(value)}
                                onChange={() => toggleValue(value)}
                                className={styles.checkbox}
                            />
                            <span className={styles.checkLabel}>{value}</span>
                        </label>
                    ))
                )}
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
        <div className={styles.numberFilter}>
            <div className={styles.numberRow}>
                <label className={styles.numberLabel}>Mayor que</label>
                <input
                    type="number"
                    className={styles.numberInput}
                    placeholder="Mínimo"
                    value={range?.min ?? ''}
                    onChange={(e) => {
                        const val = e.target.value === '' ? undefined : Number(e.target.value)
                        onChange({ ...range, min: val })
                    }}
                />
            </div>
            <div className={styles.numberRow}>
                <label className={styles.numberLabel}>Menor que</label>
                <input
                    type="number"
                    className={styles.numberInput}
                    placeholder="Máximo"
                    value={range?.max ?? ''}
                    onChange={(e) => {
                        const val = e.target.value === '' ? undefined : Number(e.target.value)
                        onChange({ ...range, max: val })
                    }}
                />
            </div>
            <p className={styles.numberHint}>Deja vacío para no aplicar límite.</p>
        </div>
    )
}

// ─── Boolean filter (true/false) ───────────────────
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
            <label className={styles.checkItem}>
                <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => { if (el) el.indeterminate = indeterminate }}
                    onChange={toggleAll}
                    className={styles.checkbox}
                />
                <span className={styles.checkLabel}>Seleccionar todo</span>
            </label>

            <div className={styles.divider} />

            <div className={styles.list}>
                <label className={styles.checkItem}>
                    <input
                        type="checkbox"
                        checked={selectedValues.has('true')}
                        onChange={() => toggleValue('true')}
                        className={styles.checkbox}
                    />
                    <span className={styles.checkLabel}>Sí / Verdadero</span>
                </label>
                <label className={styles.checkItem}>
                    <input
                        type="checkbox"
                        checked={selectedValues.has('false')}
                        onChange={() => toggleValue('false')}
                        className={styles.checkbox}
                    />
                    <span className={styles.checkLabel}>No / Falso</span>
                </label>
            </div>
        </>
    )
}
