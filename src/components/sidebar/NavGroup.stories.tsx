import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { MemoryRouter } from 'react-router'
import { LuBlocks, LuMonitor, LuSmartphone, LuPalette, LuFileText } from 'react-icons/lu'
import NavGroup from './NavGroup'

const meta: Meta<typeof NavGroup> = {
    title: 'Sidebar/NavGroup',
    component: NavGroup,
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
type Story = StoryObj<typeof NavGroup>

const sampleGroup = {
    id: 'componentes',
    icon: LuBlocks,
    label: 'Componentes',
    basePath: '/componentes',
    children: [
        { to: '/componentes/web', icon: LuMonitor, label: 'Web' },
        { to: '/componentes/movil', icon: LuSmartphone, label: 'Móvil' },
    ],
}

const largeGroup = {
    id: 'diseno',
    icon: LuPalette,
    label: 'Diseño',
    basePath: '/diseno',
    children: [
        { to: '/diseno/colores', icon: LuPalette, label: 'Colores' },
        { to: '/diseno/tipografia', icon: LuFileText, label: 'Tipografía' },
        { to: '/diseno/iconos', icon: LuMonitor, label: 'Iconos' },
        { to: '/diseno/espaciado', icon: LuSmartphone, label: 'Espaciado' },
    ],
}

export const Closed: Story = {
    args: {
        group: sampleGroup,
        open: false,
        active: false,
        expanded: true,
        onToggle: () => {},
        isChildActive: () => false,
    },
}

export const Open: Story = {
    args: {
        group: sampleGroup,
        open: true,
        active: true,
        expanded: true,
        onToggle: () => {},
        isChildActive: (path: string) => path === '/componentes/web',
    },
}

export const Collapsed: Story = {
    args: {
        group: sampleGroup,
        open: false,
        active: false,
        expanded: false,
        onToggle: () => {},
        isChildActive: () => false,
    },
}

export const Interactive: Story = {
    render: function InteractiveStory() {
        const [open, setOpen] = useState(false)
        return (
            <NavGroup
                group={largeGroup}
                open={open}
                active={open}
                expanded={true}
                onToggle={() => setOpen(!open)}
                isChildActive={(path) => path === '/diseno/colores'}
            />
        )
    },
}
