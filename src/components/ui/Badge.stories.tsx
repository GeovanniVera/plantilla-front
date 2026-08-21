import type { Meta, StoryObj } from '@storybook/react-vite'
import Badge from './Badge'

const meta: Meta<typeof Badge> = {
    title: 'UI/Badge',
    component: Badge,
    tags: ['autodocs'],
    argTypes: {
        variant: {
            control: 'select',
            options: ['default', 'success', 'warning', 'info'],
        },
    },
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
