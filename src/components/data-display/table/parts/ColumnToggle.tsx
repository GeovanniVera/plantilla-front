import { useState, useRef, useEffect } from 'react'
import { LuColumns3, LuCheck } from 'react-icons/lu'

interface ColumnToggleProps {
    columns: { key: string; header: string; visible: boolean }[]
    onToggle: (key: string) => void
    onShowAll: () => void
}

const WRAP_CLASSES = 'relative inline-flex'

const TRIGGER_CLASSES =
    'flex items-center gap-[5px] px-2.5 py-[5px] rounded-md border border-border-base bg-background text-foreground text-xs font-sans cursor-pointer transition-colors duration-150 hover:border-accent-line'

const HIDDEN_COUNT_CLASSES = 'px-[5px] rounded-[4px] bg-accent text-white text-[10px] font-semibold leading-4'

const POPOVER_CLASSES =
    'absolute top-[calc(100%+6px)] right-0 z-[200] w-[200px] bg-background border border-border-base rounded-[10px] shadow-[0_4px_12px_rgba(0,0,0,0.1)] overflow-hidden'

const POPOVER_HEADER_CLASSES = 'flex items-center justify-between px-3 py-2 border-b border-border-base'
const POPOVER_TITLE_CLASSES = 'text-xs font-semibold text-heading'
const SHOW_ALL_BTN_CLASSES = 'px-1.5 py-0.5 rounded-sm border-none bg-transparent text-accent text-[11px] font-sans cursor-pointer'

const LIST_CLASSES = 'py-1 max-h-60 overflow-y-auto'
const ITEM_CLASSES = 'flex items-center gap-2 px-3 py-1.5 cursor-pointer transition-colors duration-100 hover:bg-accent-subtle'

function checkboxClasses(visible: boolean) {
    return `size-4 rounded-[4px] flex items-center justify-center shrink-0 transition-colors duration-150 border-[1.5px] ${
        visible ? 'border-accent bg-accent' : 'border-border-base bg-transparent'
    }`
}

const ITEM_LABEL_CLASSES = (visible: boolean) => `text-xs ${visible ? 'text-foreground' : 'text-foreground/50'}`

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
        <div className={WRAP_CLASSES}>
            <button ref={buttonRef} className={TRIGGER_CLASSES} onClick={() => setIsOpen((p) => !p)}>
                <LuColumns3 size={14} />
                Columnas
                {hiddenCount > 0 && (
                    <span className={HIDDEN_COUNT_CLASSES}>
                        {hiddenCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div ref={popoverRef} className={POPOVER_CLASSES}>
                    <div className={POPOVER_HEADER_CLASSES}>
                        <span className={POPOVER_TITLE_CLASSES}>
                            Columnas visibles
                        </span>
                        <button
                            onClick={() => { onShowAll(); setIsOpen(false) }}
                            className={SHOW_ALL_BTN_CLASSES}
                        >
                            Mostrar todo
                        </button>
                    </div>

                    <div className={LIST_CLASSES}>
                        {columns.map((col) => (
                            <label
                                key={col.key}
                                onClick={() => onToggle(col.key)}
                                className={ITEM_CLASSES}
                            >
                                <div className={checkboxClasses(col.visible)}>
                                    {col.visible && <LuCheck size={10} color="#fff" />}
                                </div>
                                <span className={ITEM_LABEL_CLASSES(col.visible)}>
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
