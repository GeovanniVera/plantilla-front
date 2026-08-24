import { useState } from 'react'
import { expect, userEvent, within } from 'storybook/test'
import { LuUser, LuSettings, LuBell } from 'react-icons/lu'
import { Tabs } from '../Tabs'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof Tabs> = {
    title: 'Navigation/Tabs',
    component: Tabs,
    tags: ['autodocs'],
}
export default meta

interface TabsDemoProps {
    variant?: 'underline' | 'pills' | 'enclosed'
    disabledTab?: boolean
}

function TabsDemo({ variant = 'underline', disabledTab = false }: TabsDemoProps) {
    const [active, setActive] = useState('perfil')
    return (
        <Tabs value={active} onChange={setActive} variant={variant}>
            <Tabs.List>
                <Tabs.Trigger value="perfil" icon={<LuUser />}>Perfil</Tabs.Trigger>
                <Tabs.Trigger value="ajustes" icon={<LuSettings />}>Ajustes</Tabs.Trigger>
                <Tabs.Trigger value="alertas" icon={<LuBell />} disabled={disabledTab}>Alertas</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Panel value="perfil">
                <p>Contenido de Perfil.</p>
            </Tabs.Panel>
            <Tabs.Panel value="ajustes">
                <p>Contenido de Ajustes.</p>
            </Tabs.Panel>
        </Tabs>
    )
}

export const Underline: StoryObj<TabsDemoProps> = {
    render: (args) => <TabsDemo {...args} />,
}

export const Pills: StoryObj<TabsDemoProps> = {
    render: (args) => <TabsDemo {...args} />,
    args: { variant: 'pills' },
}

export const Enclosed: StoryObj<TabsDemoProps> = {
    render: (args) => <TabsDemo {...args} />,
    args: { variant: 'enclosed' },
}

export const WithDisabledTab: StoryObj<TabsDemoProps> = {
    render: (args) => <TabsDemo {...args} />,
    args: { disabledTab: true },
}

/** Clicking a tab activates it and swaps the panel. */
export const SwitchingInteraction: StoryObj<TabsDemoProps> = {
    render: (args) => <TabsDemo {...args} />,
    play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
        const canvas = within(canvasElement)
        await userEvent.click(canvas.getByText('Ajustes'))
        await expect(canvas.getByText('Contenido de Ajustes.')).not.toBeNull()
        await expect(canvas.queryByText('Contenido de Perfil.')).toBeNull()

        await userEvent.click(canvas.getByText('Perfil'))
        await expect(canvas.getByText('Contenido de Perfil.')).not.toBeNull()
    },
}

/** Disabled tabs ignore clicks and keyboard activation. */
export const DisabledTabDoesNotActivate: StoryObj<TabsDemoProps> = {
    render: (args) => <TabsDemo {...args} />,
    args: { disabledTab: true },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement)
        await userEvent.click(canvas.getByText('Alertas'))
        await expect(canvas.queryByText('Contenido de Ajustes.')).toBeNull()
        // Panel for perfil stays active
        await expect(canvas.getAllByRole('tabpanel').length).toBe(1)
    },
}
