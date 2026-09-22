import { useEffect, useRef } from 'react';

// ─── Styling ──────────────────────────────────────────────
/* The select arrow is a data-URI asset — kept as an inline style instead
 * of an unreadable arbitrary utility. Editor rules were removed from
 * ExcelTable.module.css in 6G.3 (sole consumer was this file). */
const SELECT_ARROW_STYLE: React.CSSProperties = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%236b7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 8px center',
};

const SELECT_EDITOR_CLASSES =
  'w-full h-full min-h-8 py-1 px-2 pr-6 border-none bg-background text-foreground text-[13px] outline-none box-border cursor-pointer appearance-none focus:bg-accent-subtle';

const BOOLEAN_EDITOR_CLASSES =
  'flex items-center gap-2 px-3 h-full min-h-8 cursor-pointer outline-none focus:bg-accent-subtle';

const TOGGLE_TRACK_BASE_CLASSES =
  'relative w-8 h-[18px] rounded-full bg-border-base transition-colors duration-150 ease-in-out shrink-0';
const TOGGLE_TRACK_ON_CLASSES = 'bg-accent';

const TOGGLE_THUMB_BASE_CLASSES =
  'absolute top-0.5 left-0.5 size-3.5 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.15)] transition-transform duration-150 ease-in-out';
const TOGGLE_THUMB_ON_CLASSES = 'translate-x-3.5';

const TOGGLE_LABEL_CLASSES = 'text-xs font-medium text-foreground select-none';

// ─── Select Editor ──────────────────────────────────
interface SelectEditorProps {
  value: string;
  options: string[];
  onChange: (value: string) => void;
  onCommit: () => void;
  onCancel: () => void;
  /** Accessible name for the select; usually the column header being edited. */
  'aria-label'?: string;
}

export function SelectEditor({
  value,
  options,
  onChange,
  onCommit,
  onCancel,
  'aria-label': ariaLabel,
}: SelectEditorProps) {
  const selectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    selectRef.current?.focus();
  }, []);

  return (
    <select
      ref={selectRef}
      aria-label={ariaLabel}
      className={SELECT_EDITOR_CLASSES}
      style={SELECT_ARROW_STYLE}
      value={value}
      onChange={(e) => {
        onChange(e.target.value);
        onCommit();
      }}
      onBlur={onCancel}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onCancel();
        if (e.key === 'Enter') onCommit();
      }}
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}

// ─── Boolean Editor ─────────────────────────────────
interface BooleanEditorProps {
  value: string;
  onChange: (value: string) => void;
  onCommit: () => void;
  onCancel: () => void;
  /** Accessible name for the switch; usually the column header being edited. */
  'aria-label'?: string;
}

export function BooleanEditor({
  value,
  onChange,
  onCommit,
  onCancel,
  'aria-label': ariaLabel,
}: BooleanEditorProps) {
  const isActive = value === 'true';
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  const toggle = () => {
    const next = isActive ? 'false' : 'true';
    onChange(next);
    onCommit();
  };

  return (
    <div
      ref={containerRef}
      role="switch"
      aria-checked={isActive}
      aria-label={ariaLabel}
      className={BOOLEAN_EDITOR_CLASSES}
      tabIndex={0}
      onBlur={onCancel}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onCancel();
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggle();
        }
      }}
      onClick={toggle}
    >
      <div className={`${TOGGLE_TRACK_BASE_CLASSES} ${isActive ? TOGGLE_TRACK_ON_CLASSES : ''}`}>
        <div
          className={`${TOGGLE_THUMB_BASE_CLASSES} ${isActive ? TOGGLE_THUMB_ON_CLASSES : ''}`}
        />
      </div>
      <span className={TOGGLE_LABEL_CLASSES}>{isActive ? 'Sí' : 'No'}</span>
    </div>
  );
}
