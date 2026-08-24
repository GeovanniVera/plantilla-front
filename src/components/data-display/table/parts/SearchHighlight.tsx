import { useState, useRef, useEffect } from 'react'
import { LuSearch, LuX } from 'react-icons/lu'

interface SearchHighlightProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    resultCount?: number
}

/* Focus state resolved as single effective border set from the
 * isFocused state (replaces the legacy inline template). */
const WRAP_CLASSES = 'relative flex items-center w-[280px]'

const SEARCH_ICON_CLASSES = (isFocused: boolean) =>
    `absolute left-2.5 text-foreground pointer-events-none transition-opacity duration-150 ${isFocused ? 'opacity-60' : 'opacity-40'}`

function inputClasses(isFocused: boolean) {
    return `w-full py-1.5 px-8 rounded-md bg-surface text-foreground text-xs font-sans outline-none box-border transition-colors duration-150 border ${
        isFocused ? 'border-accent' : 'border-border-base'
    }`
}

const CLEAR_BTN_CLASSES =
    'absolute right-1.5 flex items-center justify-center size-5 rounded-[4px] border-none bg-transparent text-foreground cursor-pointer opacity-40 transition-opacity duration-150 hover:opacity-100 hover:bg-accent-subtle'

const COUNT_BADGE_CLASSES =
    'absolute text-[10px] font-semibold pointer-events-none text-accent'

const COUNT_BADGE_EMPTY_CLASSES =
    'absolute text-[10px] font-semibold pointer-events-none text-danger-strong'

const KBD_HINT_CLASSES =
    'absolute right-2 px-[5px] py-px rounded-[4px] border border-border-base bg-background text-[10px] text-foreground opacity-40 font-mono pointer-events-none'

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
        <div className={WRAP_CLASSES}>
            <LuSearch size={14} className={SEARCH_ICON_CLASSES(isFocused)} />
            <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={placeholder}
                className={inputClasses(isFocused)}
            />

            {/* Clear button */}
            {value && (
                <button onClick={() => onChange('')} className={CLEAR_BTN_CLASSES}>
                    <LuX size={12} />
                </button>
            )}

            {/* Result count badge */}
            {value && resultCount !== undefined && (
                <span className={`${value ? 'right-7' : 'right-2'} ${resultCount > 0 ? COUNT_BADGE_CLASSES : COUNT_BADGE_EMPTY_CLASSES}`}>
                    {resultCount}
                </span>
            )}

            {/* Keyboard shortcut hint */}
            {!value && !isFocused && (
                <span className={KBD_HINT_CLASSES}>
                    ⌘K
                </span>
            )}
        </div>
    )
}
