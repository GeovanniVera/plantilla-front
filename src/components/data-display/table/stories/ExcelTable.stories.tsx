import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import ExcelTable from '../ExcelTable'
import type { ExcelTableProps } from '../excel-types'
import type { Column } from '../types'
import { employeeRows, DEPARTMENTS, type EmployeeRow } from './table-stories-data'

type Props = ExcelTableProps<EmployeeRow>

const meta: Meta<Props> = {
    title: 'Data Display/Table/ExcelTable',
    component: ExcelTable,
    tags: ['autodocs'],
    argTypes: {
        readOnly: { control: 'boolean' },
        filters: { control: 'boolean' },
        pagination: { control: 'boolean' },
        pageSize: { control: 'number', min: 1 },
    },
}

export default meta
type Story = StoryObj<Props>

const gridColumns: Column<EmployeeRow>[] = [
    { key: 'name', header: 'Name', minWidth: '150px' },
    { key: 'department', header: 'Department', align: 'center' },
    { key: 'salary', header: 'Salary', align: 'right' },
    { key: 'active', header: 'Active', align: 'center' },
]

/**
 * Stateful wrapper so edits actually persist: ExcelTable does not mutate its own
 * data — commit flows through onDataChange(rowIndex, columnKey, value) and the
 * parent is responsible for updating state.
 */
function EditableGrid({
    columns,
    initialRows,
}: {
    columns: Column<EmployeeRow>[]
    initialRows: EmployeeRow[]
}) {
    const [rows, setRows] = useState(initialRows)
    return (
        <ExcelTable
            columns={columns}
            data={rows}
            keyExtractor={(row) => row.id}
            onDataChange={(rowIndex, columnKey, value) => {
                setRows((prev) =>
                    prev.map((row, i) => {
                        if (i !== rowIndex) return row
                        if (columnKey === 'salary') return { ...row, salary: Number(value) }
                        if (columnKey === 'active') return { ...row, active: value === 'true' }
                        return { ...row, [columnKey]: value }
                    }),
                )
            }}
        />
    )
}

export const Default: Story = {
    parameters: {
        docs: {
            description: {
                story:
                    'Fully editable grid. Click a cell to select it, double-click or press Enter to edit; ' +
                    'commit with Enter/blur, cancel with Escape. Arrow keys and Tab move the selection.',
            },
        },
    },
    render: () => <EditableGrid columns={gridColumns} initialRows={employeeRows} />,
}

export const ReadOnly: Story = {
    args: {
        columns: gridColumns,
        data: employeeRows,
        keyExtractor: (row) => row.id,
        readOnly: true,
    },
}

export const Empty: Story = {
    parameters: {
        docs: {
            description: {
                story:
                    'BASELINE ANOMALY: the empty state is hardcoded ("Sin datos" / "No hay registros para ' +
                    'mostrar.") — ExcelTable exposes no emptyTitle / emptyDescription / emptyState props.',
            },
        },
    },
    args: {
        columns: gridColumns,
        data: [],
        keyExtractor: (row) => row.id,
    },
}

export const Filtering: Story = {
    args: {
        columns: [
            { key: 'name', header: 'Name', minWidth: '150px', filterType: 'text' },
            {
                key: 'department',
                header: 'Department',
                align: 'center',
                filterType: 'select',
                filterOptions: [...DEPARTMENTS],
            },
            { key: 'salary', header: 'Salary', align: 'right', filterType: 'number' },
            { key: 'active', header: 'Active', align: 'center', filterType: 'boolean' },
        ],
        data: employeeRows,
        keyExtractor: (row) => row.id,
        filters: true,
    },
}

export const PaginationStory: Story = {
    name: 'Pagination',
    parameters: {
        docs: {
            description: {
                story: '15 rows with pageSize 5 gives 3 pages.',
            },
        },
    },
    args: {
        columns: gridColumns,
        data: employeeRows,
        keyExtractor: (row) => row.id,
        pagination: true,
        pageSize: 5,
    },
}

export const CellEditorVariants: Story = {
    parameters: {
        docs: {
            description: {
                story:
                    'Editor selection reads each column\'s `filterType` even when filters are disabled: ' +
                    '"Department" (select + filterOptions) renders a dropdown editor, "Active" (boolean) a ' +
                    'toggle, "Name"/"Salary" fall back to a text input. Try editing cells directly.',
            },
        },
    },
    render: () => (
        <EditableGrid
            columns={[
                { key: 'name', header: 'Name', minWidth: '150px' },
                {
                    key: 'department',
                    header: 'Department',
                    align: 'center',
                    filterType: 'select',
                    filterOptions: [...DEPARTMENTS],
                },
                { key: 'salary', header: 'Salary', align: 'right' },
                { key: 'active', header: 'Active', align: 'center', filterType: 'boolean' },
            ]}
            initialRows={employeeRows.slice(0, 6)}
        />
    ),
}

export const ConditionalFormatting: Story = {
    parameters: {
        docs: {
            description: {
                story:
                    '`rowClassName` tokens map to built-in row styles (rowDanger / rowWarning / rowSuccess / ' +
                    'rowInfo). Inactive rows use rowDanger; salaries above $60k get an inline style via `rowStyle`.',
            },
        },
    },
    args: {
        columns: gridColumns,
        data: employeeRows,
        keyExtractor: (row) => row.id,
        rowClassName: (row) => (row.active ? undefined : 'rowDanger'),
        rowStyle: (row) => (row.salary > 60000 ? { fontWeight: 700 } : undefined),
    },
}
