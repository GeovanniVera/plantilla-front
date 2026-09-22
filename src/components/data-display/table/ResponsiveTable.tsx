import { useTranslation } from 'react-i18next';
import DataTable from './DataTable';
import ExpandableCard from '@components/layout/ExpandableCard';
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
 * En mobile (≤768px) renderiza cards expandibles, reutilizando las mismas
 * columnas, filtros y paginación.
 *
 * Cada card muestra:
 * - Colapsada: sólo la primera columna de datos (sin etiqueta).
 * - Expandida: las columnas restantes con su label/valor y, separada por un
 *   borde superior, la columna de acciones (header vacío). Si hay
 *   `onRowClick`, se agrega una acción explícita "ver detalle" al final.
 * - Sin contenido que expandir, la card es estática (sin botón ni chevron).
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
  const { t } = useTranslation();
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

  // ─── Mobile: cards expandibles ───────────────────────────
  // La primera columna de datos es la línea colapsada; el resto (y la columna
  // de acciones, header vacío) vive en el cuerpo expandible.
  const actionColumn = columns.find((col) => !col.header);
  const dataColumns = columns.filter((col) => col.header);
  const [summaryColumn, ...detailColumns] = dataColumns;

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
            const raw = row as Record<string, unknown>;

            const summaryValue = summaryColumn ? raw[summaryColumn.key] : undefined;
            const summary = summaryColumn
              ? summaryColumn.render
                ? summaryColumn.render(summaryValue, row, index)
                : String(summaryValue ?? '')
              : null;

            const action = actionColumn?.render
              ? actionColumn.render(raw[actionColumn.key], row, index)
              : null;
            const hasBody = detailColumns.length > 0 || action !== null || onRowClick !== undefined;

            return (
              <ExpandableCard
                key={key}
                interactive={hasBody}
                expandable={hasBody}
                summary={<span className="text-fg text-sm font-medium break-words">{summary}</span>}
              >
                {detailColumns.length > 0 && (
                  <div className="flex flex-col gap-2">
                    {detailColumns.map((col) => {
                      const value = raw[col.key];
                      const rendered = col.render
                        ? col.render(value, row, index)
                        : String(value ?? '');
                      return (
                        <div key={col.key} className="flex flex-col gap-0.5">
                          <span className="text-fg-muted text-[11px] font-semibold tracking-wide uppercase">
                            {col.header}
                          </span>
                          <span className="text-fg text-sm">{rendered}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {(action !== null || onRowClick !== undefined) && (
                  <div
                    className={[
                      'border-border-base flex items-center justify-between gap-2 border-t pt-2',
                      detailColumns.length > 0 ? 'mt-2' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {action !== null && <div className="min-w-0 flex-1">{action}</div>}

                    {onRowClick !== undefined && (
                      <button
                        type="button"
                        onClick={() => onRowClick(row, index)}
                        className="text-accent focus-visible:ring-accent rounded-sm text-sm font-medium hover:underline focus-visible:ring-2 focus-visible:outline-none"
                      >
                        {t('common.viewDetail')}
                      </button>
                    )}
                  </div>
                )}
              </ExpandableCard>
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
