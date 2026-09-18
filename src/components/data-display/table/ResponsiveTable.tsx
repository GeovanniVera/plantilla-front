import DataTable from './DataTable';
import { FilterBar } from './parts/FilterBar';
import Pagination from './parts/Pagination';
import { useTableFilters } from './hooks/useTableFilters';
import { useTablePagination } from './hooks/useTablePagination';
import { useMediaQuery } from '@hooks/useMediaQuery';
import type { BaseTableProps } from './types';

export interface ResponsiveTableProps<T extends object> extends BaseTableProps<T> {
  /** Habilitar filtros en cabeceras */
  filters?: boolean;
  /** Habilitar paginación */
  pagination?: boolean;
  /** Items por página (default 10) */
  pageSize?: number;
}

/**
 * Tabla responsive.
 *
 * En desktop renderiza el DataTable completo (tabla con filtros y paginación).
 * En mobile (≤768px) renderiza cards verticales apiladas, reutilizando las
 * mismas columnas, filtros y paginación.
 *
 * Cada card muestra:
 * - label (header de la columna) + valor (render si existe, si no el crudo)
 * - La columna con header vacío (ej: acciones) se renderiza al final de la card
 * - La card completa es clicable si hay onRowClick
 */
export default function ResponsiveTable<T extends object>({
  columns,
  data,
  keyExtractor,
  filters: enableFilters = false,
  pagination: enablePagination = false,
  pageSize: initialPageSize = 10,
  onRowClick,
  emptyTitle = 'Sin datos',
  emptyDescription = 'No se encontraron registros.',
  ...tableProps
}: ResponsiveTableProps<T>) {
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Filtros
  const { filteredData, clearAllFilters, hasActiveFilters } = useTableFilters<T>(
    enableFilters ? columns : [],
    enableFilters ? data : [],
  );

  const baseData = enableFilters ? filteredData : data;

  // Paginación
  const pagination = useTablePagination(baseData.length, initialPageSize);

  const displayData = enablePagination
    ? baseData.slice(pagination.startIndex, pagination.endIndex)
    : baseData;

  // ─── Desktop: DataTable completo ─────────────────────────
  if (!isMobile) {
    return (
      <DataTable
        columns={columns}
        data={data}
        keyExtractor={keyExtractor}
        filters={enableFilters}
        pagination={enablePagination}
        pageSize={initialPageSize}
        onRowClick={onRowClick}
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
        {...tableProps}
      />
    );
  }

  // ─── Mobile: cards verticales ────────────────────────────
  // Separar la columna de acciones (header vacío) del resto
  const actionColumn = columns.find((col) => !col.header);
  const dataColumns = columns.filter((col) => col.header);

  return (
    <div className="flex flex-col gap-3">
      <FilterBar
        hasActiveFilters={enableFilters && hasActiveFilters}
        onClearAll={clearAllFilters}
      />

      {displayData.length === 0 ? (
        <div className="bg-surface border-border-base flex flex-col items-center justify-center rounded-lg border px-4 py-10 text-center">
          <p className="text-fg text-sm font-medium">{emptyTitle}</p>
          <p className="text-fg-muted mt-1 text-xs">{emptyDescription}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {displayData.map((row, index) => {
            const key = keyExtractor(row, index);
            const clickable = !!onRowClick;

            return (
              <div
                key={key}
                role={clickable ? 'button' : undefined}
                tabIndex={clickable ? 0 : undefined}
                onClick={onRowClick ? () => onRowClick(row, index) : undefined}
                onKeyDown={
                  clickable
                    ? (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onRowClick(row, index);
                        }
                      }
                    : undefined
                }
                className={[
                  'bg-surface border-border-base flex w-full flex-col gap-2 rounded-lg border p-4 text-left transition-[border-color,box-shadow] duration-150',
                  clickable ? 'hover:border-accent-line cursor-pointer' : '',
                ].join(' ')}
              >
                {dataColumns.map((col) => {
                  const value = (row as Record<string, unknown>)[col.key];
                  const rendered = col.render ? col.render(value, row, index) : String(value ?? '');
                  return (
                    <div key={col.key} className="flex flex-col gap-0.5">
                      <span className="text-fg-muted text-[11px] font-semibold tracking-wide uppercase">
                        {col.header}
                      </span>
                      <span className="text-fg text-sm">{rendered}</span>
                    </div>
                  );
                })}

                {actionColumn?.render && (
                  <div className="border-border-base mt-1 border-t pt-2">
                    {actionColumn.render(
                      (row as Record<string, unknown>)[actionColumn.key],
                      row,
                      index,
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {enablePagination && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          pageSize={pagination.pageSize}
          onPageChange={pagination.goToPage}
          onPageSizeChange={pagination.setPageSize}
        />
      )}
    </div>
  );
}
