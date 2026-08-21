import { useState, useRef, useEffect, useMemo } from 'react'
import { LuFilter, LuX } from 'react-icons/lu'
import styles from './FilterDropdown.module.css'

interface FilterDropdownProps {
    /** Título de la columna */
    header: string
    /** Valores únicos disponibles en la columna */
    uniqueValues: string[]
    /** Valores actualmente seleccionados (vacío = todo seleccionado) */
    selectedValues: Set<string>
    /** Si hay filtro activo */
    hasFilter: boolean
    /** Callback al cambiar la selección */
    onChange: (selected: Set<string>) => void
    /** Callback para limpiar el filtro */
    onClear: () => void
}

export default function FilterDropdown({
    header,
    uniqueValues,
    selectedValues,
    hasFilter,
    onChange,
    onClear,
}: FilterDropdownProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [search, setSearch] = useState('')
    const popoverRef = useRef<HTMLDivElement>(null)
    const buttonRef = useRef<HTMLButtonElement>(null)

    // Filtrar valores por búsqueda
    const filteredValues = useMemo(() => {
        if (!search) return uniqueValues
        const q = search.toLowerCase()
        return uniqueValues.filter((v) => v.toLowerCase().includes(q))
    }, [uniqueValues, search])

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

    const toggleValue = (value: string) => {
        const next = new Set(selectedValues)
        if (next.has(value)) {
            next.delete(value)
        } else {
            next.add(value)
        }
        onChange(next)
    }

    const toggleAll = () => {
        if (selectedValues.size === uniqueValues.length) {
            // Deseleccionar todos
            onChange(new Set())
        } else {
            // Seleccionar todos
            onChange(new Set(uniqueValues))
        }
    }

    const handleOpen = () => {
        setIsOpen((p) => !p)
        setSearch('')
    }

    const allSelected = selectedValues.size === uniqueValues.length || selectedValues.size === 0

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

            {isOpen && (
                <div ref={popoverRef} className={styles.popover}>
                    {/* Header del popover */}
                    <div className={styles.popoverHeader}>
                        <span className={styles.popoverTitle}>Filtrar: {header}</span>
                        {hasFilter && (
                            <button className={styles.clearBtn} onClick={() => { onClear(); setIsOpen(false) }}>
                                <LuX size={14} />
                                Limpiar
                            </button>
                        )}
                    </div>

                    {/* Búsqueda */}
                    <div className={styles.searchWrap}>
                        <input
                            type="text"
                            className={styles.searchInput}
                            placeholder="Buscar..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            autoFocus
                        />
                    </div>

                    {/* Select all */}
                    <label className={styles.checkItem}>
                        <input
                            type="checkbox"
                            checked={allSelected}
                            onChange={toggleAll}
                            className={styles.checkbox}
                        />
                        <span className={styles.checkLabel}>Seleccionar todo</span>
                    </label>

                    <div className={styles.divider} />

                    {/* Lista de valores */}
                    <div className={styles.list}>
                        {filteredValues.length === 0 ? (
                            <p className={styles.noResults}>Sin resultados</p>
                        ) : (
                            filteredValues.map((value) => (
                                <label key={value} className={styles.checkItem}>
                                    <input
                                        type="checkbox"
                                        checked={selectedValues.size === 0 || selectedValues.has(value)}
                                        onChange={() => toggleValue(value)}
                                        className={styles.checkbox}
                                    />
                                    <span className={styles.checkLabel}>{value}</span>
                                </label>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
