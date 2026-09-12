import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { LuChevronLeft, LuChevronRight, LuCalendarDays } from 'react-icons/lu';
import 'react-day-picker/src/style.css';
import styles from './Calendar.module.css';

const ChevronIcon = (props: { orientation?: string }) =>
  props.orientation === 'left' ? <LuChevronLeft size={14} /> : <LuChevronRight size={14} />;

// ─── Styling ──────────────────────────────────────────────
/* The wrapper keeps the residual `calendar` module class: it scopes the
 * --rdp-* bridge variables and the react-day-picker internal overrides
 * living in Calendar.module.css (third-party contract — deliberately
 * NOT moved to Tailwind, phase 6G.1). */
const CALENDAR_WRAPPER_CLASS = styles.calendar;

/* DatePicker trigger/popover: the popover PORTALS to document.body with
 * position:fixed so Cards (overflow-hidden) can no longer clip it
 * (phase 7A diagnosis / 7B fix). Size and value/placeholder resolve to
 * single effective class sets. */
const PICKER_WRAP_CLASSES = 'relative inline-flex';

const PICKER_INPUT_BASE_CLASSES =
  'flex items-center justify-between gap-2 border border-border-base rounded-md bg-background text-foreground text-[13px] font-sans cursor-pointer transition-colors duration-150 hover:border-accent-line focus:outline-none focus:border-accent';

const PICKER_SIZE_CLASSES = {
  sm: 'min-w-[140px] px-2.5 py-1.5 text-xs',
  md: 'min-w-[180px] px-3 py-2',
} as const;

const VALUE_CLASSES = 'text-foreground';
const PLACEHOLDER_CLASSES = 'text-foreground opacity-40';
const ICON_CLASSES = 'text-sm opacity-50';

const POPOVER_CLASSES =
  'fixed z-[9999] bg-background border border-border-base rounded-lg shadow-[0_4px_6px_-1px_rgba(0,0,0,0.08),0_10px_20px_-2px_rgba(0,0,0,0.06)] p-3 animate-popover-in';

// ─── Shared picker-popover mechanics ──────────────────────
const VIEWPORT_MARGIN = 8;
const POPOVER_GAP = 6;
const ESTIMATED_POPOVER_SIZE = { width: 300, height: 360 };

interface PickerPosition {
  top: number;
  left: number;
}

/**
 * Internal mechanics shared by DatePicker and DateRangePicker:
 * open state, trigger/popover refs, fixed positioning anchored to the
 * trigger with vertical flip + horizontal viewport clamping, and
 * scroll/resize/outside-click/Escape handling while open.
 *
 * Clicks on the trigger itself are ignored by the outside handler so the
 * button's own onClick toggle never double-fires.
 */
function usePickerPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<PickerPosition | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return;

    const width = popoverRef.current?.offsetWidth ?? ESTIMATED_POPOVER_SIZE.width;
    const height = popoverRef.current?.offsetHeight ?? ESTIMATED_POPOVER_SIZE.height;

    // Vertical: prefer below; flip above when there is more room there.
    const spaceBelow = window.innerHeight - rect.bottom - POPOVER_GAP;
    const spaceAbove = rect.top - POPOVER_GAP;
    let top = rect.bottom + POPOVER_GAP;
    if (spaceBelow < Math.min(height, 320) && spaceAbove > spaceBelow) {
      top = Math.max(VIEWPORT_MARGIN, rect.top - height - POPOVER_GAP);
    }

    // Horizontal: keep inside the viewport.
    let left = rect.left;
    if (left + width > window.innerWidth - VIEWPORT_MARGIN) {
      left = window.innerWidth - width - VIEWPORT_MARGIN;
    }
    left = Math.max(VIEWPORT_MARGIN, left);

    setPosition({ top, left });
  }, []);

  const open = useCallback(() => {
    // Compute an estimated position synchronously (before first portal
    // paint); refined with real popover dimensions right after mount.
    updatePosition();
    requestAnimationFrame(updatePosition);
    setIsOpen(true);
  }, [updatePosition]);

  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => (isOpen ? close() : open()), [isOpen, open, close]);

  useEffect(() => {
    if (!isOpen) return;

    updatePosition();
    const handleUpdate = () => updatePosition();
    window.addEventListener('scroll', handleUpdate, true);
    window.addEventListener('resize', handleUpdate);

    // Outside click: ignore the trigger (its onClick owns the toggle)
    // and the popover itself.
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (popoverRef.current?.contains(target)) return;
      if (triggerRef.current?.contains(target)) return;
      setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener('scroll', handleUpdate, true);
      window.removeEventListener('resize', handleUpdate);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, updatePosition]);

  return { isOpen, open, close, toggle, position, triggerRef, popoverRef };
}

// ─── Calendar ───────────────────────────────────────
export interface CalendarProps {
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  minDate?: Date;
  maxDate?: Date;
}

export function Calendar({ selected, onSelect, minDate, maxDate }: CalendarProps) {
  const disabled = [];
  if (minDate) disabled.push({ before: minDate });
  if (maxDate) disabled.push({ after: maxDate });

  return (
    <div className={CALENDAR_WRAPPER_CLASS}>
      <DayPicker
        mode="single"
        selected={selected}
        onSelect={onSelect}
        locale={es}
        disabled={disabled}
        showOutsideDays
        fixedWeeks
        components={{ Chevron: ChevronIcon }}
      />
    </div>
  );
}

// ─── CalendarRange ──────────────────────────────────
export interface CalendarRangeProps {
  from?: Date;
  to?: Date;
  onSelect?: (range: { from: Date | undefined; to: Date | undefined }) => void;
  minDate?: Date;
  maxDate?: Date;
}

export function CalendarRange({ from, to, onSelect, minDate, maxDate }: CalendarRangeProps) {
  const disabled = [];
  if (minDate) disabled.push({ before: minDate });
  if (maxDate) disabled.push({ after: maxDate });

  return (
    <div className={CALENDAR_WRAPPER_CLASS}>
      <DayPicker
        mode="range"
        selected={{ from, to }}
        onSelect={(range) => {
          if (range) onSelect?.({ from: range.from, to: range.to });
          else onSelect?.({ from: undefined, to: undefined });
        }}
        locale={es}
        disabled={disabled}
        showOutsideDays
        fixedWeeks
        components={{ Chevron: ChevronIcon }}
      />
    </div>
  );
}

// ─── DatePicker (input + portaled popover) ──────────
export interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  size?: 'sm' | 'md';
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Seleccionar fecha',
  minDate,
  maxDate,
  size = 'md',
}: DatePickerProps) {
  const popover = usePickerPopover();

  return (
    <div className={PICKER_WRAP_CLASSES}>
      <button
        ref={popover.triggerRef}
        className={`${PICKER_INPUT_BASE_CLASSES} ${PICKER_SIZE_CLASSES[size]}`}
        onClick={popover.toggle}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={popover.isOpen}
      >
        <span className={value ? VALUE_CLASSES : PLACEHOLDER_CLASSES}>
          {value ? format(value, 'dd/MM/yyyy', { locale: es }) : placeholder}
        </span>
        <span className={ICON_CLASSES}>
          <LuCalendarDays size={16} />
        </span>
      </button>

      {popover.isOpen &&
        createPortal(
          <div
            ref={popover.popoverRef}
            className={POPOVER_CLASSES}
            style={{
              position: 'fixed',
              top: popover.position?.top ?? -9999,
              left: popover.position?.left ?? -9999,
              zIndex: 9999,
            }}
            role="dialog"
          >
            <Calendar
              selected={value}
              onSelect={(date) => {
                onChange?.(date);
                popover.close();
              }}
              minDate={minDate}
              maxDate={maxDate}
            />
          </div>,
          document.body,
        )}
    </div>
  );
}

// ─── DateRangePicker ────────────────────────────────
export interface DateRangePickerProps {
  from?: Date;
  to?: Date;
  onChange?: (range: { from: Date | undefined; to: Date | undefined }) => void;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
}

export function DateRangePicker({
  from,
  to,
  onChange,
  placeholder = 'Seleccionar rango',
  minDate,
  maxDate,
}: DateRangePickerProps) {
  const popover = usePickerPopover();
  const hasValue = !!from;
  const label =
    from && to
      ? `${format(from, 'dd/MM/yyyy')} — ${format(to, 'dd/MM/yyyy')}`
      : from
        ? `${format(from, 'dd/MM/yyyy')} — ...`
        : placeholder;

  return (
    <div className={PICKER_WRAP_CLASSES}>
      <button
        ref={popover.triggerRef}
        className={`${PICKER_INPUT_BASE_CLASSES} ${PICKER_SIZE_CLASSES.md}`}
        onClick={popover.toggle}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={popover.isOpen}
      >
        <span className={hasValue ? VALUE_CLASSES : PLACEHOLDER_CLASSES}>{label}</span>
        <span className={ICON_CLASSES}>
          <LuCalendarDays size={16} />
        </span>
      </button>

      {popover.isOpen &&
        createPortal(
          <div
            ref={popover.popoverRef}
            className={POPOVER_CLASSES}
            style={{
              position: 'fixed',
              top: popover.position?.top ?? -9999,
              left: popover.position?.left ?? -9999,
              zIndex: 9999,
            }}
            role="dialog"
          >
            <CalendarRange
              from={from}
              to={to}
              onSelect={(range) => {
                onChange?.(range);
                if (range.from && range.to) popover.close();
              }}
              minDate={minDate}
              maxDate={maxDate}
            />
          </div>,
          document.body,
        )}
    </div>
  );
}
