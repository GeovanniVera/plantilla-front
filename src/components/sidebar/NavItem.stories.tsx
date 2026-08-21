import type { Meta, StoryObj } from '@storybook/react-vite'
import { MemoryRouter } from 'react-router'
import { LuHouse, LuLogOut } from 'react-icons/lu'
import NavItem from './NavItem'

const meta: Meta<typeof NavItem> = {
    title: 'Sidebar/NavItem',
    component: NavItem,
    tags: ['autodocs'],
    decorators: [
        (Story) => (
            <MemoryRouter>
                <div style={{ width: 240, background: 'var(--bg)', padding: 12 }}>
                    <Story />
                </div>
            </MemoryRouter>
        ),
    ],
}

export default meta
type Story = StoryObj<typeof NavItem>

export const Default: Story = {
    args: {
        item: { to: '/', icon: LuHouse, label: 'Inicio' },
        active: false,
        expanded: true,
    },
}

export const Active: Story = {
    args: {
        item: { to: '/', icon: LuHouse, label: 'Inicio' },
        active: true,
        expanded: true,
    },
}

export const Collapsed: Story = {
    args: {
        item: { to: '/', icon: LuHouse, label: 'Inicio' },
        active: false,
        expanded: false,
    },
}

export const Danger: Story = {
    args: {
        item: { to: '/logout', icon: LuLogOut, label: 'Cerrar sesión', danger: true },
        active: false,
        expanded: true,
    },
}
