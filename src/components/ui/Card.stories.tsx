import type { Meta, StoryObj } from '@storybook/react-vite'
import Card from './Card'

const meta: Meta<typeof Card> = {
    title: 'UI/Card',
    component: Card,
    tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Card>

export const WithTitle: Story = {
    args: {
        title: 'Card Title',
        children: (
            <p style={{ margin: 0, fontSize: 14, color: 'var(--text)' }}>
                Contenido de ejemplo dentro de una tarjeta reutilizable.
            </p>
        ),
    },
}

export const WithoutTitle: Story = {
    args: {
        children: (
            <p style={{ margin: 0, fontSize: 14, color: 'var(--text)' }}>
                Tarjeta sin título, solo contenido.
            </p>
        ),
    },
}
