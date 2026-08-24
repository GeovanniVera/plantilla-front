import { expect, fireEvent, userEvent, within } from 'storybook/test'
import { useState } from 'react'
import { DatePicker } from '../Calendar'

import type { Meta, StoryObj } from '@storybook/react-vite'

// ─── Shared helpers ───────────────────────────────────────
/** Clipping container simulating Card's overflow-hidden + tight height. */
function ClippingCard({ children }: { children: React.ReactNode }) {
    return (
        <div
            data-testid="clipping-card"
            style={{ overflow: 'hidden', height: 120, border: '1px solid var(--border)', borderRadius: 12, padding: 8 }}
        >
            {children}
        </div>
    )
}

const getPortalDialog = () => document.body.querySelector('[role="dialog"][class*="animate-popover-in"]')

interface ControlledProps {
    placeholder?: string
}

/** Wrapper storing the picked value so trigger labels update. */
function ControlledDatePicker({ placeholder }: ControlledProps) {
    const [value, setValue] = useState<Date | undefined>(undefined)
    return <DatePicker value={value} onChange={setValue} placeholder={placeholder} />
}

const meta: Meta<typeof DatePicker> = {
    title: 'Data Display/Calendar/DatePicker',
    component: DatePicker,
    tags: ['autodocs'],
}
export default meta

export const Default: StoryObj<typeof DatePicker> = {}

export const WithValue: StoryObj<typeof DatePicker> = {
    args: { value: new Date() },
    play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
        // Selected value renders formatted in the trigger
        await expect(/\d{2}\/\d{2}\/\d{4}/.test(within(canvasElement).getByRole('button').textContent ?? '')).toBe(true)
    },
}

/** Only future dates are enabled (minDate = today). */
export const FutureOnly: StoryObj<typeof DatePicker> = {
    args: { minDate: new Date(), placeholder: 'Solo fechas futuras' },
    play: async () => {
        await userEvent.click(document.body.querySelector('[aria-haspopup="dialog"]')!)
        await expect(document.querySelectorAll('.rdp-day_button[disabled]').length).toBeGreaterThan(0)
    },
}

/* ══════════════════════════════════════════════════════
   PORTAL REGRESSION (phase 7A/7B): the popover must mount as a direct
   child of document.body — never inside an overflow-hidden container. */
export const PortalEscapesClippingCard: StoryObj<typeof DatePicker> = {
    render: () => (
        <ClippingCard>
            <DatePicker placeholder="Popover fuera de la Card" />
        </ClippingCard>
    ),
    play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
        const canvas = within(canvasElement)
        await userEvent.click(canvas.getByText('Popover fuera de la Card'))

        const dialog = getPortalDialog()
        await expect(dialog).toBeTruthy()

        // Mounted OUTSIDE the clipping card: direct child of body
        await expect(dialog!.parentElement).toBe(document.body)
        // And NOT a descendant of the clipping container
        await expect(canvasElement.querySelector('[data-testid="clipping-card"]')!.contains(dialog!)).toBe(false)

        // role=dialog + fixed positioning + coherent z-index
        await expect(dialog!.getAttribute('role')).toBe('dialog')
        const cs = getComputedStyle(dialog!)
        await expect(cs.position).toBe('fixed')
    },
}

/** aria-expanded toggles with open state. */
export const AriaExpandedToggles: StoryObj<typeof DatePicker> = {
    play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
        const canvas = within(canvasElement)
        const trigger = canvas.getByRole('button', { name: /Seleccionar fecha/ })
        await expect(trigger.getAttribute('aria-expanded')).toBe('false')

        await userEvent.click(trigger)
        await expect(trigger.getAttribute('aria-expanded')).toBe('true')

        fireEvent.keyDown(document, { key: 'Escape' })
        await expect(trigger.getAttribute('aria-expanded')).toBe('false')
    },
}

/** Selecting a date closes the popover and shows the formatted value. */
export const SelectDateCloses: StoryObj<typeof DatePicker> = {
    render: () => <ControlledDatePicker />,
    play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
        const canvas = within(canvasElement)
        await userEvent.click(canvas.getByText('Seleccionar fecha'))

        const pop = getPortalDialog()!
        const day = pop.querySelector<HTMLButtonElement>('.rdp-day_button:not([disabled])')
        await userEvent.click(day!)
        await expect(getPortalDialog()).toBeNull()

        // Trigger now shows the picked date (controlled wrapper stores it)
        const btn = within(canvasElement).getByRole('button')
        await expect(/\d{2}\/\d{2}\/\d{4}/.test(btn.textContent ?? '')).toBe(true)
    },
}

export const EscapeCloses: StoryObj<typeof DatePicker> = {
    play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
        await userEvent.click(within(canvasElement).getByText('Seleccionar fecha'))
        await expect(getPortalDialog()).not.toBeNull()

        fireEvent.keyDown(document, { key: 'Escape' })
        await expect(getPortalDialog()).toBeNull()
    },
}

export const ClickOutsideCloses: StoryObj<typeof DatePicker> = {
    play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
        await userEvent.click(within(canvasElement).getByText('Seleccionar fecha'))
        await expect(getPortalDialog()).not.toBeNull()

        // mousedown outside trigger/popover closes it
        fireEvent.mouseDown(document.body)
        await expect(getPortalDialog()).toBeNull()
    },
}

/** Positioning is computed against the viewport (fixed, non-negative). */
export const PositionIsComputed: StoryObj<typeof DatePicker> = {
    play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
        await userEvent.click(within(canvasElement).getByText('Seleccionar fecha'))
        const dialog = getPortalDialog()!
        const cs = getComputedStyle(dialog)
        await expect(cs.position).toBe('fixed')
        await expect(parseInt(cs.top)).toBeGreaterThanOrEqual(0)
        await expect(parseInt(cs.left)).toBeGreaterThanOrEqual(0)
        await expect(parseInt(cs.zIndex)).toBeGreaterThan(0)
    },
}
