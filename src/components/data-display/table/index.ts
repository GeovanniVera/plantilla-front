/**
 * Public surface of the table family.
 *
 * Components: BaseTable (rendering core), DataTable (read-oriented) and
 * ExcelTable (editable grid). Types live in types.ts / excel-types.ts, which
 * remain the single source of truth — this barrel only re-exports them.
 *
 * Composition parts (FilterBar, Pagination, ColumnToggle, DensitySelector,
 * BulkActionsBar, SearchHighlight) are part of the public composable API:
 * they let consumers build custom toolbars on top of the same primitives the
 * variants use internally. Deep imports keep working; the barrel is the
 * preferred entry point going forward.
 *
 * NOT exported (internal composition details): hooks/*, FilterHeader,
 * FilterDropdown, CellEditors.
 */

// ─── Components ──────────────────────────────────────
export { BaseTable } from './BaseTable';
export { default as DataTable } from './DataTable';
export type { DataTableProps } from './DataTable';
export { default as ExcelTable } from './ExcelTable';

// ─── Types ───────────────────────────────────────────
export type { BaseTableProps, Column, FilterType } from './types';
export type { ExcelTableProps, CellPosition } from './excel-types';

// ─── Composition parts ───────────────────────────────
export { FilterBar } from './parts/FilterBar';
export { default as Pagination } from './parts/Pagination';
export type { PaginationProps } from './parts/Pagination';
export { ColumnToggle } from './parts/ColumnToggle';
export { DensitySelector } from './parts/DensitySelector';
export type { Density } from './parts/DensitySelector';
export { BulkActionsBar } from './parts/BulkActionsBar';
export type { BulkAction } from './parts/BulkActionsBar';
export { SearchHighlight } from './parts/SearchHighlight';
