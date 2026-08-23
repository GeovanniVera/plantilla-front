import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import DataTable from '../DataTable'
import type { DataTableProps } from '../DataTable'
import type { Column } from '../types'
import { employeeRows, DEPARTMENTS, type EmployeeRow } from './table-stories-data'

type Props = DataTableProps<EmployeeRow>

const meta: Meta<Props> = {
    title: 'Data Display/Table/DataTable',
    component: DataTable,
    tags: ['autodocs'],
    argTypes: {
        filters: { control: 'boolean' },
        pagination: { control: 'boolean' },
        pageSize: { control: 'number', min: 1 },
    },
}

export default meta
type Story = StoryObj<Props>

const baseColumns: Column<EmployeeRow>[] = [
    { key: 'name', header: 'Name', minWidth: '160px' },
    { key: 'department', header: 'Department', align: 'center' },
    { key: 'salary', header: 'Salary', align: 'right' },
    {
        key: 'active',
        header: 'Active',
        align: 'center',
        render: (value) => (value ? 'Yes' : 'No'),
    },
]

const defaultArgs: Props = {
    columns: baseColumns,
    data: employeeRows,
    keyExtractor: (row) => row.id,
}

export const Default: Story = {
    args: defaultArgs,
}

export const Empty: Story = {
    args: {
        ...defaultArgs,
        data: [],
        emptyTitle: 'No employees yet',
        emptyDescription: 'Add your first employee to see it listed here.',
    },
}

export const Filtering: Story = {
    parameters: {
        docs: {
            description: {
                story:
                    'Column filters driven by `filterType`. Opening a dropdown no longer mutates filter ' +
                    'state — checkboxes start unchecked and the filter activates only when at least one ' +
                    'value is selected.\n\n' +
                    '**ANTES:** opening a dropdown auto-selected all values, marking the column as filtered ' +
                    'without excluding anything; unchecking every value left an empty Set that hid ALL rows.\n' +
                    '**DESPUÉS:** opening a dropdown is a pure UI action, and an empty selection means ' +
                    '"no active filter" for that key — rows stay visible and "Filtros activos" clears.\n' +
                    '**MOTIVO:** dropdown visibility must not be a side effect of logical filter state.',
            },
        },
    },
    args: {
        ...defaultArgs,
        columns: [
            { key: 'name', header: 'Name', minWidth: '160px', filterType: 'text' },
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
        filters: true,
    },
}

export const EmptyFilterKeepsRows: Story = {
    name: 'Empty Filter Keeps Rows',
    parameters: {
        docs: {
            description: {
                story:
                    'Documents the empty-filter fix in `useTableFilters`.\n\n' +
                    '**ANTES:** unchecking every value in a column dropdown stored an empty Set, which ' +
                    'filtered out ALL rows and kept "Filtros activos" lit with no way to see data.\n' +
                    '**DESPUÉS:** an empty selection equals NO active filter — all rows remain visible ' +
                    'and the "Filtros activos" chip clears once the last value is unchecked.\n' +
                    '**MOTIVO:** consistent hook-level semantics; no per-table workarounds. Try it: open ' +
                    'the Department filter, check one value, then uncheck it again — rows come back.',
            },
        },
    },
    args: {
        ...defaultArgs,
        columns: [
            { key: 'name', header: 'Name', minWidth: '160px', filterType: 'text' },
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
        filters: true,
    },
}

export const PaginationStory: Story = {
    name: 'Pagination',
    parameters: {
        docs: {
            description: {
                story:
                    '15 rows with pageSize 5 gives 3 pages. Known quirk: the page-size selector renders even ' +
                    'when a single page exists.',
            },
        },
    },
    args: {
        ...defaultArgs,
        pagination: true,
        pageSize: 5,
    },
}

function formatCurrency(value: unknown): string {
    return `$${Number(value ?? 0).toLocaleString('en-US')}`
}

export const CustomRendering: Story = {
    parameters: {
        docs: {
            description: {
                story:
                    'Custom cell rendering via `Column.render`: bold names and currency-formatted salaries.',
            },
        },
    },
    args: {
        ...defaultArgs,
        columns: [
            {
                key: 'name',
                header: 'Name',
                minWidth: '160px',
                render: (value) => <strong>{String(value)}</strong>,
            },
            { key: 'department', header: 'Department', align: 'center' },
            {
                key: 'salary',
                header: 'Salary',
                align: 'right',
                render: (value) => formatCurrency(value),
            },
            { key: 'active', header: 'Active', align: 'center', render: (v) => (v ? 'Yes' : 'No') },
        ],
    },
}

function RowClickDemo() {
    const [lastClicked, setLastClicked] = useState<string | null>(null)
    const [lastDoubleClicked, setLastDoubleClicked] = useState<string | null>(null)
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ margin: 0, fontSize: 13 }}>
                Last clicked: <strong>{lastClicked ?? '—'}</strong> · Last double-clicked:{' '}
                <strong>{lastDoubleClicked ?? '—'}</strong>
            </p>
            <DataTable
                columns={baseColumns}
                data={employeeRows.slice(0, 6)}
                keyExtractor={(row) => row.id}
                onRowClick={(row) => setLastClicked(row.name)}
                onRowDoubleClick={(row) => setLastDoubleClicked(row.name)}
            />
        </div>
    )
}

export const RowInteraction: Story = {
    render: () => <RowClickDemo />,
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
        ...defaultArgs,
        rowClassName: (row) => (row.active ? undefined : 'rowDanger'),
        rowStyle: (row) => (row.salary > 60000 ? { fontWeight: 700 } : undefined),
    },
}

export const LoadingPropAcceptedButIgnored: Story = {
    parameters: {
        docs: {
            description: {
                story:
                    'BASELINE ANOMALY: `loading` is declared in TableProps (types.ts) but never consumed by ' +
                    'Table.tsx, so passing it changes nothing. Documented intentionally; no loading state exists.',
            },
        },
    },
    args: {
        ...defaultArgs,
        loading: true,
    },
}
