import { useRef, useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { LuSearch } from 'react-icons/lu';
import Input, { InputBase } from '../Input';
import FormField from '@components/forms/FormField';
import { SearchHighlight } from '@components/data-display/table/parts/SearchHighlight';

import type { Meta, StoryObj } from '@storybook/react-vite';
import type { InputProps } from '@components/forms/types';

const meta: Meta<InputProps> = {
  title: 'Primitives/Input',
  component: Input,
  tags: ['autodocs'],
  // Shared contract defaults so every story satisfies the controlled API.
  args: { value: '', onChange: () => {} },
};
export default meta;

export const Basic: StoryObj<InputProps> = {
  args: { placeholder: 'Type something...' },
};

function RefForwardingDemo() {
  const baseRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [nativeEventValue, setNativeEventValue] = useState('');
  const [value, setValue] = useState('');

  return (
    <div className="flex w-72 flex-col gap-3">
      <InputBase
        ref={baseRef}
        aria-label="Native base input"
        defaultValue="Native value"
        inputMode="email"
        maxLength={24}
        required
        onChange={(event) => setNativeEventValue(event.currentTarget.value)}
      />
      <output data-testid="native-event-value">{nativeEventValue}</output>
      <button type="button" onClick={() => baseRef.current?.focus()}>
        Focus base input
      </button>
      <Input ref={inputRef} value={value} onChange={setValue} aria-label="Shorthand input" />
      <button type="button" onClick={() => inputRef.current?.focus()}>
        Focus shorthand input
      </button>
    </div>
  );
}

export const NativeBaseAndForwardedRef: StoryObj<InputProps> = {
  render: () => <RefForwardingDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const nativeInput = canvas.getByRole('textbox', {
      name: 'Native base input',
    }) as HTMLInputElement;
    await expect(nativeInput.inputMode).toBe('email');
    await expect(nativeInput.maxLength).toBe(24);
    await expect(nativeInput.required).toBe(true);

    await userEvent.click(canvas.getByRole('button', { name: 'Focus base input' }));
    await expect(nativeInput).toHaveFocus();
    await userEvent.clear(nativeInput);
    await userEvent.type(nativeInput, 'native event');
    await expect(canvas.getByTestId('native-event-value')).toHaveTextContent('native event');

    await userEvent.click(canvas.getByRole('button', { name: 'Focus shorthand input' }));
    const shorthand = canvas.getByRole('textbox', { name: 'Shorthand input' }) as HTMLInputElement;
    await expect(shorthand).toHaveFocus();
    await userEvent.type(shorthand, 'typed value');
    await expect(shorthand.value).toBe('typed value');
  },
};

export const CompoundStructure: StoryObj<InputProps> = {
  render: () => (
    <Input.Root appearance="outlined" size="sm" validationState="invalid">
      <Input.StartAddon variant="accent" data-testid="start-addon">
        <LuSearch />
      </Input.StartAddon>
      <Input.Control aria-label="Compound input" defaultValue="Query" required />
      <Input.EndAdornment data-testid="end-adornment">characters</Input.EndAdornment>
      <Input.EndAction>
        <button type="button" aria-label="Clear compound input">
          Clear
        </button>
      </Input.EndAction>
    </Input.Root>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const control = canvas.getByRole('textbox', { name: 'Compound input' }) as HTMLInputElement;
    const root = control.parentElement!;

    await expect(root).toHaveAttribute('data-variant', 'outlined');
    await expect(root).toHaveAttribute('data-validation', 'invalid');
    await expect(control).toHaveAttribute('aria-invalid', 'true');
    await expect(control.required).toBe(true);
    await expect(canvas.getByTestId('start-addon')).toHaveAttribute('aria-hidden', 'true');
    await expect(canvas.getByTestId('end-adornment')).toHaveAttribute('aria-hidden', 'true');
    await expect(canvas.getByRole('button', { name: 'Clear compound input' })).toBeVisible();
  },
};

export const CompoundControlStateIsolation: StoryObj<InputProps> = {
  render: () => (
    <div className="flex w-72 flex-col gap-3">
      <Input.Root data-testid="editable-root">
        <Input.StartAddon>
          <LuSearch />
        </Input.StartAddon>
        <Input.Control aria-label="Decorated editable input" />
      </Input.Root>
      <Input.Root data-testid="readonly-root">
        <Input.Control aria-label="Read-only compound input" readOnly />
      </Input.Root>
      <Input.Root data-testid="disabled-action-root">
        <Input.Control aria-label="Input with disabled action" />
        <Input.EndAction>
          <button type="button" disabled>
            Unavailable action
          </button>
        </Input.EndAction>
      </Input.Root>
      <Input.Root data-testid="disabled-root">
        <Input.Control aria-label="Disabled compound input" disabled />
      </Input.Root>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const editableRoot = canvas.getByTestId('editable-root');
    const readOnlyRoot = canvas.getByTestId('readonly-root');
    const disabledActionRoot = canvas.getByTestId('disabled-action-root');
    const disabledRoot = canvas.getByTestId('disabled-root');

    await expect(
      canvas.getByRole('textbox', { name: 'Decorated editable input' }),
    ).not.toHaveAttribute('readonly');
    await expect(getComputedStyle(editableRoot).backgroundColor).not.toBe(
      getComputedStyle(readOnlyRoot).backgroundColor,
    );
    await expect(canvas.getByRole('textbox', { name: 'Read-only compound input' })).toHaveAttribute(
      'readonly',
    );

    await expect(canvas.getByRole('button', { name: 'Unavailable action' })).toBeDisabled();
    await expect(getComputedStyle(disabledActionRoot).opacity).toBe(
      getComputedStyle(editableRoot).opacity,
    );
    await expect(
      canvas.getByRole('textbox', { name: 'Input with disabled action' }),
    ).not.toBeDisabled();

    await expect(canvas.getByRole('textbox', { name: 'Disabled compound input' })).toBeDisabled();
    expect(parseFloat(getComputedStyle(disabledRoot).opacity)).toBeLessThan(1);
    await expect(getComputedStyle(disabledRoot).cursor).toBe('not-allowed');
  },
};

function SearchHighlightStatusDemo() {
  const [value, setValue] = useState('input');
  return <SearchHighlight value={value} onChange={setValue} resultCount={4} />;
}

export const SemanticEndAdornment: StoryObj<InputProps> = {
  render: () => <SearchHighlightStatusDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const status = canvas.getByRole('status');

    await expect(status).toHaveAccessibleName('4 search results');
    await expect(status).not.toHaveAttribute('aria-hidden');
    await expect(canvas.getByRole('button', { name: 'Clear table search' })).toBeVisible();
  },
};

export const WithStartIcon: StoryObj<InputProps> = {
  render: (args) => (
    <Input
      {...args}
      startAdornment={<LuSearch />}
      startAdornmentVariant="plain"
      placeholder="Search..."
    />
  ),
  args: { value: '' },
};

/** Boxed dark addon joined to the control as one visual unit. */
export const DarkStartAddon: StoryObj<InputProps> = {
  render: (args) => (
    <Input
      {...args}
      startAdornment={<LuSearch />}
      startAdornmentVariant="dark"
      placeholder="Search..."
    />
  ),
  args: { value: '' },
};

export const SubtleStartAddon: StoryObj<InputProps> = {
  render: (args) => (
    <Input
      {...args}
      startAdornment={<LuSearch />}
      startAdornmentVariant="subtle"
      placeholder="Search..."
    />
  ),
  args: { value: '' },
};

export const AccentStartAddon: StoryObj<InputProps> = {
  render: (args) => (
    <Input
      {...args}
      startAdornment={<LuSearch />}
      startAdornmentVariant="accent"
      placeholder="Search..."
    />
  ),
  args: { value: '' },
};

/** Decorative end content (suffix) with pointer events suppressed. */
export const WithEndAdornment: StoryObj<InputProps> = {
  render: (args) => (
    <Input
      {...args}
      endAdornment={<span className="text-xs opacity-60">kg</span>}
      placeholder="Weight"
    />
  ),
  args: { value: '' },
};

interface ClearableDemoProps {
  label?: string;
}

function ClearableDemo({ label = 'Clear' }: ClearableDemoProps) {
  const [value, setValue] = useState('Text to clear');
  return (
    <Input
      value={value}
      onChange={setValue}
      placeholder="Type something..."
      endAction={
        <button
          type="button"
          className="text-accent cursor-pointer border-none bg-transparent text-xs"
          aria-label={label}
          onClick={() => setValue('')}
        >
          {label}
        </button>
      }
    />
  );
}

/** Interactive endAction slot with callback coverage. */
export const WithEndAction: StoryObj<ClearableDemoProps> = {
  render: () => <ClearableDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');
    await expect((input as HTMLInputElement).value).toBe('Text to clear');

    await userEvent.click(canvas.getByRole('button', { name: 'Clear' }));
    await expect((input as HTMLInputElement).value).toBe('');
  },
};

/** showPasswordToggle wins over endAction by documented precedence. */
export const Password: StoryObj<InputProps> = {
  render: () => (
    <Input
      type="password"
      showPasswordToggle
      value="secret123"
      onChange={() => {}}
      placeholder="Password"
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvasElement.querySelector('input')!;
    await userEvent.click(canvas.getByRole('button'));

    // Toggle flips the effective input type
    await expect(input.getAttribute('type')).toBe('text');
    await userEvent.click(canvas.getByRole('button'));
    await expect(input.getAttribute('type')).toBe('password');
  },
};

export const BothSides: StoryObj<InputProps> = {
  render: () => (
    <Input
      value=""
      onChange={() => {}}
      placeholder="Filter by name"
      startAdornment={<LuSearch />}
      startAdornmentVariant="plain"
      endAdornment={<span className="text-xs opacity-60">max. 40</span>}
    />
  ),
};

export const Disabled: StoryObj<InputProps> = {
  render: () => <Input value="" onChange={() => {}} disabled placeholder="Disabled" />,
};

export const ReadOnly: StoryObj<InputProps> = {
  render: () => <Input value="Read-only value" onChange={() => {}} readOnly />,
};

export const Sizes: StoryObj<InputProps> = {
  render: () => (
    <div className="flex w-72 flex-col gap-3">
      <Input size="sm" value="" onChange={() => {}} placeholder="sm" />
      <Input size="md" value="" onChange={() => {}} placeholder="md" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const [small, medium] = Array.from(canvasElement.querySelectorAll('input'));
    await expect(getComputedStyle(small).height).toBe('32px');
    await expect(getComputedStyle(medium).height).toBe('40px');
  },
};

export const Variants: StoryObj<InputProps> = {
  render: () => (
    <div className="flex w-72 flex-col gap-3">
      <Input appearance="default" value="" onChange={() => {}} placeholder="default" />
      <Input appearance="filled" value="" onChange={() => {}} placeholder="filled" />
      <Input appearance="outlined" value="" onChange={() => {}} placeholder="outlined" />
      <Input variant="filled" value="" onChange={() => {}} placeholder="legacy variant alias" />
    </div>
  ),
};

/** Error state flows through FormField's data-variant bridge onto the shell. */
export const ErrorViaFormField: StoryObj<typeof Input> = {
  render: () => (
    <FormField
      label="Email"
      required
      error="Enter a valid email address"
      controlId="storybook-email"
    >
      <Input
        id="storybook-email"
        value="not-an-email"
        onChange={() => {}}
        variant="default"
        placeholder="Email address"
        startAdornment={<LuSearch />}
      />
    </FormField>
  ),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);

    const input = canvas.getByPlaceholderText('Email address');

    // Decorated path: the SHELL carries data-variant + owns the border,
    // so FormField's error bridge paints the whole unit.
    const shell = input.parentElement!;
    await expect(shell.getAttribute('data-variant')).toBe('default');
    await expect(getComputedStyle(shell).borderColor).not.toBe('');

    await expect(body.getAllByText(/valid email address/i).length).toBeGreaterThan(0);
  },
};

/** Editable inputs must never show the blocked cursor (hotfix 8E.3). */
export const EditableCursorNotBlocked: StoryObj<Partial<InputProps>> = {
  render: () => (
    <div className="flex w-72 flex-col gap-3">
      <Input value="Editable" onChange={() => {}} placeholder="Plain editable" />
      <Input
        value=""
        onChange={() => {}}
        placeholder="Decorated editable"
        startAdornment={<LuSearch />}
      />
    </div>
  ),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    for (const ph of ['Plain editable', 'Decorated editable']) {
      const input = canvas.getByPlaceholderText(ph);
      await expect(input.getAttribute('disabled')).toBeNull();
      await expect(input.getAttribute('readonly')).toBeNull();
      expect(getComputedStyle(input).cursor).not.toBe('not-allowed');
    }
  },
};

/** Disabled keeps the attribute + blocked cursor; readOnly stays editable-looking. */
export const DisabledVsReadOnly: StoryObj<typeof Input> = {
  render: () => (
    <div className="flex w-72 flex-col gap-3">
      <Input value="" onChange={() => {}} disabled placeholder="Disabled" />
      <Input value="Read only" readOnly onChange={() => {}} placeholder="Read only" />
    </div>
  ),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);

    const disabledInput = canvas.getByPlaceholderText('Disabled') as HTMLInputElement;
    await expect(disabledInput.disabled).toBe(true);
    expect(getComputedStyle(disabledInput).cursor).toBe('not-allowed');

    const readonlyInput = canvas.getByPlaceholderText('Read only') as HTMLInputElement;
    await expect(readonlyInput.readOnly).toBe(true);
    expect(getComputedStyle(readonlyInput).cursor).not.toBe('not-allowed');
  },
};

/** Decorated shell contract (hotfix 8E.3.4): control keeps inline padding,
 * fills the shell, and the addon stays a fixed-width sibling. */
export const DecoratedPaddingRegression: StoryObj<Partial<InputProps>> = {
  render: () => (
    <Input
      value="test text"
      onChange={() => {}}
      placeholder="With addon"
      startAdornment={<LuSearch />}
      startAdornmentVariant="accent"
    />
  ),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const input = canvasElement.querySelector('input')!;
    const control = getComputedStyle(input);
    const shell = getComputedStyle(input.parentElement!);

    // Control keeps its own inline padding (text never touches the addon)
    expect(parseFloat(control.paddingLeft)).toBeGreaterThan(0);
    expect(parseFloat(control.paddingRight)).toBeGreaterThan(0);

    // Control fills the remaining shell width (flex-1 / w-full)
    await expect(parseFloat(control.width)).toBeGreaterThan(100);

    // Shell hosts the unit: full wrapper width, visible border, flex layout
    await expect(parseFloat(shell.width)).toBeGreaterThan(300);
    expect(parseInt(shell.borderTopWidth)).toBeGreaterThanOrEqual(1);
    expect(shell.display).toBe('flex');

    // Fixed-width addon sibling
    const addon = input.previousElementSibling as HTMLElement;
    expect(getComputedStyle(addon).position).not.toBe('absolute');
  },
};

/** All start-addon variants side by side for visual comparison. */
export const AddonShowcase: StoryObj<InputProps> = {
  render: () => (
    <div className="flex w-80 flex-col gap-4">
      <Input
        value=""
        onChange={() => {}}
        placeholder="plain"
        startAdornment={<LuSearch />}
        startAdornmentVariant="plain"
      />
      <Input
        value=""
        onChange={() => {}}
        placeholder="subtle"
        startAdornment={<LuSearch />}
        startAdornmentVariant="subtle"
      />
      <Input
        value=""
        onChange={() => {}}
        placeholder="accent"
        startAdornment={<LuSearch />}
        startAdornmentVariant="accent"
      />
      <Input
        value=""
        onChange={() => {}}
        placeholder="dark"
        startAdornment={<LuSearch />}
        startAdornmentVariant="dark"
      />
    </div>
  ),
};
