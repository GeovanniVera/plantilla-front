import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { LuFilter, LuX } from 'react-icons/lu';
import type { FilterType } from '../types';
import { usePopoverPosition } from './usePopoverPosition';
import { TextFilterContent } from './TextFilterContent';
import { NumberFilterContent } from './NumberFilterContent';
import { BooleanFilterContent } from './BooleanFilterContent';

interface FilterDropdownProps {
  header: string;
  filterType: FilterType;
  uniqueValues: string[];
  /** Valores seleccionados (para text/select). Vacío = ninguno seleccionado. */
  selectedValues: Set<string>;
  /** Rango numérico (para number) */
  numericRange?: { min?: number; max?: number };
  hasFilter: boolean;
  onChange: (selected: Set<string>) => void;
  onNumericChange?: (range: { min?: number; max?: number }) => void;
  onClear: () => void;
}

/* ─── Styling ──────────────────────────────────────────────
 * Todo el chrome es Tailwind. La posición del popover se calcula
 * con JS (getBoundingClientRect + viewport flip) via el hook
 * usePopoverPosition. La animación de entrada reutiliza el token
 * compartido --animate-popover-in (.12s ease). */
const CONTAINER_CLASSES = 'relative inline-flex items-center gap-1';

const TRIGGER_BASE_CLASSES =
  'flex items-center justify-center size-[22px] rounded-sm border-none bg-transparent cursor-pointer shrink-0 transition-colors duration-150 ease-in-out';
const TRIGGER_ACTIVE_CLASSES = 'text-accent opacity-100 bg-accent-subtle';
const TRIGGER_IDLE_CLASSES =
  'text-foreground opacity-50 hover:bg-accent-subtle hover:text-accent hover:opacity-100';

const POPOVER_CLASSES =
  'w-60 bg-background border border-border-base rounded-[10px] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.08),0_10px_20px_-2px_rgba(0,0,0,0.06)] overflow-hidden animate-popover-in';

const POPOVER_HEADER_CLASSES =
  'flex items-center justify-between pt-2.5 pb-2 px-3 border-b border-border-base';
const POPOVER_TITLE_CLASSES = 'text-xs font-semibold text-heading';
const CLEAR_BTN_CLASSES =
  'flex items-center gap-1 px-2 py-[3px] rounded-[5px] border-none bg-transparent text-foreground text-[11px] font-sans cursor-pointer transition-colors duration-150 ease-in-out hover:bg-danger-strong/10 hover:text-danger-strong';

/**
 * Dropdown de filtro para columnas de tabla.
 * Renderiza un botón trigger que abre un popover con el contenido
 * de filtro correspondiente al tipo (text, number, boolean).
 */
export default function FilterDropdown({
  header,
  filterType,
  uniqueValues,
  selectedValues,
  numericRange,
  hasFilter,
  onChange,
  onNumericChange,
  onClear,
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { popoverRef, buttonRef, popoverStyle } = usePopoverPosition(isOpen);

  // Cierra al hacer click fuera
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, popoverRef, buttonRef]);

  // Cierra con Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Abrir el dropdown es solo acción de UI — NO muta el estado lógico del filtro.
  // Una selección vacía significa "sin filtro" (ver useTableFilters);
  // el usuario activa un filtro checkeando valores explícitamente.
  const handleOpen = () => {
    setIsOpen((p) => !p);
    setSearch('');
  };

  return (
    <div className={CONTAINER_CLASSES}>
      <button
        ref={buttonRef}
        className={`${TRIGGER_BASE_CLASSES} ${hasFilter ? TRIGGER_ACTIVE_CLASSES : TRIGGER_IDLE_CLASSES}`}
        onClick={handleOpen}
        aria-label={`Filtrar ${header}`}
        aria-expanded={isOpen}
      >
        <LuFilter size={14} />
      </button>

      {isOpen &&
        createPortal(
          <div ref={popoverRef} className={POPOVER_CLASSES} style={popoverStyle}>
            <div className={POPOVER_HEADER_CLASSES}>
              <span className={POPOVER_TITLE_CLASSES}>Filtrar: {header}</span>
              {hasFilter && (
                <button
                  className={CLEAR_BTN_CLASSES}
                  onClick={() => {
                    onClear();
                    setIsOpen(false);
                  }}
                >
                  <LuX size={14} />
                  Limpiar
                </button>
              )}
            </div>

            {filterType === 'number' ? (
              <NumberFilterContent range={numericRange} onChange={onNumericChange!} />
            ) : filterType === 'boolean' ? (
              <BooleanFilterContent selectedValues={selectedValues} onChange={onChange} />
            ) : (
              <TextFilterContent
                uniqueValues={uniqueValues}
                selectedValues={selectedValues}
                search={search}
                onSearch={setSearch}
                onChange={onChange}
              />
            )}
          </div>,
          document.body,
        )}
    </div>
  );
}
