import { useState, useMemo, useCallback } from 'react';
import type { FilterHeaderProps, FilterType } from '../types';

export type FilterState = Record<string, Set<string>>;
export type NumericFilterState = Record<string, { min?: number; max?: number }>;

export interface UseTableFiltersReturn<T> {
  /** Datos filtrados */
  filteredData: T[];
  /** Mapa de props de filtro por key de columna — usar con column.renderHeader */
  filterHeaderProps: Record<string, FilterHeaderProps>;
  /** Cambiar selección de una columna */
  setFilter: (columnKey: string, selected: Set<string>) => void;
  /** Cambiar rango numérico de una columna */
  setNumericFilter: (columnKey: string, range: { min?: number; max?: number }) => void;
  /** Limpiar filtro de una columna */
  clearFilter: (columnKey: string) => void;
  /** Limpiar todos los filtros */
  clearAllFilters: () => void;
  /** Si hay algún filtro activo */
  hasActiveFilters: boolean;
}

/**
 * Hook que encapsula la lógica de filtrado por columnas.
 * Soporta: text, number, boolean, select
 *
 * Filter semantics (Excel-style, hotfix 6I — supersedes the phase-3 rule):
 * - key ABSENT from the map -> no filter, all rows visible.
 * - key PRESENT with an EMPTY Set -> ACTIVE filter matching nothing -> 0 rows.
 * - key PRESENT with values -> only rows whose value is in the set.
 * Explicit clear (clearFilter / clearAllFilters) removes keys again.
 *
 * @param columns - Definición de columnas
 * @param data - Datos originales
 * @param onFilterChange - Callback al cambiar filtros
 */
export function useTableFilters<T extends object>(
  columns: Array<{
    key: string;
    filterType?: FilterType;
    filterOptions?: string[];
    booleanLabels?: { true?: string; false?: string };
  }>,
  data: T[],
  onFilterChange?: () => void,
): UseTableFiltersReturn<T> {
  const [filters, setFilters] = useState<FilterState>({});
  const [numericFilters, setNumericFilters] = useState<NumericFilterState>({});

  // Detectar tipo de filtro para cada columna
  const columnTypes = useMemo(() => {
    const map: Record<string, FilterType> = {};
    for (const col of columns) {
      if (col.filterType) {
        map[col.key] = col.filterType;
      } else {
        // Auto-detectar: si todos los valores son números → number
        // si solo son 'true'/'false' → boolean, si no → text
        const values = data.map((row) => (row as Record<string, unknown>)[col.key]);
        const allNumbers = values.every((v) => v == null || v === '' || !isNaN(Number(v)));
        const allBoolean = values.every(
          (v) =>
            v === true || v === false || v === 'true' || v === 'false' || v === '' || v == null,
        );
        if (allNumbers && values.length > 0 && values.some((v) => v != null && v !== '')) {
          map[col.key] = 'number';
        } else if (allBoolean && values.length > 0) {
          map[col.key] = 'boolean';
        } else {
          map[col.key] = 'text';
        }
      }
    }
    return map;
  }, [columns, data]);

  // Valores únicos por columna (para text y select)
  const uniqueValuesMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const col of columns) {
      const type = columnTypes[col.key];
      if (type === 'number' || type === 'boolean') continue; // No aplica

      if (type === 'select' && col.filterOptions) {
        // Usar las opciones definidas por el dev
        map[col.key] = col.filterOptions;
      } else {
        // Inferir de los datos
        const values = new Set(
          data.map((row) => String((row as Record<string, unknown>)[col.key] ?? '')),
        );
        map[col.key] = Array.from(values).sort();
      }
    }
    return map;
  }, [columns, data, columnTypes]);

  // Datos filtrados
  // Semantics (Excel-style): a stored entry IS an active filter. An empty
  // Set matches nothing -> 0 rows. Absence of the key means unfiltered.
  const filteredData = useMemo(() => {
    return data.filter((row) => {
      for (const [key, selected] of Object.entries(filters)) {
        const type = columnTypes[key];
        if (type === 'number') continue; // Se filtra por numericFilters

        if (selected.size === 0) return false; // Active filter, no values -> no rows
        const cellValue = String((row as Record<string, unknown>)[key] ?? '');
        if (!selected.has(cellValue)) return false;
      }

      // Filtros numéricos
      for (const [key, range] of Object.entries(numericFilters)) {
        if (range.min == null && range.max == null) continue;
        const rawValue = (row as Record<string, unknown>)[key];
        const numValue = Number(rawValue);
        if (isNaN(numValue)) return false;
        if (range.min != null && numValue < range.min) return false;
        if (range.max != null && numValue > range.max) return false;
      }

      return true;
    });
  }, [data, filters, numericFilters, columnTypes]);

  // Handlers — an empty selection is STORED as an active filter (0 rows).
  // Only explicit clear actions remove entries.
  const setFilter = useCallback(
    (columnKey: string, selected: Set<string>) => {
      setFilters((prev) => ({ ...prev, [columnKey]: selected }));
      onFilterChange?.();
    },
    [onFilterChange],
  );

  const setNumericFilter = useCallback(
    (columnKey: string, range: { min?: number; max?: number }) => {
      setNumericFilters((prev) => {
        const next = { ...prev };
        if (range.min == null && range.max == null) delete next[columnKey];
        else next[columnKey] = range;
        return next;
      });
      onFilterChange?.();
    },
    [onFilterChange],
  );

  const clearFilter = useCallback(
    (columnKey: string) => {
      setFilters((prev) => {
        const next = { ...prev };
        delete next[columnKey];
        return next;
      });
      setNumericFilters((prev) => {
        const next = { ...prev };
        delete next[columnKey];
        return next;
      });
      onFilterChange?.();
    },
    [onFilterChange],
  );

  const clearAllFilters = useCallback(() => {
    setFilters({});
    setNumericFilters({});
    onFilterChange?.();
  }, [onFilterChange]);

  // Filtro activo = la key existe en filters o numericFilters
  // (incluye sets vacíos: filtro activo que no matchea nada)
  const hasActiveFilters = useMemo(
    () => Object.keys(filters).length > 0 || Object.keys(numericFilters).length > 0,
    [filters, numericFilters],
  );

  // Props map — cada columna tiene sus props de filtro listas para renderHeader
  const filterHeaderProps = useMemo(() => {
    const map: Record<string, FilterHeaderProps> = {};
    for (const col of columns) {
      const type = columnTypes[col.key];
      map[col.key] = {
        header: col.key,
        filterType: type,
        hasFilter: filters[col.key] != null || numericFilters[col.key] != null,
        uniqueValues: uniqueValuesMap[col.key] ?? [],
        selectedValues: filters[col.key] ?? new Set(),
        numericRange: numericFilters[col.key],
        onFilterChange: (selected) => setFilter(col.key, selected),
        onNumericChange:
          type === 'number' ? (range) => setNumericFilter(col.key, range) : undefined,
        onFilterClear: () => clearFilter(col.key),
      };
    }
    return map;
  }, [
    columns,
    filters,
    numericFilters,
    uniqueValuesMap,
    columnTypes,
    setFilter,
    setNumericFilter,
    clearFilter,
  ]);

  return {
    filteredData,
    filterHeaderProps,
    setFilter,
    setNumericFilter,
    clearFilter,
    clearAllFilters,
    hasActiveFilters,
  };
}
