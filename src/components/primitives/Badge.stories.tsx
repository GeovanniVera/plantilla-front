import type { Meta, StoryObj } from '@storybook/react-vite'
import { LuCheck, LuTriangleAlert, LuInfo } from 'react-icons/lu'
import Badge from './Badge'

const meta: Meta<typeof Badge> = {
    title: 'Primitives/Badge',
    component: Badge,
    tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Badge>

export const Default: Story = {
    args: {
        children: 'Default',
        variant: 'default',
    },
}

export const Success: Story = {
    args: {
        children: 'Success',
        variant: 'success',
    },
}

export const Warning: Story = {
    args: {
        children: 'Warning',
        variant: 'warning',
    },
}

export const Info: Story = {
    args: {
        children: 'Info',
        variant: 'info',
    },
}

export const WithIcon: Story = {
    render: () => (
        <div style={{ display: 'flex', gap: 8 }}>
            <Badge variant="success">
                <Badge.Icon><LuCheck size={12} /></Badge.Icon>
                Activo
            </Badge>
            <Badge variant="warning">
                <Badge.Icon><LuTriangleAlert size={12} /></Badge.Icon>
                Pendiente
            </Badge>
            <Badge variant="info">
                <Badge.Icon><LuInfo size={12} /></Badge.Icon>
                Info
            </Badge>
        </div>
    ),
}

export const AllVariants: Story = {
    render: () => (
        <div style={{ display: 'flex', gap: 8 }}>
            <Badge>Default</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="info">Info</Badge>
        </div>
    ),
}
