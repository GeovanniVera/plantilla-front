import { useEffect, useRef } from 'react'
import styles from '../ExcelTable.module.css'

// ─── Select Editor ──────────────────────────────────
interface SelectEditorProps {
    value: string
    options: string[]
    onChange: (value: string) => void
    onCommit: () => void
    onCancel: () => void
}

export function SelectEditor({
    value,
    options,
    onChange,
    onCommit,
    onCancel,
}: SelectEditorProps) {
    const selectRef = useRef<HTMLSelectElement>(null)

    useEffect(() => {
        selectRef.current?.focus()
    }, [])

    return (
        <select
            ref={selectRef}
            className={styles.selectEditor}
            value={value}
            onChange={(e) => {
                onChange(e.target.value)
                onCommit()
            }}
            onBlur={onCancel}
            onKeyDown={(e) => {
                if (e.key === 'Escape') onCancel()
                if (e.key === 'Enter') onCommit()
            }}
        >
            {options.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
            ))}
        </select>
    )
}

// ─── Boolean Editor ─────────────────────────────────
interface BooleanEditorProps {
    value: string
    onChange: (value: string) => void
    onCommit: () => void
    onCancel: () => void
}

export function BooleanEditor({
    value,
    onChange,
    onCommit,
    onCancel,
}: BooleanEditorProps) {
    const isActive = value === 'true'
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        containerRef.current?.focus()
    }, [])

    const toggle = () => {
        const next = isActive ? 'false' : 'true'
        onChange(next)
        onCommit()
    }

    return (
        <div
            ref={containerRef}
            className={styles.booleanEditor}
            tabIndex={0}
            onBlur={onCancel}
            onKeyDown={(e) => {
                if (e.key === 'Escape') onCancel()
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    toggle()
                }
            }}
            onClick={toggle}
        >
            <div className={`${styles.toggleTrack} ${isActive ? styles.toggleOn : ''}`}>
                <div className={styles.toggleThumb} />
            </div>
            <span className={styles.toggleLabel}>{isActive ? 'Sí' : 'No'}</span>
        </div>
    )
}
