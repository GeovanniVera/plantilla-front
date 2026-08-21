import type { Meta, StoryObj } from '@storybook/react-vite'
import Button from './Button'

const meta: Meta<typeof Button> = {
    title: 'UI/Button',
    component: Button,
    tags: ['autodocs'],
    argTypes: {
        variant: {
            control: 'select',
            options: ['primary', 'secondary', 'ghost'],
        },
        size: {
            control: 'select',
            options: ['sm', 'md', 'lg'],
        },
    },
}

export default meta
type Story = StoryObj<typeof Button>

export const Primary: Story = {
    args: {
        children: 'Primary',
        variant: 'primary',
    },
}

export const Secondary: Story = {
    args: {
        children: 'Secondary',
        variant: 'secondary',
    },
}

export const Ghost: Story = {
    args: {
        children: 'Ghost',
        variant: 'ghost',
    },
}

export const Small: Story = {
    args: {
        children: 'Small',
        size: 'sm',
    },
}

export const Large: Story = {
    args: {
        children: 'Large',
        size: 'lg',
    },
}

export const AllVariants: Story = {
    render: () => (
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
        </div>
    ),
}

export const AllSizes: Story = {
    render: () => (
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
        </div>
    ),
}
