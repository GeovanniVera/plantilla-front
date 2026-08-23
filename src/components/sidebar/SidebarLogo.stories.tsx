import type { Meta, StoryObj } from '@storybook/react-vite'
import { MemoryRouter } from 'react-router'
import SidebarLogo from './SidebarLogo'
import { SidebarContext } from './context'

const meta: Meta<typeof SidebarLogo> = {
    title: 'Sidebar/Logo',
    component: SidebarLogo,
    tags: ['autodocs'],
    decorators: [
        (Story) => (
            <MemoryRouter>
                <SidebarContext.Provider value={{ expanded: false, toggleExpanded: () => {} }}>
                    <div style={{ width: 240, background: 'var(--bg)', padding: 12 }}>
                        <Story />
                    </div>
                </SidebarContext.Provider>
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
    },
}

export const Expanded: Story = {
    decorators: [
        (Story) => (
            <MemoryRouter>
                <SidebarContext.Provider value={{ expanded: true, toggleExpanded: () => {} }}>
                    <div style={{ width: 240, background: 'var(--bg)', padding: 12 }}>
                        <Story />
                    </div>
                </SidebarContext.Provider>
            </MemoryRouter>
        ),
    ],
    args: {
        src: '/logo.svg',
        name: 'Semilla Tecnológica',
    },
}
