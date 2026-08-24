import { StatusDot } from '../StatusDot'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof StatusDot> = {
    title: 'Primitives/StatusDot',
    component: StatusDot,
    tags: ['autodocs'],
}
export default meta

// ─── Semantic colors (dot variant) ────────────────────────
export const Green: StoryObj<typeof StatusDot> = {
    args: { color: 'green', variant: 'dot', size: 'md' },
}

export const Yellow: StoryObj<typeof StatusDot> = {
    args: { color: 'yellow', variant: 'dot', size: 'md' },
}

export const Red: StoryObj<typeof StatusDot> = {
    args: { color: 'red', variant: 'dot', size: 'md' },
}

export const Blue: StoryObj<typeof StatusDot> = {
    args: { color: 'blue', variant: 'dot', size: 'md' },
}

export const Gray: StoryObj<typeof StatusDot> = {
    args: { color: 'gray', variant: 'dot', size: 'md' },
}

// ─── With label ───────────────────────────────────────────
export const WithLabels: StoryObj<typeof StatusDot> = {
    render: () => (
        <div className="flex flex-col gap-2">
            <StatusDot color="green" label="Activo" />
            <StatusDot color="yellow" label="Pendiente" size="sm" />
            <StatusDot color="red" label="Error" />
            <StatusDot color="blue" label="En progreso" />
        </div>
    ),
}

// ─── Badge / full variants ────────────────────────────────
export const BadgeVariant: StoryObj<typeof StatusDot> = {
    render: () => (
        <div className="flex flex-col gap-3">
            <StatusDot color="green" variant="badge" label="Conectado" />
            <StatusDot color="yellow" variant="badge" label="Sincronizando" size="sm" />
            <StatusDot color="red" variant="badge" label="Desconectado" />
            <StatusDot color="blue" variant="badge" label="Actualizando" size="sm" />
        </div>
    ),
}

export const FullVariant: StoryObj<typeof StatusDot> = {
    render: () => (
        <div className="flex flex-col gap-3">
            <StatusDot color="green" variant="full" label="Operativo" />
            <StatusDot color="red" variant="full" label="Caído" size="sm" />
        </div>
    ),
}
