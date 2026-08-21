import type { Meta, StoryObj } from '@storybook/react-vite'
import { MemoryRouter } from 'react-router'
import SidebarLogo from './SidebarLogo'

const meta: Meta<typeof SidebarLogo> = {
    title: 'Sidebar/Logo',
    component: SidebarLogo,
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
type Story = StoryObj<typeof SidebarLogo>

export const Collapsed: Story = {
    args: {
        src: '/logo.svg',
        name: 'Semilla Tecnológica',
        expanded: false,
    },
}

export const Expanded: Story = {
    args: {
        src: '/logo.svg',
        name: 'Semilla Tecnológica',
        expanded: true,
    },
}
