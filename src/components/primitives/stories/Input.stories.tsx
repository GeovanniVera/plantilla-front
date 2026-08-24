import { useState } from 'react'
import { expect, userEvent, within } from 'storybook/test'
import { LuSearch } from 'react-icons/lu'
import Input from '../Input'
import FormField from '@components/forms/FormField'

import type { Meta, StoryObj } from '@storybook/react-vite'
import type { InputProps } from '@components/forms/types'

const meta: Meta<InputProps> = {
    title: 'Primitives/Input',
    component: Input,
    tags: ['autodocs'],
    // Shared contract defaults so every story satisfies the controlled API.
    args: { value: '', onChange: () => {} },
}
export default meta


export const Basic: StoryObj<InputProps> = {
    args: { placeholder: 'Escribe algo…' },
}

export const WithStartIcon: StoryObj<InputProps> = {
    render: (args) => (
        <Input
            {...args}
            startAdornment={<LuSearch />}
            startAdornmentVariant="plain"
            placeholder="Buscar…"
        />
    ),
    args: { value: '' },
}

/** Boxed dark addon glued to the control — one visual unit. */
export const DarkStartAddon: StoryObj<InputProps> = {
    render: (args) => (
        <Input
            {...args}
            startAdornment={<LuSearch />}
            startAdornmentVariant="dark"
            placeholder="Buscar…"
        />
    ),
    args: { value: '' },
}

export const SubtleStartAddon: StoryObj<InputProps> = {
    render: (args) => (
        <Input
            {...args}
            startAdornment={<LuSearch />}
            startAdornmentVariant="subtle"
            placeholder="Buscar…"
        />
    ),
    args: { value: '' },
}

export const AccentStartAddon: StoryObj<InputProps> = {
    render: (args) => (
        <Input
            {...args}
            startAdornment={<LuSearch />}
            startAdornmentVariant="accent"
            placeholder="Buscar…"
        />
    ),
    args: { value: '' },
}

/** Decorative end content (suffix) — pointer-events suppressed. */
export const WithEndAdornment: StoryObj<InputProps> = {
    render: (args) => (
        <Input
            {...args}
            endAdornment={<span className="text-xs opacity-60">kg</span>}
            placeholder="Peso"
        />
    ),
    args: { value: '' },
}

interface ClearableDemoProps {
    label?: string
}

function ClearableDemo({ label = 'Limpiar' }: ClearableDemoProps) {
    const [value, setValue] = useState('Texto a borrar')
    return (
        <Input
            value={value}
            onChange={setValue}
            placeholder="Escribe…"
            endAction={
                <button
                    type="button"
                    className="border-none bg-transparent cursor-pointer text-xs text-accent"
                    aria-label={label}
                    onClick={() => setValue('')}
                >
                    {label}
                </button>
            }
        />
    )
}

/** Interactive endAction slot with callback coverage. */
export const WithEndAction: StoryObj<ClearableDemoProps> = {
    render: () => <ClearableDemo />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement)
        const input = canvas.getByRole('textbox')
        await expect((input as HTMLInputElement).value).toBe('Texto a borrar')

        await userEvent.click(canvas.getByRole('button', { name: 'Limpiar' }))
        await expect((input as HTMLInputElement).value).toBe('')
    },
}

/** showPasswordToggle wins over endAction by documented precedence. */
export const Password: StoryObj<InputProps> = {
    render: () => (
        <Input
            type="password"
            showPasswordToggle
            value="secreto123"
            onChange={() => {}}
            placeholder="Contraseña"
        />
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement)
        const input = canvasElement.querySelector('input')!
        await userEvent.click(canvas.getByRole('button'))

        // Toggle flips the effective input type
        await expect(input.getAttribute('type')).toBe('text')
        await userEvent.click(canvas.getByRole('button'))
        await expect(input.getAttribute('type')).toBe('password')
    },
}

export const BothSides: StoryObj<InputProps> = {
    render: () => (
        <Input
            value=""
            onChange={() => {}}
            placeholder="Filtrar por nombre"
            startAdornment={<LuSearch />}
            startAdornmentVariant="plain"
            endAdornment={<span className="text-xs opacity-60">máx. 40</span>}
        />
    ),
}

export const Disabled: StoryObj<InputProps> = {
    render: () => <Input value="" onChange={() => {}} disabled placeholder="Deshabilitado" />,
}

export const ReadOnly: StoryObj<InputProps> = {
    render: () => <Input value="Valor de solo lectura" onChange={() => {}} readOnly />,
}

export const Sizes: StoryObj<InputProps> = {
    render: () => (
        <div className="flex flex-col gap-3 w-72">
            <Input size="sm" value="" onChange={() => {}} placeholder="sm" />
            <Input size="md" value="" onChange={() => {}} placeholder="md" />
        </div>
    ),
}

export const Variants: StoryObj<InputProps> = {
    render: () => (
        <div className="flex flex-col gap-3 w-72">
            <Input variant="default" value="" onChange={() => {}} placeholder="default" />
            <Input variant="filled" value="" onChange={() => {}} placeholder="filled" />
            <Input variant="outlined" value="" onChange={() => {}} placeholder="outlined" />
        </div>
    ),
}

/** Error state flows through FormField's data-variant bridge onto the shell. */
export const ErrorViaFormField: StoryObj<typeof Input> = {
    render: () => (
        <FormField label="Correo" required error="Introduce un correo válido">
            <Input
                value="no-es-email"
                onChange={() => {}}
                variant="default"
                placeholder="Correo electrónico"
                startAdornment={<LuSearch />}
            />
        </FormField>
    ),
    play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
        const canvas = within(canvasElement)
        const body = within(document.body)

        const input = canvas.getByPlaceholderText('Correo electrónico')

        // Decorated path: the SHELL carries data-variant + owns the border,
        // so FormField's error bridge paints the whole unit.
        const shell = input.parentElement!
        await expect(shell.getAttribute('data-variant')).toBe('default')
        await expect(getComputedStyle(shell).borderColor).not.toBe('')

        await expect(body.getAllByText(/correo válido|Introduce/i).length).toBeGreaterThan(0)
    },
}

/** All start-addon variants side by side for visual comparison. */
export const AddonShowcase: StoryObj<InputProps> = {
    render: () => (
        <div className="flex flex-col gap-4 w-80">
            <Input value="" onChange={() => {}} placeholder="plain" startAdornment={<LuSearch />} startAdornmentVariant="plain" />
            <Input value="" onChange={() => {}} placeholder="subtle" startAdornment={<LuSearch />} startAdornmentVariant="subtle" />
            <Input value="" onChange={() => {}} placeholder="accent" startAdornment={<LuSearch />} startAdornmentVariant="accent" />
            <Input value="" onChange={() => {}} placeholder="dark" startAdornment={<LuSearch />} startAdornmentVariant="dark" />
        </div>
    ),
}
