import { useMemo, useState } from 'react';
import Input from '@components/primitives/Input';
import Checkbox from '@components/primitives/Checkbox';
import { LuSearch } from 'react-icons/lu';

export interface CheckboxListOption {
  id: string;
  label: string;
  description?: string;
}

interface CheckboxSearchListProps {
  options: CheckboxListOption[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  /** Placeholder del input de búsqueda */
  searchPlaceholder?: string;
  /** Mensaje cuando no hay opciones */
  emptyMessage?: string;
  /** Mensaje cuando la búsqueda no encuentra resultados */
  noResultsMessage?: string;
  /** Altura máxima del área de scroll (default 'max-h-64') */
  maxHeightClass?: string;
}

/**
 * Lista de checkboxes con filtro de búsqueda.
 * Reutilizable para permisos, roles, o cualquier lista seleccionable.
 *
 * @example
 * ```tsx
 * <CheckboxSearchList
 *   options={permissions.map(p => ({ id: p.id, label: p.name, description: p.description }))}
 *   selected={selectedPerms}
 *   onToggle={togglePerm}
 *   searchPlaceholder="Buscar permiso..."
 * />
 * ```
 */
export function CheckboxSearchList({
  options,
  selected,
  onToggle,
  searchPlaceholder = 'Buscar...',
  emptyMessage = 'Sin opciones',
  noResultsMessage = 'Sin resultados',
  maxHeightClass = 'max-h-64',
}: CheckboxSearchListProps) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) || (opt.description ?? '').toLowerCase().includes(q),
    );
  }, [options, search]);

  return (
    <div className="space-y-2">
      <Input
        type="text"
        value={search}
        onChange={setSearch}
        placeholder={searchPlaceholder}
        startAdornment={<LuSearch size={16} />}
        startAdornmentVariant="accent"
      />

      {options.length === 0 ? (
        <p className="text-fg-muted py-3 text-center text-xs">{emptyMessage}</p>
      ) : (
        <div
          className={`${maxHeightClass} border-border-base space-y-1 overflow-y-auto rounded-md border p-2`}
        >
          {filtered.length === 0 ? (
            <p className="text-fg-muted py-3 text-center text-xs">{noResultsMessage}</p>
          ) : (
            filtered.map((opt) => (
              <label
                key={opt.id}
                className="hover:bg-surface flex cursor-pointer items-start gap-2 rounded px-2 py-1.5"
              >
                <Checkbox
                  checked={selected.has(opt.id)}
                  onChange={() => onToggle(opt.id)}
                  className="mt-0.5"
                />
                <span>
                  <span className="text-fg block text-sm font-medium">{opt.label}</span>
                  {opt.description && (
                    <span className="text-fg-muted block text-xs">{opt.description}</span>
                  )}
                </span>
              </label>
            ))
          )}
        </div>
      )}
    </div>
  );
}
