import { createContext, forwardRef, useContext, useState } from 'react';
import { LuEye, LuEyeOff } from 'react-icons/lu';
import type { ComponentPropsWithRef, HTMLAttributes } from 'react';
import type {
  InputProps,
  InputSize,
  InputValidationState,
  InputVariant,
  StartAdornmentVariant,
} from '@components/forms/types';
import { classes, isAriaInvalid } from '@lib/utils';

export type { InputProps, InputSize, InputValidationState, InputVariant, StartAdornmentVariant };

export type InputAppearance = InputVariant;

type NativeInputProps = Omit<ComponentPropsWithRef<'input'>, 'size'>;

export interface InputBaseProps extends NativeInputProps {
  size?: InputSize;
  validationState?: InputValidationState;
}

export interface InputRootProps extends HTMLAttributes<HTMLDivElement> {
  appearance?: InputAppearance;
  size?: InputSize;
  validationState?: InputValidationState;
  disabled?: boolean;
  readOnly?: boolean;
}

export type InputControlProps = NativeInputProps;

export interface InputStartAddonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: StartAdornmentVariant;
}

export interface InputEndAdornmentProps extends HTMLAttributes<HTMLDivElement> {
  decorative?: boolean;
}
export type InputEndActionProps = HTMLAttributes<HTMLDivElement>;

interface InputContextValue {
  size: InputSize;
  validationState: InputValidationState;
  disabled: boolean;
  readOnly: boolean;
}

const InputContext = createContext<InputContextValue | null>(null);

const CONTROL_CLASSES =
  'block w-full min-w-0 box-border font-sans text-foreground placeholder:text-foreground/40 transition-[border-color,box-shadow,background-color,color,opacity] duration-150 ease-out focus:outline-none disabled:cursor-not-allowed read-only:cursor-default';

const STANDALONE_STATE_CLASSES = 'disabled:opacity-50 disabled:bg-surface read-only:bg-surface';

const BASE_SURFACE_CLASSES =
  'border border-border-base rounded-md bg-background focus:border-accent focus-visible:border-accent focus-visible:shadow-[0_0_0_3px_var(--accent-bg)]';

const COMPOUND_CONTROL_CLASSES =
  'h-full flex-1 border-0 rounded-none bg-transparent px-3 focus-visible:outline-none';

const ROOT_CLASSES =
  'flex w-full items-stretch overflow-hidden text-foreground transition-[border-color,box-shadow,background-color,color,opacity] duration-150 ease-out has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent has-[:focus-visible]:outline-offset-2 has-data-[input-disabled]:cursor-not-allowed has-data-[input-disabled]:opacity-50 has-data-[input-disabled]:bg-surface has-data-[input-readonly]:bg-surface';

const SIZE_CLASSES = {
  sm: { control: 'h-8 px-2.5 py-1.5 text-xs', root: 'h-8 text-xs', addon: 'w-7 text-[13px]' },
  md: { control: 'h-10 px-3 py-2 text-sm', root: 'h-10 text-sm', addon: 'w-8 text-sm' },
} satisfies Record<InputSize, { control: string; root: string; addon: string }>;

const APPEARANCE_INPUT_CLASSES = {
  default:
    'border border-border-base rounded-md bg-background focus:border-accent focus-visible:border-accent focus-visible:shadow-[0_0_0_3px_var(--accent-bg)]',
  filled:
    'border-0 border-b-2 border-b-border-base rounded-t-md bg-surface focus:border-b-accent focus-visible:border-b-accent',
  outlined:
    'border-2 border-border-base rounded-[10px] bg-transparent focus:border-accent focus-visible:border-accent focus-visible:shadow-[0_0_0_1px_var(--accent)]',
} satisfies Record<InputAppearance, string>;

const APPEARANCE_ROOT_CLASSES = {
  default:
    'border border-border-base rounded-md bg-background focus-within:border-accent focus-within:shadow-[0_0_0_3px_var(--accent-bg)]',
  filled:
    'border-0 border-b-2 border-b-border-base rounded-t-md bg-surface focus-within:border-b-accent',
  outlined:
    'border-2 border-border-base rounded-[10px] bg-transparent focus-within:border-accent focus-within:shadow-[0_0_0_1px_var(--accent)]',
} satisfies Record<InputAppearance, string>;

const INPUT_VALIDATION_CLASSES = {
  none: '',
  invalid:
    'border-danger border-b-danger focus:border-danger focus-visible:border-danger focus-visible:shadow-[0_0_0_3px_var(--danger-bg)]',
  valid:
    'border-success border-b-success focus:border-success focus-visible:border-success focus-visible:shadow-[0_0_0_3px_var(--success-bg)]',
} satisfies Record<InputValidationState, string>;

const ROOT_VALIDATION_CLASSES = {
  none: '',
  invalid:
    'border-danger border-b-danger focus-within:border-danger focus-within:shadow-[0_0_0_3px_var(--danger-bg)]',
  valid:
    'border-success border-b-success focus-within:border-success focus-within:shadow-[0_0_0_3px_var(--success-bg)]',
} satisfies Record<InputValidationState, string>;

const ADDON_CLASSES = {
  plain: '',
  subtle: 'bg-surface text-foreground',
  accent: 'bg-accent text-background',
  dark: 'bg-[var(--text-h)] text-[var(--bg)]',
} satisfies Record<StartAdornmentVariant, string>;

function useInputContext(component: string) {
  const context = useContext(InputContext);
  if (!context) throw new Error(`${component} must be used within Input.Root`);
  return context;
}

export const InputBase = forwardRef<HTMLInputElement, InputBaseProps>(function InputBase(
  { className, size = 'md', validationState = 'none', 'aria-invalid': ariaInvalid, ...props },
  ref,
) {
  const resolvedValidation = isAriaInvalid(ariaInvalid) ? 'invalid' : validationState;

  return (
    <input
      {...props}
      ref={ref}
      aria-invalid={ariaInvalid ?? (resolvedValidation === 'invalid' ? true : undefined)}
      data-validation={resolvedValidation}
      data-variant="default"
      className={classes(
        CONTROL_CLASSES,
        STANDALONE_STATE_CLASSES,
        BASE_SURFACE_CLASSES,
        SIZE_CLASSES[size].control,
        INPUT_VALIDATION_CLASSES[resolvedValidation],
        className,
      )}
    />
  );
});

export const InputRoot = forwardRef<HTMLDivElement, InputRootProps>(function InputRoot(
  {
    appearance = 'default',
    size = 'md',
    validationState = 'none',
    disabled = false,
    readOnly = false,
    className,
    children,
    ...props
  },
  ref,
) {
  return (
    <InputContext.Provider value={{ size, validationState, disabled, readOnly }}>
      <div
        {...props}
        ref={ref}
        data-variant={appearance}
        data-validation={validationState}
        className={classes(
          ROOT_CLASSES,
          SIZE_CLASSES[size].root,
          APPEARANCE_ROOT_CLASSES[appearance],
          ROOT_VALIDATION_CLASSES[validationState],
          className,
        )}
      >
        {children}
      </div>
    </InputContext.Provider>
  );
});

export const InputControl = forwardRef<HTMLInputElement, InputControlProps>(function InputControl(
  { className, disabled, readOnly, 'aria-invalid': ariaInvalid, ...props },
  ref,
) {
  const context = useInputContext('Input.Control');
  const resolvedDisabled = disabled ?? context.disabled;
  const resolvedReadOnly = readOnly ?? context.readOnly;

  return (
    <input
      {...props}
      ref={ref}
      disabled={resolvedDisabled}
      readOnly={resolvedReadOnly}
      aria-invalid={ariaInvalid ?? (context.validationState === 'invalid' ? true : undefined)}
      data-input-control=""
      data-input-disabled={resolvedDisabled ? '' : undefined}
      data-input-readonly={resolvedReadOnly ? '' : undefined}
      className={classes(CONTROL_CLASSES, COMPOUND_CONTROL_CLASSES, className)}
    />
  );
});

export function InputStartAddon({
  variant = 'plain',
  className,
  children,
  ...props
}: InputStartAddonProps) {
  const { size } = useInputContext('Input.StartAddon');
  const boxed = variant !== 'plain';

  return (
    <div
      {...props}
      aria-hidden="true"
      className={classes(
        'pointer-events-none flex shrink-0 items-center justify-center',
        boxed ? `${ADDON_CLASSES[variant]} ${SIZE_CLASSES[size].addon}` : 'pr-1 pl-3',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function InputEndAdornment({
  decorative = true,
  className,
  children,
  'aria-hidden': ariaHidden,
  ...props
}: InputEndAdornmentProps) {
  useInputContext('Input.EndAdornment');
  return (
    <div
      {...props}
      aria-hidden={decorative ? true : ariaHidden}
      className={classes('flex shrink-0 items-center pr-2.5', className)}
    >
      {children}
    </div>
  );
}

export function InputEndAction({ className, children, ...props }: InputEndActionProps) {
  useInputContext('Input.EndAction');
  return (
    <div {...props} className={classes('flex shrink-0 items-center pr-2.5', className)}>
      {children}
    </div>
  );
}

function usePasswordVisibility(enabled: boolean) {
  const [visible, setVisible] = useState(false);
  return {
    visible: enabled && visible,
    toggle: () => setVisible((current) => !current),
  };
}

const InputShorthand = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    value,
    onChange,
    type = 'text',
    variant,
    appearance = variant ?? 'default',
    size = 'md',
    validationState = 'none',
    className,
    startAdornment,
    startAdornmentVariant = 'plain',
    endAdornment,
    endAction,
    showPasswordToggle = false,
    disabled = false,
    readOnly = false,
    'aria-invalid': ariaInvalid,
    ...inputProps
  },
  ref,
) {
  const hasPasswordToggle = type === 'password' && showPasswordToggle;
  const password = usePasswordVisibility(hasPasswordToggle);
  const effectiveType = hasPasswordToggle && password.visible ? 'text' : type;
  const resolvedValidation = isAriaInvalid(ariaInvalid) ? 'invalid' : validationState;
  const hasStructure =
    startAdornment !== undefined ||
    endAdornment !== undefined ||
    endAction !== undefined ||
    hasPasswordToggle;
  const controlProps: ComponentPropsWithRef<'input'> = {
    ...inputProps,
    ref,
    type: effectiveType,
    value,
    onChange: (event) => onChange(event.target.value),
    disabled,
    readOnly,
    'aria-invalid': ariaInvalid ?? (resolvedValidation === 'invalid' ? true : undefined),
  };

  if (!hasStructure) {
    return (
      <input
        {...controlProps}
        data-variant={appearance}
        data-validation={resolvedValidation}
        className={classes(
          CONTROL_CLASSES,
          STANDALONE_STATE_CLASSES,
          SIZE_CLASSES[size].control,
          APPEARANCE_INPUT_CLASSES[appearance],
          INPUT_VALIDATION_CLASSES[resolvedValidation],
          className,
        )}
      />
    );
  }

  return (
    <>
      <InputRoot
        appearance={appearance}
        size={size}
        validationState={resolvedValidation}
        disabled={disabled}
        readOnly={readOnly}
        className={className}
      >
        {startAdornment !== undefined && (
          <InputStartAddon variant={startAdornmentVariant}>{startAdornment}</InputStartAddon>
        )}
        <InputControl {...controlProps} />
        {hasPasswordToggle ? (
          <InputEndAction>
            <button
              type="button"
              className="text-foreground flex cursor-pointer items-center justify-center rounded-sm border-none bg-transparent p-1 opacity-60 transition-opacity duration-150 hover:opacity-100 disabled:cursor-not-allowed"
              onClick={password.toggle}
              disabled={disabled}
              aria-label={password.visible ? 'Hide password' : 'Show password'}
              aria-pressed={password.visible}
            >
              {password.visible ? <LuEyeOff size={16} /> : <LuEye size={16} />}
            </button>
          </InputEndAction>
        ) : (
          endAction !== undefined && <InputEndAction>{endAction}</InputEndAction>
        )}
        {endAdornment !== undefined && <InputEndAdornment>{endAdornment}</InputEndAdornment>}
      </InputRoot>
    </>
  );
});

const Input = Object.assign(InputShorthand, {
  Root: InputRoot,
  Control: InputControl,
  StartAddon: InputStartAddon,
  EndAdornment: InputEndAdornment,
  EndAction: InputEndAction,
});

export default Input;
