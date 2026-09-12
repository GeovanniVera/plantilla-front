import { useMemo } from 'react';
import Input from '@components/primitives/Input';

const SEARCH_WRAP_CLASSES = 'px-3 py-2 border-b border-border-base';
const CHECK_ITEM_CLASSES =
  'flex items-center gap-2 px-3 py-1.5 cursor-pointer transition-colors duration-100 ease-in-out hover:bg-accent-subtle';
const CHECKBOX_CLASSES = 'size-[15px] rounded-[4px] accent-accent cursor-pointer shrink-0';
const CHECK_LABEL_CLASSES =
  'text-xs text-foreground whitespace-nowrap overflow-hidden text-ellipsis';
const DIVIDER_CLASSES = 'h-px bg-border-base m-0';
const LIST_CLASSES = 'max-h-[200px] overflow-y-auto py-1';
const NO_RESULTS_CLASSES = 'py-4 px-3 text-xs text-foreground text-center m-0 opacity-60';

interface TextFilterContentProps {
  uniqueValues: string[];
  selectedValues: Set<string>;
  search: string;
  onSearch: (s: string) => void;
  onChange: (selected: Set<string>) => void;
}

/**
 * Contenido del filtro de texto/selección múltiple.
 * Muestra una barra de búsqueda + lista de checkboxes con "Seleccionar todo".
 */
export function TextFilterContent({
  uniqueValues,
  selectedValues,
  search,
  onSearch,
  onChange,
}: TextFilterContentProps) {
  const allSelected = selectedValues.size === uniqueValues.length;

  const filteredValues = useMemo(() => {
    if (!search) return uniqueValues;
    const q = search.toLowerCase();
    return uniqueValues.filter((v) => v.toLowerCase().includes(q));
  }, [uniqueValues, search]);

  const indeterminate = !allSelected && selectedValues.size > 0;

  const toggleValue = (value: string) => {
    const next = new Set(selectedValues);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    onChange(next);
  };

  const toggleAll = () => {
    if (allSelected) onChange(new Set());
    else onChange(new Set(uniqueValues));
  };

  const handleSearch = (value: string) => {
    onSearch(value);
    if (!value) {
      onChange(new Set(uniqueValues));
      return;
    }
    const q = value.toLowerCase();
    const matching = new Set(uniqueValues.filter((v) => v.toLowerCase().includes(q)));
    onChange(matching);
  };

  return (
    <>
      <div className={SEARCH_WRAP_CLASSES}>
        <Input
          size="sm"
          className="bg-surface"
          placeholder="Buscar..."
          value={search}
          onChange={handleSearch}
          aria-label="Search filter values"
          autoFocus
        />
      </div>

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
        {filteredValues.length === 0 ? (
          <p className={NO_RESULTS_CLASSES}>Sin resultados</p>
        ) : (
          filteredValues.map((value) => (
            <label key={value} className={CHECK_ITEM_CLASSES}>
              <input
                type="checkbox"
                checked={selectedValues.has(value)}
                onChange={() => toggleValue(value)}
                className={CHECKBOX_CLASSES}
              />
              <span className={CHECK_LABEL_CLASSES}>{value}</span>
            </label>
          ))
        )}
      </div>
    </>
  );
}
