import { useState, useRef, useCallback, useEffect } from 'react';
import { BaseTable } from './BaseTable';
import type { ExcelTableProps, CellPosition } from './excel-types';
import type { BaseTableStyles, TableCellContext } from './types';
import { useFilterableColumns } from './hooks/useFilterableColumns';
import { useTableFilters } from './hooks/useTableFilters';
import { useTablePagination } from './hooks/useTablePagination';
import { FilterBar } from './parts/FilterBar';
import Pagination from './parts/Pagination';
import { SelectEditor, BooleanEditor } from './parts/CellEditors';
import { InputBase } from '@components/primitives/Input';
import styles from './ExcelTable.module.css';

/** Structural classes BaseTable consumes — all owned by this component's stylesheet */
const excelStyles: BaseTableStyles = {
  wrapper: styles.wrapper,
  table: styles.table,
  th: styles.th,
  td: styles.td,
  empty: styles.empty,
  emptyIcon: styles.emptyIcon,
  emptyTitle: styles.emptyTitle,
  emptyDesc: styles.emptyDesc,
  rowDanger: styles.rowDanger,
  rowWarning: styles.rowWarning,
  rowSuccess: styles.rowSuccess,
  rowInfo: styles.rowInfo,
};

export default function ExcelTable<T extends object>({
  columns,
  data,
  keyExtractor,
  onDataChange,
  readOnly = false,
  filters: enableFilters = false,
  pagination: enablePagination = false,
  pageSize: initialPageSize = 10,
  rowClassName,
  rowStyle,
}: ExcelTableProps<T>) {
  // ─── Edit state ───────────────────────────────────
  const [selected, setSelected] = useState<CellPosition | null>(null);
  const [editing, setEditing] = useState<CellPosition | null>(null);
  const [editValue, setEditValue] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);

  // ─── Composable: filters + pagination ─────────────
  const { filteredData, filterHeaderProps, clearAllFilters, hasActiveFilters } = useTableFilters<T>(
    enableFilters ? columns : [],
    enableFilters ? data : [],
  );

  // Datos a mostrar: filtrados si hay filtros, originales si no
  const baseData = enableFilters ? filteredData : data;

  const pagination = useTablePagination(baseData.length, initialPageSize);

  const displayData = enablePagination
    ? baseData.slice(pagination.startIndex, pagination.endIndex)
    : baseData;

  // Columnas con filtro inyectado
  const composedColumns = useFilterableColumns(columns, enableFilters, filterHeaderProps);

  // ─── Edit logic ───────────────────────────────────
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const getCellValue = useCallback((row: T, key: string): string => {
    return String((row as Record<string, unknown>)[key] ?? '');
  }, []);

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      if (readOnly) return;
      setSelected({ row, col });
    },
    [readOnly],
  );

  const handleCellDoubleClick = useCallback(
    (row: number, col: number, value: string) => {
      if (readOnly) return;
      setEditing({ row, col });
      setEditValue(value);
    },
    [readOnly],
  );

  /**
   * Resolves a display-relative row index to the ORIGINAL props.data index
   * by matching row identity via keyExtractor. Display order differs from
   * props.data whenever filters and/or pagination are active, so committing
   * an edit against the display index would patch the wrong row.
   * Returns -1 when unresolvable (missing or duplicate keys) — the edit is
   * dropped rather than applied to a guessed row.
   */
  const resolveOriginalRowIndex = useCallback(
    (displayIndex: number): number => {
      const row = displayData[displayIndex];
      if (!row) return -1;
      const targetKey = String(keyExtractor(row, displayIndex));
      return data.findIndex((candidate, i) => String(keyExtractor(candidate, i)) === targetKey);
    },
    [data, displayData, keyExtractor],
  );

  const commitEdit = useCallback(() => {
    if (editing && displayData[editing.row]) {
      const colKey = composedColumns[editing.col]?.key;
      if (colKey) {
        const originalIndex = resolveOriginalRowIndex(editing.row);
        if (originalIndex >= 0) {
          onDataChange?.(originalIndex, colKey, editValue);
        }
      }
    }
    setEditing(null);
  }, [editing, editValue, composedColumns, displayData, onDataChange, resolveOriginalRowIndex]);

  const cancelEdit = useCallback(() => {
    setEditing(null);
    setEditValue('');
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!selected) return;

      const { row, col } = selected;

      switch (e.key) {
        case 'Enter':
          e.preventDefault();
          if (editing) {
            commitEdit();
          } else if (!readOnly) {
            handleCellDoubleClick(
              row,
              col,
              getCellValue(displayData[row], composedColumns[col].key),
            );
          }
          break;

        case 'Escape':
          cancelEdit();
          break;

        case 'Tab':
          e.preventDefault();
          if (editing) commitEdit();
          if (e.shiftKey) {
            if (col > 0) setSelected({ row, col: col - 1 });
            else if (row > 0) setSelected({ row: row - 1, col: composedColumns.length - 1 });
          } else {
            if (col < composedColumns.length - 1) setSelected({ row, col: col + 1 });
            else if (row < displayData.length - 1) setSelected({ row: row + 1, col: 0 });
          }
          break;

        case 'ArrowUp':
          e.preventDefault();
          if (editing) commitEdit();
          if (row > 0) setSelected({ row: row - 1, col });
          break;

        case 'ArrowDown':
          e.preventDefault();
          if (editing) commitEdit();
          if (row < displayData.length - 1) setSelected({ row: row + 1, col });
          break;

        case 'ArrowLeft':
          if (!editing && col > 0) {
            e.preventDefault();
            setSelected({ row, col: col - 1 });
          }
          break;

        case 'ArrowRight':
          if (!editing && col < composedColumns.length - 1) {
            e.preventDefault();
            setSelected({ row, col: col + 1 });
          }
          break;
      }
    },
    [
      selected,
      editing,
      displayData,
      composedColumns,
      readOnly,
      commitEdit,
      cancelEdit,
      handleCellDoubleClick,
      getCellValue,
    ],
  );

  // ─── Cell composition on BaseTable ────────────────
  const composeCell = useCallback(
    ({ row, rowIndex, column, columnIndex }: TableCellContext<T>) => {
      const isSelected = selected?.row === rowIndex && selected?.col === columnIndex;
      const isEditing = editing?.row === rowIndex && editing?.col === columnIndex;
      const value = getCellValue(row, column.key);

      return {
        className:
          [isSelected && !isEditing ? styles.selected : '', isEditing ? styles.editing : '']
            .filter(Boolean)
            .join(' ') || undefined,
        props: {
          role: 'gridcell',
          tabIndex: isSelected ? 0 : -1,
          'aria-selected': isSelected,
          onClick: () => handleCellClick(rowIndex, columnIndex),
          onDoubleClick: () => handleCellDoubleClick(rowIndex, columnIndex, value),
        },
        content: isEditing ? (
          column.filterType === 'select' && column.filterOptions ? (
            <SelectEditor
              value={value}
              options={column.filterOptions}
              onChange={setEditValue}
              onCommit={commitEdit}
              onCancel={cancelEdit}
              aria-label={column.header}
            />
          ) : column.filterType === 'boolean' ? (
            <BooleanEditor
              value={value}
              onChange={setEditValue}
              onCommit={commitEdit}
              onCancel={cancelEdit}
              aria-label={column.header}
            />
          ) : (
            <InputBase
              ref={inputRef}
              type="text"
              className={styles.input}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={commitEdit}
            />
          )
        ) : (
          <span className={styles.cellContent}>
            {column.render ? column.render(value, row, rowIndex) : value}
          </span>
        ),
      };
    },
    [
      selected,
      editing,
      editValue,
      getCellValue,
      handleCellClick,
      handleCellDoubleClick,
      commitEdit,
      cancelEdit,
    ],
  );

  // ─── Render ───────────────────────────────────────
  return (
    <div className={styles.container}>
      <FilterBar
        hasActiveFilters={enableFilters && hasActiveFilters}
        onClearAll={clearAllFilters}
      />

      <BaseTable<T>
        columns={composedColumns}
        data={displayData}
        keyExtractor={keyExtractor}
        rowClassName={rowClassName}
        rowStyle={rowStyle}
        styles={excelStyles}
        leadingColumn={{
          className: styles.rowHeader,
          cell: (rowIndex) => rowIndex + 1,
        }}
        composeCell={composeCell}
        wrapperProps={{
          onKeyDown: handleKeyDown,
          tabIndex: 0,
          role: 'grid',
          'aria-label': 'Tabla de datos',
        }}
        tableRef={tableRef}
      />

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
