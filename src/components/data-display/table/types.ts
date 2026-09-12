import type { CSSProperties, HTMLAttributes, ReactNode, Ref } from 'react';

/** Tipos de filtro disponibles */
export type FilterType = 'text' | 'number' | 'boolean' | 'select';

/** Props que recibe el renderHeader de una columna con filtro */
export interface FilterHeaderProps {
  header: string;
  hasFilter: boolean;
  filterType: FilterType;
  uniqueValues: string[];
  selectedValues: Set<string>;
  numericRange?: { min?: number; max?: number };
  onFilterChange: (selected: Set<string>) => void;
  onNumericChange?: (range: { min?: number; max?: number }) => void;
  onFilterClear: () => void;
}

/** Definición de una columna de la tabla */
export interface Column<T> {
  /** Clave del objeto a mostrar */
  key: string;
  /** Título de la cabecera */
  header: string;
  /** Tipo de filtro para esta columna (default: 'text') */
  filterType?: FilterType;
  /** Para filterType 'select': opciones válidas (si no se provee, se infiere de los datos) */
  filterOptions?: string[];
  /** Para filterType 'boolean': labels personalizados */
  booleanLabels?: { true?: string; false?: string };
  /** Ancho mínimo de la columna */
  minWidth?: string;
  /** Ancho fijo de la columna */
  width?: string;
  /** Alineación del contenido */
  align?: 'left' | 'center' | 'right';
  /** Renderizado personalizado del contenido de la celda */
  render?: (value: unknown, row: T, index: number) => ReactNode;
  /** Renderizado personalizado del header (para inyectar filtros) */
  renderHeader?: (props?: FilterHeaderProps) => ReactNode;
}

/**
 * Structural class-name contract BaseTable needs from a CSS module.
 * Variants inject their own module to own their look; every key is optional
 * and falls back to BaseTable's default stylesheet when omitted.
 */
export interface BaseTableStyles {
  wrapper?: string;
  table?: string;
  th?: string;
  tr?: string;
  clickable?: string;
  td?: string;
  empty?: string;
  emptyIcon?: string;
  emptyTitle?: string;
  emptyDesc?: string;
  rowDanger?: string;
  rowWarning?: string;
  rowSuccess?: string;
  rowInfo?: string;
}

/** Context passed to the composeHeader slot for each data column */
export interface TableHeaderContext<T> {
  column: Column<T>;
  columnIndex: number;
}

/** Per-header additions layered over BaseTable defaults */
export interface ComposedHeader {
  className?: string;
  style?: CSSProperties;
}

/** Context passed to the composeCell slot for each data cell */
export interface TableCellContext<T> {
  row: T;
  rowIndex: number;
  column: Column<T>;
  columnIndex: number;
  /** Raw value read from the row for this column's key */
  value: unknown;
}

/** Per-cell additions layered over BaseTable defaults */
export interface ComposedCell {
  className?: string;
  style?: CSSProperties;
  /** When provided, replaces the default cell content entirely */
  content?: ReactNode;
  /** Extra attributes spread onto the <td> (events, ARIA roles, tabIndex...) */
  props?: HTMLAttributes<HTMLTableCellElement>;
}

/** Optional fixed leading column rendered before the data columns (e.g. row numbers) */
export interface LeadingColumn {
  /** Class applied to both the leading <th> and <td> */
  className?: string;
  /** Content of the leading header cell */
  header?: ReactNode;
  /** Content of the leading cell for each row */
  cell?: (rowIndex: number) => ReactNode;
}

/** Props owned and rendered by BaseTable — single source of truth for the table family */
export interface BaseTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T, index: number) => string | number;
  emptyState?: ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  onRowClick?: (row: T, index: number) => void;
  onRowDoubleClick?: (row: T, index: number) => void;
  /**
   * Declared but intentionally not consumed by any implementation.
   * Kept because DataTable.stories.tsx documents this anomaly explicitly.
   */
  loading?: boolean;
  /** Clase CSS condicional para filas — formato condicional */
  rowClassName?: (row: T, index: number) => string | undefined;
  /** Estilo inline condicional para filas */
  rowStyle?: (row: T, index: number) => CSSProperties | undefined;
  /** Altura de las filas (compact: 36px, comfortable: 44px, relaxed: 52px) */
  rowHeight?: string;
  /** CSS-module overrides so variants own their look without BaseTable importing them */
  styles?: BaseTableStyles;
  /** Fixed leading column before the data columns (adds +1 to the empty-state colSpan) */
  leadingColumn?: LeadingColumn;
  /** Per-column header composition (classes/styles layered over the defaults) */
  composeHeader?: (ctx: TableHeaderContext<T>) => ComposedHeader | undefined;
  /** Per-cell composition hook (classes/styles/events/content over the defaults) */
  composeCell?: (ctx: TableCellContext<T>) => ComposedCell | undefined;
  /** Attributes spread onto the outer wrapper div (keyboard handlers, grid ARIA...) */
  wrapperProps?: HTMLAttributes<HTMLDivElement>;
  /** Ref forwarded to the inner <table> element */
  tableRef?: Ref<HTMLTableElement>;
}
