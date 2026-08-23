import { useState, useRef, useEffect } from 'react'
import { LuSearch, LuX } from 'react-icons/lu'

interface SearchHighlightProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    resultCount?: number
}

export function SearchHighlight({
    value,
    onChange,
    placeholder = 'Buscar en la tabla...',
    resultCount,
}: SearchHighlightProps) {
    const inputRef = useRef<HTMLInputElement>(null)
    const [isFocused, setIsFocused] = useState(false)

    // Atajo de teclado: Ctrl+K o Cmd+K
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault()
                inputRef.current?.focus()
            }
        }
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [])

    return (
        <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            width: '280px',
        }}>
            <LuSearch
                size={14}
                style={{
                    position: 'absolute',
                    left: '10px',
                    color: 'var(--text)',
                    opacity: isFocused ? 0.6 : 0.4,
                    transition: 'opacity 0.12s',
                    pointerEvents: 'none',
                }}
            />
            <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={placeholder}
                style={{
                    width: '100%',
                    padding: '6px 32px 6px 32px',
                    borderRadius: '8px',
                    border: `1px solid ${isFocused ? 'var(--accent)' : 'var(--border)'}`,
                    background: 'var(--code-bg)',
                    color: 'var(--text)',
                    fontSize: '12px',
                    fontFamily: 'var(--sans)',
                    outline: 'none',
                    transition: 'border-color 0.12s',
                    boxSizing: 'border-box',
                }}
            />

            {/* Clear button */}
            {value && (
                <button
                    onClick={() => onChange('')}
                    style={{
                        position: 'absolute',
                        right: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '20px',
                        height: '20px',
                        borderRadius: '4px',
                        border: 'none',
                        background: 'transparent',
                        color: 'var(--text)',
                        cursor: 'pointer',
                        opacity: 0.4,
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '1'
                        e.currentTarget.style.background = 'var(--accent-bg)'
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '0.4'
                        e.currentTarget.style.background = 'transparent'
                    }}
                >
                    <LuX size={12} />
                </button>
            )}

            {/* Result count badge */}
            {value && resultCount !== undefined && (
                <span style={{
                    position: 'absolute',
                    right: value ? '28px' : '8px',
                    fontSize: '10px',
                    fontWeight: 600,
                    color: resultCount > 0 ? 'var(--accent)' : '#dc2626',
                    pointerEvents: 'none',
                }}>
                    {resultCount}
                </span>
            )}

            {/* Keyboard shortcut hint */}
            {!value && !isFocused && (
                <span style={{
                    position: 'absolute',
                    right: '8px',
                    padding: '1px 5px',
                    borderRadius: '4px',
                    border: '1px solid var(--border)',
                    background: 'var(--bg)',
                    fontSize: '10px',
                    color: 'var(--text)',
                    opacity: 0.4,
                    fontFamily: 'var(--mono)',
                    pointerEvents: 'none',
                }}>
                    ⌘K
                </span>
            )}
        </div>
    )
}
