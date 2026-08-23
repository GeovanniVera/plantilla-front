import type { Meta, StoryObj } from '@storybook/react-vite'
import UserAvatar from './UserAvatar'
import { SidebarContext } from './context'

const meta: Meta<typeof UserAvatar> = {
    title: 'Sidebar/UserAvatar',
    component: UserAvatar,
    tags: ['autodocs'],
    decorators: [
        (Story) => (
            <SidebarContext.Provider value={{ expanded: false, toggleExpanded: () => {} }}>
                <div style={{ width: 240, background: 'var(--bg)', padding: 12 }}>
                    <Story />
                </div>
            </SidebarContext.Provider>
        ),
    ],
}

export default meta
type Story = StoryObj<typeof UserAvatar>

export const Collapsed: Story = {
    args: {
        name: 'Alejandro',
    },
}

export const Expanded: Story = {
    decorators: [
        (Story) => (
            <SidebarContext.Provider value={{ expanded: true, toggleExpanded: () => {} }}>
                <div style={{ width: 240, background: 'var(--bg)', padding: 12 }}>
                    <Story />
                </div>
            </SidebarContext.Provider>
        ),
    ],
    args: {
        name: 'Alejandro',
    },
}
