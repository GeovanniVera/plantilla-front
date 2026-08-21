import type { Meta, StoryObj } from '@storybook/react-vite'
import UserAvatar from './UserAvatar'

const meta: Meta<typeof UserAvatar> = {
    title: 'Sidebar/UserAvatar',
    component: UserAvatar,
    tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof UserAvatar>

export const Collapsed: Story = {
    args: {
        name: 'Alejandro',
        expanded: false,
    },
}

export const Expanded: Story = {
    args: {
        name: 'Alejandro',
        expanded: true,
    },
}
