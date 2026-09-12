import { useRef, useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { LuSearch } from 'react-icons/lu';
import Select, { SelectBase } from '../Select';
import FormField from '@components/forms/FormField';

import type { Meta, StoryObj } from '@storybook/react-vite';
import type { SelectProps } from '@components/forms/types';

const OPTIONS = [
  { value: 'es', label: 'España' },
  { value: 'mx', label: 'México' },
  { value: 'ar', label: 'Argentina' },
];

const meta: Meta<SelectProps> = {
  title: 'Primitives/Select',
  component: Select,
  tags: ['autodocs'],
  // Shared contract defaults so every story satisfies the controlled API.
  args: { value: '', onChange: () => {}, options: OPTIONS },
};
export default meta;

export const Basic: StoryObj<SelectProps> = {
  args: { placeholder: 'Seleccionar...' },
};

function RefForwardingDemo() {
  const baseRef = useRef<HTMLSelectElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);
  const [value, setValue] = useState('');

  return (
    <div className="flex w-72 flex-col gap-3">
      <SelectBase
        ref={baseRef}
        aria-label="Native base select"
        defaultValue=""
        required
        onChange={() => {}}
      >
        <option value="">Sin selección</option>
        <option value="a">Option A</option>
        <option value="b">Option B</option>
      </SelectBase>
      <button type="button" onClick={() => baseRef.current?.focus()}>
        Focus base select
      </button>
      <Select
        ref={selectRef}
        value={value}
        onChange={setValue}
        aria-label="Shorthand select"
        options={[{ value: 'x', label: 'Option X' }]}
      />
      <button type="button" onClick={() => selectRef.current?.focus()}>
        Focus shorthand select
      </button>
    </div>
  );
}

export const NativeBaseAndForwardedRef: StoryObj<SelectProps> = {
  render: () => <RefForwardingDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const nativeSelect = canvas.getByRole('combobox', {
      name: 'Native base select',
    }) as HTMLSelectElement;
    await expect(nativeSelect.required).toBe(true);
    // Uncontrolled: defaultValue flows through the native attribute path.
    await expect(nativeSelect.value).toBe('');

    await userEvent.click(canvas.getByRole('button', { name: 'Focus base select' }));
    await expect(nativeSelect).toHaveFocus();

    await userEvent.selectOptions(nativeSelect, ['a']);
    await expect(nativeSelect.value).toBe('a');

    await userEvent.click(canvas.getByRole('button', { name: 'Focus shorthand select' }));
    const shorthand = canvas.getByRole('combobox', {
      name: 'Shorthand select',
    }) as HTMLSelectElement;
    await expect(shorthand).toHaveFocus();
  },
};

export const ShorthandControlled: StoryObj<SelectProps> = {
  render: function ShorthandControlledDemo() {
    const [value, setValue] = useState('es');
    return (
      <div className="w-72">
        <Select
          value={value}
          onChange={setValue}
          options={[
            { value: 'es', label: 'España' },
            { value: 'mx', label: 'México' },
          ]}
          aria-label="Controlled select"
        />
        <output data-testid="controlled-value" className="mt-2 block text-sm">
          {value}
        </output>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const select = canvas.getByRole('combobox', { name: 'Controlled select' }) as HTMLSelectElement;
    await expect(select.value).toBe('es');

    await userEvent.selectOptions(select, 'mx');
    await expect(select.value).toBe('mx');
    // The shorthand contract: onChange receives the string value.
    await expect(canvas.getByTestId('controlled-value')).toHaveTextContent('mx');
  },
};

export const Appearances: StoryObj<SelectProps> = {
  render: () => (
    <div className="flex w-72 flex-col gap-3">
      <Select
        appearance="default"
        value=""
        onChange={() => {}}
        placeholder="Default"
        options={OPTIONS}
        aria-label="Default select"
      />
      <Select
        appearance="filled"
        value=""
        onChange={() => {}}
        placeholder="Filled"
        options={OPTIONS}
        aria-label="Filled select"
      />
      <Select
        appearance="outlined"
        value=""
        onChange={() => {}}
        placeholder="Outlined"
        options={OPTIONS}
        aria-label="Outlined select"
      />
      <Select
        variant="filled"
        value=""
        onChange={() => {}}
        placeholder="Legacy variant alias"
        options={OPTIONS}
        aria-label="Legacy select"
      />
    </div>
  ),
};

export const Sizes: StoryObj<SelectProps> = {
  render: () => (
    <div className="flex w-72 flex-col gap-3">
      <Select
        size="sm"
        value=""
        onChange={() => {}}
        placeholder="sm"
        options={OPTIONS}
        aria-label="Small select"
      />
      <Select
        size="md"
        value=""
        onChange={() => {}}
        placeholder="md"
        options={OPTIONS}
        aria-label="Medium select"
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const selects = Array.from(canvasElement.querySelectorAll('select'));
    // The shell owns the height (border included); the select fills it.
    const [small, medium] = selects.map((select) => select.parentElement!);
    await expect(getComputedStyle(small).height).toBe('32px');
    await expect(getComputedStyle(medium).height).toBe('40px');
  },
};

export const Disabled: StoryObj<SelectProps> = {
  render: () => (
    <Select
      value=""
      onChange={() => {}}
      disabled
      placeholder="Disabled"
      options={OPTIONS}
      aria-label="Disabled select"
    />
  ),
  play: async ({ canvasElement }) => {
    const select = canvasElement.querySelector('select') as HTMLSelectElement;
    await expect(select.disabled).toBe(true);
    expect(getComputedStyle(select).cursor).toBe('not-allowed');
    // Shell reacts to the structural data attribute.
    const shell = select.parentElement!;
    expect(parseFloat(getComputedStyle(shell).opacity)).toBeLessThan(1);
  },
};

export const ValidationStates: StoryObj<SelectProps> = {
  render: () => (
    <div className="flex w-72 flex-col gap-3">
      <Select
        value=""
        onChange={() => {}}
        validationState="invalid"
        placeholder="Invalid"
        options={OPTIONS}
        aria-label="Invalid select"
      />
      <Select
        value="es"
        onChange={() => {}}
        validationState="valid"
        options={OPTIONS}
        aria-label="Valid select"
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const [invalid, valid] = Array.from(canvasElement.querySelectorAll('select'));
    // aria-invalid is derived from the visual axis.
    await expect(invalid).toHaveAttribute('aria-invalid', 'true');
    await expect(valid).not.toHaveAttribute('aria-invalid');

    const invalidShell = invalid.parentElement!;
    await expect(invalidShell).toHaveAttribute('data-validation', 'invalid');
    await expect(getComputedStyle(invalidShell).borderTopColor).not.toBe(
      getComputedStyle(valid.parentElement!).borderTopColor,
    );
  },
};

export const PlaceholderOption: StoryObj<SelectProps> = {
  render: function PlaceholderDemo() {
    const [value, setValue] = useState('');
    return (
      <div className="w-72">
        <Select
          value={value}
          onChange={setValue}
          placeholder="Seleccionar..."
          options={OPTIONS}
          aria-label="Placeholder select"
        />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const select = canvas.getByRole('combobox', {
      name: 'Placeholder select',
    }) as HTMLSelectElement;
    // The placeholder is a real, disabled, semantically empty option.
    const placeholderOption = select.querySelector('option[value=""]') as HTMLOptionElement;
    await expect(placeholderOption.disabled).toBe(true);
    await expect(select).toHaveAttribute('data-placeholder', '');
    await expect(getComputedStyle(select).color).not.toBe(getComputedStyle(document.body).color);

    // Once a value is chosen, the muted placeholder styling disappears.
    await userEvent.selectOptions(select, 'es');
    await expect(select).not.toHaveAttribute('data-placeholder');
  },
};

export const ChevronIsDecorative: StoryObj<SelectProps> = {
  render: () => (
    <Select value="es" onChange={() => {}} options={OPTIONS} aria-label="Chevron select" />
  ),
  play: async ({ canvasElement }) => {
    const select = canvasElement.querySelector('select')!;
    const shell = select.parentElement!;
    // Chevron is a sibling in the flex layout, never absolutely positioned.
    const chevron = shell.lastElementChild as HTMLElement;
    await expect(chevron).toHaveAttribute('aria-hidden', 'true');
    expect(getComputedStyle(chevron).position).toBe('static');
    expect(getComputedStyle(chevron).pointerEvents).toBe('none');
    // And the select itself has no native dropdown chrome (appearance-none).
    expect(getComputedStyle(select).appearance).toBe('none');
  },
};

export const CompoundStructure: StoryObj<SelectProps> = {
  render: () => (
    <Select.Root appearance="outlined" size="sm" validationState="invalid">
      <Select.StartAddon variant="accent" data-testid="start-addon">
        <LuSearch />
      </Select.StartAddon>
      <Select.Control aria-label="Compound select" defaultValue="a" required>
        <option value="a">Option A</option>
        <option value="b">Option B</option>
      </Select.Control>
    </Select.Root>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const control = canvas.getByRole('combobox', { name: 'Compound select' }) as HTMLSelectElement;
    const root = control.parentElement!;

    await expect(root).toHaveAttribute('data-variant', 'outlined');
    await expect(root).toHaveAttribute('data-validation', 'invalid');
    await expect(control).toHaveAttribute('aria-invalid', 'true');
    await expect(control.required).toBe(true);
    await expect(canvas.getByTestId('start-addon')).toHaveAttribute('aria-hidden', 'true');
    // Chrome-free control inside the shell.
    expect(getComputedStyle(control).borderTopWidth).toBe('0px');
  },
};

export const StartAddonVariants: StoryObj<SelectProps> = {
  render: () => (
    <div className="flex w-80 flex-col gap-4">
      <Select
        value="es"
        onChange={() => {}}
        options={OPTIONS}
        startAdornment={<LuSearch />}
        startAdornmentVariant="plain"
        placeholder="Plain"
        aria-label="Plain addon select"
      />
      <Select
        value="es"
        onChange={() => {}}
        options={OPTIONS}
        startAdornment={<LuSearch />}
        startAdornmentVariant="subtle"
        placeholder="Subtle"
        aria-label="Subtle addon select"
      />
      <Select
        value="es"
        onChange={() => {}}
        options={OPTIONS}
        startAdornment={<LuSearch />}
        startAdornmentVariant="accent"
        placeholder="Accent"
        aria-label="Accent addon select"
      />
      <Select
        value="es"
        onChange={() => {}}
        options={OPTIONS}
        startAdornment={<LuSearch />}
        startAdornmentVariant="dark"
        placeholder="Dark"
        aria-label="Dark addon select"
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    // Geometric parity with Input addons: same fixed widths per size.
    const [plain, subtle, accent] = Array.from(
      canvasElement.querySelectorAll('[data-select-control]'),
    ).map((select) => select.previousElementSibling as HTMLElement);
    expect(parseFloat(getComputedStyle(plain).width)).toBeGreaterThan(0);
    for (const boxed of [subtle, accent]) {
      const width = getComputedStyle(boxed).width;
      expect(width === '28px' || width === '32px').toBe(true);
    }
  },
};

export const DecoratedGeometryRegression: StoryObj<SelectProps> = {
  render: () => (
    <Select
      value="es"
      onChange={() => {}}
      options={OPTIONS}
      placeholder="With addon"
      startAdornment={<LuSearch />}
      startAdornmentVariant="accent"
      aria-label="Decorated select"
    />
  ),
  play: async ({ canvasElement }) => {
    const select = canvasElement.querySelector('select')!;
    const control = getComputedStyle(select);
    const shell = getComputedStyle(select.parentElement!);

    // Control keeps its own inline padding (text never touches the addon).
    expect(parseFloat(control.paddingLeft)).toBeGreaterThan(0);

    // Control fills the remaining shell width (flex-1 / min-w-0).
    await expect(parseFloat(control.width)).toBeGreaterThan(100);

    // Shell hosts the unit: full width, visible border, flex layout.
    await expect(parseFloat(shell.width)).toBeGreaterThan(300);
    expect(parseInt(shell.borderTopWidth)).toBeGreaterThanOrEqual(1);
    expect(shell.display).toBe('flex');

    // Fixed-width addon sibling, never absolutely positioned.
    const addon = select.previousElementSibling as HTMLElement;
    expect(getComputedStyle(addon).position).not.toBe('absolute');
  },
};

export const ErrorViaFormField: StoryObj<typeof Select> = {
  render: () => (
    <FormField label="País" required error="Selecciona un país" controlId="storybook-country">
      <Select
        id="storybook-country"
        value=""
        onChange={() => {}}
        placeholder="Seleccionar..."
        options={OPTIONS}
        validationState="invalid"
      />
    </FormField>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const select = canvas.getByRole('combobox', { name: /^País/ });

    // FormField associates the label, the error text and the invalid state.
    await expect(select).toHaveAttribute('aria-invalid', 'true');
    const describedBy = select.getAttribute('aria-describedby')!;
    await expect(describedBy).toContain('error');
    const errorNode = document.getElementById(
      describedBy.split(' ').find((id) => id.includes('error'))!,
    );
    await expect(errorNode).toHaveTextContent('Selecciona un país');

    // The error bridge paints the shell through data-variant.
    const shell = (select as HTMLSelectElement).parentElement!;
    await expect(shell.getAttribute('data-variant')).toBe('default');
  },
};
