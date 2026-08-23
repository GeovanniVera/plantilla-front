import { useState } from 'react'
import { LuGripVertical, LuSettings2, LuTrash2, LuPlus } from 'react-icons/lu'
import styles from './FieldCard.module.css'
import type { FieldConfig, FieldType } from '../types'

// ─── Field Type Icons Map ─────────────────────────────────
const FIELD_TYPE_LABELS: Record<FieldType, string> = {
    text: 'TXT',
    email: 'EML',
    password: 'PWD',
    number: 'NUM',
    tel: 'TEL',
    textarea: 'TXT',
    select: 'SEL',
    checkbox: 'CHK',
    radio: 'RAD',
}

// ─── Drag Data (serialized via dataTransfer) ──────────────
export interface DragData {
    sectionIndex: number
    rowIndex: number
    fieldIndex: number
}

// ─── Single Field Card ────────────────────────────────────
interface FieldCardProps {
    field: FieldConfig
    dragData: DragData
    onEdit: () => void
    onRemove: () => void
    onDragStart: (data: DragData) => void
    onDragEnd: () => void
}

export function FieldCard({ field, dragData, onEdit, onRemove, onDragStart, onDragEnd }: FieldCardProps) {
    const [isDragging, setIsDragging] = useState(false)

    const handleDragStart = (e: React.DragEvent) => {
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('application/json', JSON.stringify(dragData))
        setIsDragging(true)
        onDragStart(dragData)
    }

    const handleDragEnd = () => {
        setIsDragging(false)
        onDragEnd()
    }

    return (
        <div
            className={`${styles.card} ${isDragging ? styles.cardDragging : ''}`}
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className={styles.dragHandle} title="Arrastrar">
                <LuGripVertical size={14} />
            </div>
            <span className={styles.typeBadge}>
                {FIELD_TYPE_LABELS[field.type] ?? field.type}
            </span>
            <span className={styles.label}>{field.label}</span>
            {field.required && <span className={styles.requiredDot} title="Requerido" />}
            <div className={styles.actions}>
                <button className={styles.actionBtn} onClick={onEdit} title="Configurar campo">
                    <LuSettings2 size={14} />
                </button>
                <button className={`${styles.actionBtn} ${styles.actionBtnDanger}`} onClick={onRemove} title="Eliminar campo">
                    <LuTrash2 size={14} />
                </button>
            </div>
        </div>
    )
}

// ─── Empty Slot (add field button) ────────────────────────
interface EmptySlotProps {
    onAdd: () => void
    onDrop?: (e: React.DragEvent) => void
    onDragOver?: (e: React.DragEvent) => void
    isDropTarget?: boolean
}

export function EmptySlot({ onAdd, onDrop, onDragOver, isDropTarget }: EmptySlotProps) {
    return (
        <button
            className={`${styles.emptySlot} ${isDropTarget ? styles.emptySlotActive : ''}`}
            onClick={onAdd}
            onDrop={onDrop}
            onDragOver={onDragOver}
        >
            <LuPlus size={14} /> Agregar
        </button>
    )
}

// ─── Row Block (header + fields vertical list) ────────────
interface RowBlockProps {
    sectionIndex: number
    rowIndex: number
    columns: 1 | 2 | 3
    fields: FieldConfig[]
    activeDrag: DragData | null
    onColumnsChange: (cols: 1 | 2 | 3) => void
    onRemoveRow: () => void
    onAddField: () => void
    onEditField: (fieldIndex: number) => void
    onRemoveField: (fieldIndex: number) => void
    onFieldDragStart: (data: DragData) => void
    onFieldDragEnd: () => void
    onFieldDrop: (source: DragData, target: DragData) => void
}

export function RowBlock({
    sectionIndex,
    rowIndex,
    columns,
    fields,
    activeDrag,
    onColumnsChange,
    onRemoveRow,
    onAddField,
    onEditField,
    onRemoveField,
    onFieldDragStart,
    onFieldDragEnd,
    onFieldDrop,
}: RowBlockProps) {
    const [dropIndex, setDropIndex] = useState<number | null>(null)

    const handleDragOver = (e: React.DragEvent, targetIdx: number) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
        setDropIndex(targetIdx)
    }

    const handleDrop = (e: React.DragEvent, targetIdx: number) => {
        e.preventDefault()
        setDropIndex(null)
        try {
            const raw = e.dataTransfer.getData('application/json')
            if (!raw) return
            const source: DragData = JSON.parse(raw)
            onFieldDrop(source, {
                sectionIndex,
                rowIndex,
                fieldIndex: targetIdx,
            })
        } catch { /* ignore invalid data */ }
    }

    const handleDragLeave = () => {
        setDropIndex(null)
    }

    return (
        <div>
            <div className={styles.rowHeader}>
                <span className={styles.rowLabel}>
                    Fila · {columns} col · {fields.length}/{columns}
                </span>
                <div className={styles.rowControls}>
                    {([1, 2, 3] as const).map((n) => (
                        <button
                            key={n}
                            className={`${styles.colBtn} ${columns === n ? styles.colBtnActive : ''}`}
                            onClick={() => onColumnsChange(n)}
                        >
                            {n}
                        </button>
                    ))}
                    <button
                        className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                        onClick={onRemoveRow}
                        title="Eliminar fila"
                    >
                        <LuTrash2 size={12} />
                    </button>
                </div>
            </div>
            <div
                className={styles.rowBody}
                onDragLeave={handleDragLeave}
            >
                {Array.from({ length: columns }).map((_, colIdx) => {
                    const field = fields[colIdx]
                    if (!field) {
                        // Empty slot — can accept drops here too
                        const isTarget = !!(activeDrag && dropIndex === colIdx)
                        return (
                            <EmptySlot
                                key={colIdx}
                                onAdd={onAddField}
                                isDropTarget={isTarget}
                                onDragOver={(e) => handleDragOver(e, colIdx)}
                                onDrop={(e) => handleDrop(e, colIdx)}
                            />
                        )
                    }
                    const isSource = activeDrag
                        && activeDrag.sectionIndex === sectionIndex
                        && activeDrag.rowIndex === rowIndex
                        && activeDrag.fieldIndex === colIdx
                    const showDropBefore = dropIndex === colIdx && !isSource

                    return (
                        <div key={colIdx} onDragOver={(e) => handleDragOver(e, colIdx)} onDrop={(e) => handleDrop(e, colIdx)}>
                            {showDropBefore && <div className={styles.dropIndicator} />}
                            <FieldCard
                                field={field}
                                dragData={{ sectionIndex, rowIndex, fieldIndex: colIdx }}
                                onEdit={() => onEditField(colIdx)}
                                onRemove={() => onRemoveField(colIdx)}
                                onDragStart={onFieldDragStart}
                                onDragEnd={onFieldDragEnd}
                            />
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
