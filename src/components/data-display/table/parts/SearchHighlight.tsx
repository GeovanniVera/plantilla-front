import { useState, useRef, useEffect } from 'react';
import { LuSearch, LuX } from 'react-icons/lu';
import Input from '@components/primitives/Input';

interface SearchHighlightProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  resultCount?: number;
}

const SEARCH_ICON_CLASSES = (isFocused: boolean) =>
  `text-foreground transition-opacity duration-150 ${isFocused ? 'opacity-60' : 'opacity-40'}`;

const CLEAR_BTN_CLASSES =
  'flex items-center justify-center size-5 rounded-[4px] border-none bg-transparent text-foreground cursor-pointer opacity-40 transition-opacity duration-150 hover:opacity-100 hover:bg-accent-subtle';

const COUNT_BADGE_CLASSES = 'text-[10px] font-semibold text-accent';

const COUNT_BADGE_EMPTY_CLASSES = 'text-[10px] font-semibold text-danger-strong';

const KBD_HINT_CLASSES =
  'px-[5px] py-px rounded-[4px] border border-border-base bg-background text-[10px] text-foreground opacity-40 font-mono';

export function SearchHighlight({
  value,
  onChange,
  placeholder = 'Buscar en la tabla...',
  resultCount,
}: SearchHighlightProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Keep the native input ref so the global shortcut can move focus.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <Input.Root size="sm" className="bg-surface w-[280px]">
      <Input.StartAddon>
        <LuSearch size={14} className={SEARCH_ICON_CLASSES(isFocused)} />
      </Input.StartAddon>
      <Input.Control
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        aria-label="Search table"
      />

      {value && resultCount !== undefined && (
        <Input.EndAdornment
          decorative={false}
          role="status"
          aria-live="polite"
          aria-label={`${resultCount} search results`}
        >
          <span className={resultCount > 0 ? COUNT_BADGE_CLASSES : COUNT_BADGE_EMPTY_CLASSES}>
            {resultCount}
          </span>
        </Input.EndAdornment>
      )}

      {value && (
        <Input.EndAction>
          <button
            type="button"
            onClick={() => onChange('')}
            className={CLEAR_BTN_CLASSES}
            aria-label="Clear table search"
          >
            <LuX size={12} />
          </button>
        </Input.EndAction>
      )}

      {!value && !isFocused && (
        <Input.EndAdornment>
          <kbd className={KBD_HINT_CLASSES}>⌘K</kbd>
        </Input.EndAdornment>
      )}
    </Input.Root>
  );
}
