import { useState } from 'react'
import { expect, userEvent, within } from 'storybook/test'
import { DrawerStack } from '../DrawerStack'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof DrawerStack> = {
    title: 'Overlays/DrawerStack',
    component: DrawerStack,
    tags: ['autodocs'],
}
export default meta

interface StackDemoProps {
    initialLevel?: number
    breadcrumbs?: { label: string; level: number }[]
    paragraphs?: number
}

/** Controlled wrapper: children can push to the next level. */
function StackDemo({ initialLevel = 0, breadcrumbs, paragraphs = 1 }: StackDemoProps) {
    const [isOpen, setIsOpen] = useState(true)
    const [level, setLevel] = useState(initialLevel)

    return (
        <>
            <button className="border rounded-md px-3 py-1.5 cursor-pointer" onClick={() => { setIsOpen(true); setLevel(initialLevel) }}>
                Abrir stack
            </button>
            <DrawerStack
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                level={level}
                onBack={() => setLevel((l) => Math.max(0, l - 1))}
                onNavigate={(l) => setLevel(l)}
                breadcrumbs={breadcrumbs}
                title={`Nivel ${level}`}
                width={520}
            >
                <div data-testid="stack-content">
                    <p className="mb-3">Contenido del nivel {level}.</p>
                    <button
                        className="border rounded-md px-3 py-1.5 cursor-pointer"
                        onClick={() => setLevel((l) => l + 1)}
                    >
                        Avanzar al nivel {level + 1}
                    </button>
                    {Array.from({ length: paragraphs }).map((_, i) => (
                        <p key={i} className="mt-3">Párrafo de relleno {i + 1}.</p>
                    ))}
                </div>
            </DrawerStack>
        </>
    )
}

export const InitialLevel: StoryObj<StackDemoProps> = {
    render: () => <StackDemo />,
}

/** Regression for hotfix 7b192b0: the scrollable content container must keep
 * padding 24px horizontal / 20px vertical, overflow-y auto and overflow-x
 * hidden — verified against COMPUTED styles, not class names. */
export const ContentPaddingRegression: StoryObj<StackDemoProps> = {
    render: () => <StackDemo paragraphs={30} />,
    play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
        const canvas = within(canvasElement)
        await userEvent.click(canvas.getByText('Abrir stack'))
        const body = within(document.body)

        const content = body.getByTestId('stack-content')

        // Walk up to the scrollable container DrawerStack owns.
        let node: HTMLElement | null = content.parentElement
        let scroller: HTMLElement | null = null
        while (node && node !== document.body) {
            if (getComputedStyle(node).overflowY === 'auto') {
                scroller = node
                break
            }
            node = node.parentElement
        }
        await expect(scroller).toBeTruthy()

        const cs = getComputedStyle(scroller!)
        await expect(cs.paddingLeft).toBe('24px')
        await expect(cs.paddingRight).toBe('24px')
        await expect(cs.paddingTop).toBe('20px')
        await expect(cs.overflowY).toBe('auto')
        await expect(cs.overflowX).toBe('hidden')
    },
}

/** Forward navigation renders the back button and level indicator. */
export const NavigateForwardAndBack: StoryObj<StackDemoProps> = {
    render: () => <StackDemo />,
    play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
        const canvas = within(canvasElement)
        await userEvent.click(canvas.getByText('Abrir stack'))
        const body = within(document.body)

        // No back button at level 0
        await expect(body.queryByTitle('Volver')).toBeNull()

        // Push to level 1 via in-content action
        await userEvent.click(body.getByText('Avanzar al nivel 1'))
        const backBtn = body.getByTitle('Volver')
        await expect(backBtn).toBeTruthy()
        await expect(body.getByText('Contenido del nivel 1.')).not.toBeNull()

        // Pop back to level 0
        await userEvent.click(backBtn)
        await expect(body.getByText('Contenido del nivel 0.')).not.toBeNull()
        await expect(body.queryByTitle('Volver')).toBeNull()
    },
}

/** Breadcrumbs render a nav path; non-last crumbs navigate. */
export const WithBreadcrumbs: StoryObj<StackDemoProps> = {
    render: () => (
        <StackDemo
            initialLevel={2}
            breadcrumbs={[
                { label: 'Raíz', level: 0 },
                { label: 'Sección', level: 1 },
                { label: 'Detalle', level: 2 },
            ]}
        />
    ),
    play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
        await userEvent.click(within(canvasElement).getByText('Abrir stack'))
        const body = within(document.body)

        // Current level renders as plain text; earlier crumbs are buttons
        await expect(body.getByText('Detalle')).not.toBeNull()
        await userEvent.click(body.getByText('Raíz'))
        await expect(body.getByText('Contenido del nivel 0.')).not.toBeNull()
    },
}

/** Long content scrolls instead of overflowing the panel. */
export const LongContentScrolls: StoryObj<StackDemoProps> = {
    render: () => <StackDemo paragraphs={40} />,
}
