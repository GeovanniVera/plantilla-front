const CHECK_ITEM_CLASSES =
  'flex items-center gap-2 px-3 py-1.5 cursor-pointer transition-colors duration-100 ease-in-out hover:bg-accent-subtle';
const CHECKBOX_CLASSES = 'size-[15px] rounded-[4px] accent-accent cursor-pointer shrink-0';
const CHECK_LABEL_CLASSES =
  'text-xs text-foreground whitespace-nowrap overflow-hidden text-ellipsis';
const DIVIDER_CLASSES = 'h-px bg-border-base m-0';
const LIST_CLASSES = 'max-h-[200px] overflow-y-auto py-1';

interface BooleanFilterContentProps {
  selectedValues: Set<string>;
  onChange: (selected: Set<string>) => void;
}

/**
 * Contenido del filtro booleano (Sí/No).
 * Muestra checkboxes para verdadero/falso con "Seleccionar todo".
 */
export function BooleanFilterContent({ selectedValues, onChange }: BooleanFilterContentProps) {
  const options = ['true', 'false'];

  const toggleValue = (value: string) => {
    const next = new Set(selectedValues);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    onChange(next);
  };

  const allSelected = selectedValues.size === 2;
  const indeterminate = !allSelected && selectedValues.size > 0;

  const toggleAll = () => {
    if (allSelected) onChange(new Set());
    else onChange(new Set(options));
  };

  return (
    <>
      <label className={CHECK_ITEM_CLASSES}>
        <input
          type="checkbox"
          checked={allSelected}
          ref={(el) => {
            if (el) el.indeterminate = indeterminate;
          }}
          onChange={toggleAll}
          className={CHECKBOX_CLASSES}
        />
        <span className={CHECK_LABEL_CLASSES}>Seleccionar todo</span>
      </label>

      <div className={DIVIDER_CLASSES} />

      <div className={LIST_CLASSES}>
        <label className={CHECK_ITEM_CLASSES}>
          <input
            type="checkbox"
            checked={selectedValues.has('true')}
            onChange={() => toggleValue('true')}
            className={CHECKBOX_CLASSES}
          />
          <span className={CHECK_LABEL_CLASSES}>Sí / Verdadero</span>
        </label>
        <label className={CHECK_ITEM_CLASSES}>
          <input
            type="checkbox"
            checked={selectedValues.has('false')}
            onChange={() => toggleValue('false')}
            className={CHECKBOX_CLASSES}
          />
          <span className={CHECK_LABEL_CLASSES}>No / Falso</span>
        </label>
      </div>
    </>
  );
}
