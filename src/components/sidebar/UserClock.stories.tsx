import type { Meta, StoryObj } from '@storybook/react-vite'
import UserClock from './UserClock'

const meta: Meta<typeof UserClock> = {
    title: 'Sidebar/UserClock',
    component: UserClock,
    tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof UserClock>

export const Default: Story = {
    args: {
        expanded: true,
    },
}
