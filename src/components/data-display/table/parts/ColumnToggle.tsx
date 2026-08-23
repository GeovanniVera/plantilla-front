import { useState, useRef, useEffect } from 'react'
import { LuColumns3, LuCheck } from 'react-icons/lu'

interface ColumnToggleProps {
    columns: { key: string; header: string; visible: boolean }[]
    onToggle: (key: string) => void
    onShowAll: () => void
}

export function ColumnToggle({ columns, onToggle, onShowAll }: ColumnToggleProps) {
    const [isOpen, setIsOpen] = useState(false)
    const popoverRef = useRef<HTMLDivElement>(null)
    const buttonRef = useRef<HTMLButtonElement>(null)

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

    const hiddenCount = columns.filter((c) => !c.visible).length

    return (
        <div style={{ position: 'relative', display: 'inline-flex' }}>
            <button
                ref={buttonRef}
                onClick={() => setIsOpen((p) => !p)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '5px 10px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    background: 'var(--bg)',
                    color: 'var(--text)',
                    fontSize: '12px',
                    fontFamily: 'var(--sans)',
                    cursor: 'pointer',
                    transition: 'border-color 0.12s',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-border)'
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)'
                }}
            >
                <LuColumns3 size={14} />
                Columnas
                {hiddenCount > 0 && (
                    <span style={{
                        padding: '0 5px',
                        borderRadius: '4px',
                        background: 'var(--accent)',
                        color: '#fff',
                        fontSize: '10px',
                        fontWeight: 600,
                    }}>
                        {hiddenCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div
                    ref={popoverRef}
                    style={{
                        position: 'absolute',
                        top: 'calc(100% + 6px)',
                        right: 0,
                        zIndex: 200,
                        width: '200px',
                        background: 'var(--bg)',
                        border: '1px solid var(--border)',
                        borderRadius: '10px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        overflow: 'hidden',
                    }}
                >
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        borderBottom: '1px solid var(--border)',
                    }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-h)' }}>
                            Columnas visibles
                        </span>
                        <button
                            onClick={() => { onShowAll(); setIsOpen(false) }}
                            style={{
                                padding: '2px 6px',
                                borderRadius: '4px',
                                border: 'none',
                                background: 'transparent',
                                color: 'var(--accent)',
                                fontSize: '11px',
                                fontFamily: 'var(--sans)',
                                cursor: 'pointer',
                            }}
                        >
                            Mostrar todo
                        </button>
                    </div>

                    <div style={{ padding: '4px 0', maxHeight: '240px', overflowY: 'auto' }}>
                        {columns.map((col) => (
                            <label
                                key={col.key}
                                onClick={() => onToggle(col.key)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '6px 12px',
                                    cursor: 'pointer',
                                    transition: 'background 0.1s',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'var(--accent-bg)'
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'transparent'
                                }}
                            >
                                <div style={{
                                    width: '16px',
                                    height: '16px',
                                    borderRadius: '4px',
                                    border: `1.5px solid ${col.visible ? 'var(--accent)' : 'var(--border)'}`,
                                    background: col.visible ? 'var(--accent)' : 'transparent',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    transition: 'background 0.12s, border-color 0.12s',
                                }}>
                                    {col.visible && <LuCheck size={10} color="#fff" />}
                                </div>
                                <span style={{
                                    fontSize: '12px',
                                    color: 'var(--text)',
                                    opacity: col.visible ? 1 : 0.5,
                                }}>
                                    {col.header}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
