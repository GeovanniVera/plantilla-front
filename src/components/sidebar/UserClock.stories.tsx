import type { Meta, StoryObj } from '@storybook/react-vite'
import UserClock from './UserClock'
import { SidebarContext } from './context'

const meta: Meta<typeof UserClock> = {
    title: 'Sidebar/UserClock',
    component: UserClock,
    tags: ['autodocs'],
    decorators: [
        (Story) => (
            <SidebarContext.Provider value={{ expanded: true, toggleExpanded: () => {} }}>
                <div style={{ width: 240, background: 'var(--bg)', padding: 12 }}>
                    <Story />
                </div>
            </SidebarContext.Provider>
        ),
    ],
}

export default meta
type Story = StoryObj<typeof UserClock>

export const Default: Story = {}
