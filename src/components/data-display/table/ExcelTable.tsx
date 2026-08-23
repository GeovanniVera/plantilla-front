import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import type { ExcelTableProps, CellPosition } from './excel-types'
import type { Column } from './types'
import { useTableFilters } from './hooks/useTableFilters'
import { useTablePagination } from './hooks/useTablePagination'
import FilterDropdown from './parts/FilterDropdown'
import { FilterBar } from './parts/FilterBar'
import Pagination from './parts/Pagination'
import { SelectEditor, BooleanEditor } from './parts/CellEditors'
import styles from './ExcelTable.module.css'
import composeStyles from './DataTable.module.css'
import tableStyles from './Table.module.css'

/** Mapping de nombres de clase a CSS module classes */
const ROW_CLASS_MAP: Record<string, string> = {
    rowDanger: tableStyles.rowDanger,
    rowWarning: tableStyles.rowWarning,
    rowSuccess: tableStyles.rowSuccess,
    rowInfo: tableStyles.rowInfo,
}

export default function ExcelTable<T extends object>({
    columns,
    data,
    keyExtractor,
    onDataChange,
    readOnly = false,
    filters: enableFilters = false,
    pagination: enablePagination = false,
    pageSize: initialPageSize = 10,
    rowClassName,
    rowStyle,
}: ExcelTableProps<T>) {
    // ─── Edit state ───────────────────────────────────
    const [selected, setSelected] = useState<CellPosition | null>(null)
    const [editing, setEditing] = useState<CellPosition | null>(null)
    const [editValue, setEditValue] = useState('')

    const inputRef = useRef<HTMLInputElement>(null)
    const tableRef = useRef<HTMLTableElement>(null)

    // ─── Composable: filters + pagination ─────────────
    const {
        filteredData,
        filterHeaderProps,
        clearAllFilters,
        hasActiveFilters,
    } = useTableFilters<T>(
        enableFilters ? columns : [],
        enableFilters ? data : [],
    )

    // Datos a mostrar: filtrados si hay filtros, originales si no
    const baseData = enableFilters ? filteredData : data

    const pagination = useTablePagination(baseData.length, initialPageSize)

    const displayData = enablePagination
        ? baseData.slice(pagination.startIndex, pagination.endIndex)
        : baseData

    // Columnas con filtro inyectado
    const composedColumns: Column<T>[] = useMemo(() => {
        if (!enableFilters) return columns

        return columns.map((col) => ({
            ...col,
            renderHeader: () => {
                const fProps = filterHeaderProps[col.key]
                if (!fProps) return col.header
                return (
                    <div className={composeStyles.filterHeader}>
                        <span>{col.header}</span>
                        <FilterDropdown
                            header={col.header}
                            filterType={fProps.filterType}
                            uniqueValues={fProps.uniqueValues}
                            selectedValues={fProps.selectedValues}
                            numericRange={fProps.numericRange}
                            hasFilter={fProps.hasFilter}
                            onChange={fProps.onFilterChange}
                            onNumericChange={fProps.onNumericChange}
                            onClear={fProps.onFilterClear}
                        />
                    </div>
                )
            },
        }))
    }, [columns, enableFilters, filterHeaderProps])

    // ─── Edit logic ───────────────────────────────────
    useEffect(() => {
        if (editing && inputRef.current) {
            inputRef.current.focus()
            inputRef.current.select()
        }
    }, [editing])

    const getCellValue = useCallback((row: T, key: string): string => {
        return String((row as Record<string, unknown>)[key] ?? '')
    }, [])

    const handleCellClick = useCallback((row: number, col: number) => {
        if (readOnly) return
        setSelected({ row, col })
    }, [readOnly])

    const handleCellDoubleClick = useCallback((row: number, col: number, value: string) => {
        if (readOnly) return
        setEditing({ row, col })
        setEditValue(value)
    }, [readOnly])

    const commitEdit = useCallback(() => {
        if (editing && displayData[editing.row]) {
            const colKey = composedColumns[editing.col]?.key
            if (colKey) {
                onDataChange?.(editing.row, colKey, editValue)
            }
        }
        setEditing(null)
    }, [editing, editValue, composedColumns, displayData, onDataChange])

    const cancelEdit = useCallback(() => {
        setEditing(null)
        setEditValue('')
    }, [])

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (!selected) return

        const { row, col } = selected

        switch (e.key) {
            case 'Enter':
                e.preventDefault()
                if (editing) {
                    commitEdit()
                } else if (!readOnly) {
                    handleCellDoubleClick(row, col, getCellValue(displayData[row], composedColumns[col].key))
                }
                break

            case 'Escape':
                cancelEdit()
                break

            case 'Tab':
                e.preventDefault()
                if (editing) commitEdit()
                if (e.shiftKey) {
                    if (col > 0) setSelected({ row, col: col - 1 })
                    else if (row > 0) setSelected({ row: row - 1, col: composedColumns.length - 1 })
                } else {
                    if (col < composedColumns.length - 1) setSelected({ row, col: col + 1 })
                    else if (row < displayData.length - 1) setSelected({ row: row + 1, col: 0 })
                }
                break

            case 'ArrowUp':
                e.preventDefault()
                if (editing) commitEdit()
                if (row > 0) setSelected({ row: row - 1, col })
                break

            case 'ArrowDown':
                e.preventDefault()
                if (editing) commitEdit()
                if (row < displayData.length - 1) setSelected({ row: row + 1, col })
                break

            case 'ArrowLeft':
                if (!editing && col > 0) {
                    e.preventDefault()
                    setSelected({ row, col: col - 1 })
                }
                break

            case 'ArrowRight':
                if (!editing && col < composedColumns.length - 1) {
                    e.preventDefault()
                    setSelected({ row, col: col + 1 })
                }
                break
        }
    }, [selected, editing, displayData, composedColumns, readOnly, commitEdit, cancelEdit, handleCellDoubleClick, getCellValue])

    // ─── Render ───────────────────────────────────────
    return (
        <div className={composeStyles.container}>
            <FilterBar
                hasActiveFilters={enableFilters && hasActiveFilters}
                onClearAll={clearAllFilters}
            />

            <div className={styles.wrapper} onKeyDown={handleKeyDown} tabIndex={0} role="grid" aria-label="Tabla de datos">
                <table ref={tableRef} className={styles.table}>
                    <thead>
                        <tr>
                            <th className={styles.rowHeader}></th>
                            {composedColumns.map((col) => (
                                <th
                                    key={col.key}
                                    className={styles.th}
                                    style={{
                                        minWidth: col.minWidth,
                                        width: col.width,
                                    }}
                                >
                                    {col.renderHeader ? col.renderHeader() : col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {displayData.length === 0 ? (
                            <tr>
                                <td colSpan={composedColumns.length + 1} className={styles.td}>
                                    <div className={styles.empty}>
                                        <div className={styles.emptyIcon}>∅</div>
                                        <p className={styles.emptyTitle}>Sin datos</p>
                                        <p className={styles.emptyDesc}>No hay registros para mostrar.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : displayData.map((row, rowIndex) => {
                            const rawClass = rowClassName?.(row, rowIndex)
                            const conditionalClass = rawClass ? ROW_CLASS_MAP[rawClass] ?? rawClass : undefined
                            const conditionalStyle = rowStyle?.(row, rowIndex)

                            return (
                                <tr
                                    key={keyExtractor(row, rowIndex)}
                                    className={conditionalClass}
                                    style={conditionalStyle}
                                >
                                    <td className={styles.rowHeader}>{rowIndex + 1}</td>
                                    {composedColumns.map((col, colIndex) => {
                                        const isSelected = selected?.row === rowIndex && selected?.col === colIndex
                                        const isEditing = editing?.row === rowIndex && editing?.col === colIndex
                                        const value = getCellValue(row, col.key)

                                        return (
                                            <td
                                                key={col.key}
                                                className={[
                                                    styles.td,
                                                    isSelected && !isEditing ? styles.selected : '',
                                                    isEditing ? styles.editing : '',
                                                ].filter(Boolean).join(' ')}
                                                style={{ textAlign: col.align ?? 'left' }}
                                                role="gridcell"
                                                tabIndex={isSelected ? 0 : -1}
                                                aria-selected={isSelected}
                                                onClick={() => handleCellClick(rowIndex, colIndex)}
                                                onDoubleClick={() => handleCellDoubleClick(rowIndex, colIndex, value)}
                                            >
                                                {isEditing ? (
                                                    col.filterType === 'select' && col.filterOptions ? (
                                                        <SelectEditor
                                                            value={value}
                                                            options={col.filterOptions}
                                                            onChange={setEditValue}
                                                            onCommit={commitEdit}
                                                            onCancel={cancelEdit}
                                                        />
                                                    ) : col.filterType === 'boolean' ? (
                                                        <BooleanEditor
                                                            value={value}
                                                            onChange={setEditValue}
                                                            onCommit={commitEdit}
                                                            onCancel={cancelEdit}
                                                        />
                                                    ) : (
                                                        <input
                                                            ref={inputRef}
                                                            type="text"
                                                            className={styles.input}
                                                            value={editValue}
                                                            onChange={(e) => setEditValue(e.target.value)}
                                                            onBlur={commitEdit}
                                                        />
                                                    )
                                                ) : (
                                                    <span className={styles.cellContent}>
                                                        {col.render
                                                            ? col.render(value, row, rowIndex)
                                                            : value}
                                                    </span>
                                                )}
                                            </td>
                                        )
                                    })}
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            {enablePagination && (
                <Pagination
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    totalItems={pagination.totalItems}
                    pageSize={pagination.pageSize}
                    onPageChange={pagination.goToPage}
                    onPageSizeChange={pagination.setPageSize}
                />
            )}
        </div>
    )
}
