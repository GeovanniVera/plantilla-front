import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { MemoryRouter } from 'react-router'
import { LuBlocks, LuMonitor, LuSmartphone, LuPalette, LuFileText } from 'react-icons/lu'
import NavGroup from './NavGroup'
import NavItem from './NavItem'
import { SidebarContext } from './context'

const meta: Meta<typeof NavGroup> = {
    title: 'Navigation/Sidebar/NavGroup',
    component: NavGroup,
    tags: ['autodocs'],
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
}

export default meta
type Story = StoryObj<typeof NavGroup>

export const Closed: Story = {
    args: {
        icon: LuBlocks,
        label: 'Componentes',
        open: false,
        active: false,
        onToggle: () => {},
        children: (
            <>
                <NavItem to="/componentes/web" icon={LuMonitor} label="Web" />
                <NavItem to="/componentes/movil" icon={LuSmartphone} label="Móvil" />
            </>
        ),
    },
}

export const Open: Story = {
    args: {
        icon: LuBlocks,
        label: 'Componentes',
        open: true,
        active: true,
        onToggle: () => {},
        children: (
            <>
                <NavItem to="/componentes/web" icon={LuMonitor} label="Web" active />
                <NavItem to="/componentes/movil" icon={LuSmartphone} label="Móvil" />
            </>
        ),
    },
}

export const Collapsed: Story = {
    decorators: [
        (Story) => (
            <MemoryRouter>
                <SidebarContext.Provider value={{ expanded: false, toggleExpanded: () => {} }}>
                    <div style={{ width: 80, background: 'var(--bg)', padding: 12 }}>
                        <Story />
                    </div>
                </SidebarContext.Provider>
            </MemoryRouter>
        ),
    ],
    args: {
        icon: LuBlocks,
        label: 'Componentes',
        open: false,
        active: false,
        onToggle: () => {},
        children: (
            <>
                <NavItem to="/componentes/web" icon={LuMonitor} label="Web" />
                <NavItem to="/componentes/movil" icon={LuSmartphone} label="Móvil" />
            </>
        ),
    },
}

export const Interactive: Story = {
    render: function InteractiveStory() {
        const [open, setOpen] = useState(false)
        return (
            <NavGroup
                icon={LuPalette}
                label="Diseño"
                open={open}
                active={open}
                onToggle={() => setOpen(!open)}
            >
                <NavItem to="/diseno/colores" icon={LuPalette} label="Colores" active={open} />
                <NavItem to="/diseno/tipografia" icon={LuFileText} label="Tipografía" />
                <NavItem to="/diseno/iconos" icon={LuMonitor} label="Iconos" />
                <NavItem to="/diseno/espaciado" icon={LuSmartphone} label="Espaciado" />
            </NavGroup>
        )
    },
}
