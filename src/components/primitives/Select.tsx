import { createContext, forwardRef, useContext, useMemo } from 'react';
import { LuChevronDown } from 'react-icons/lu';
import type { ComponentPropsWithRef, HTMLAttributes } from 'react';
import type {
  SelectProps,
  SelectSize,
  SelectValidationState,
  SelectVariant,
  StartAdornmentVariant,
} from '@components/forms/types';
import { classes, isAriaInvalid } from '@lib/utils';

export type {
  SelectProps,
  SelectSize,
  SelectValidationState,
  SelectVariant,
  StartAdornmentVariant,
};

export type SelectAppearance = SelectVariant;

/*
 * Native <select> props. The native `size` attribute (visible option count,
 * which turns the control into a listbox) collides with our visual size axis
 * and is deliberately not exposed: the family shells style single-line
 * controls. A multi-row listbox is a different presentation problem.
 */
type NativeSelectProps = Omit<ComponentPropsWithRef<'select'>, 'size'>;

export interface SelectBaseProps extends NativeSelectProps {
  size?: SelectSize;
  validationState?: SelectValidationState;
  disabled?: boolean;
}

export interface SelectRootProps extends HTMLAttributes<HTMLDivElement> {
  appearance?: SelectAppearance;
  size?: SelectSize;
  validationState?: SelectValidationState;
  disabled?: boolean;
}

export type SelectControlProps = NativeSelectProps;

export interface SelectStartAddonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: StartAdornmentVariant;
}

/*
 * Shared structural state only. `appearance` stays a Root responsibility and
 * value/onChange/options never travel through context (business-free shell).
 * `readOnly` is intentionally absent: <select> has no native readonly.
 */
interface SelectContextValue {
  size: SelectSize;
  validationState: SelectValidationState;
  disabled: boolean;
}

const SelectContext = createContext<SelectContextValue | null>(null);

/*
 * The select carries no text color decision of its own beyond the base: the
 * shorthand marks the placeholder state with data-placeholder, which
 * deterministically mutes it (attribute selector beats inheritance).
 */
const CONTROL_CLASSES =
  'block w-full min-w-0 box-border appearance-none cursor-pointer font-sans text-foreground data-[placeholder]:text-foreground/40 transition-[border-color,box-shadow,background-color,color,opacity] duration-150 ease-out focus:outline-none disabled:cursor-not-allowed';

/* Inside the shell the select is chrome-free: the ROOT owns the surface. */
const COMPOUND_CONTROL_CLASSES =
  'h-full flex-1 border-0 rounded-none bg-transparent px-3 focus-visible:outline-none';

const ROOT_CLASSES =
  'flex w-full items-stretch overflow-hidden text-foreground transition-[border-color,box-shadow,background-color,color,opacity] duration-150 ease-out has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent has-[:focus-visible]:outline-offset-2 has-data-[select-disabled]:cursor-not-allowed has-data-[select-disabled]:opacity-50 has-data-[select-disabled]:bg-surface';

const SIZE_CLASSES = {
  sm: { root: 'h-8 text-xs', addon: 'w-7 text-[13px]', chevron: 'pr-2' },
  md: { root: 'h-10 text-sm', addon: 'w-8 text-sm', chevron: 'pr-2.5' },
} satisfies Record<SelectSize, { root: string; addon: string; chevron: string }>;

const APPEARANCE_ROOT_CLASSES = {
  default:
    'border border-border-base rounded-md bg-background focus-within:border-accent focus-within:shadow-[0_0_0_3px_var(--accent-bg)]',
  filled:
    'border-0 border-b-2 border-b-border-base rounded-t-md bg-surface focus-within:border-b-accent',
  outlined:
    'border-2 border-border-base rounded-[10px] bg-transparent focus-within:border-accent focus-within:shadow-[0_0_0_1px_var(--accent)]',
} satisfies Record<SelectAppearance, string>;

const ROOT_VALIDATION_CLASSES = {
  none: '',
  invalid:
    'border-danger border-b-danger focus-within:border-danger focus-within:shadow-[0_0_0_3px_var(--danger-bg)]',
  valid:
    'border-success border-b-success focus-within:border-success focus-within:shadow-[0_0_0_3px_var(--success-bg)]',
} satisfies Record<SelectValidationState, string>;

const ADDON_CLASSES = {
  plain: '',
  subtle: 'bg-surface text-foreground',
  accent: 'bg-accent text-background',
  dark: 'bg-[var(--text-h)] text-[var(--bg)]',
} satisfies Record<StartAdornmentVariant, string>;

function useSelectContext(component: string) {
  const context = useContext(SelectContext);
  if (!context) throw new Error(`${component} must be used within Select.Root`);
  return context;
}

/*
 * The dropdown indicator. Shell chrome, never a control: decorative,
 * non-interactive, and laid out as a shrink-0 sibling (no absolute
 * positioning). Root renders it after its children; SelectBase includes it
 * in its fixed minimal unit.
 */
function SelectChevron({ size }: { size: SelectSize }) {
  return (
    <span
      aria-hidden="true"
      className={classes(
        'text-foreground pointer-events-none flex shrink-0 items-center justify-center opacity-50',
        SIZE_CLASSES[size].chevron,
      )}
    >
      <LuChevronDown size={16} />
    </span>
  );
}

/*
 * Light wrapper around the native <select>, conceptually identical to
 * InputBase: native attributes via spread, forwardRef, controlled or
 * uncontrolled freely, our visual size/validation axes, no business logic.
 * Unlike InputBase (whose className lands on the <input>), the className
 * here lands on the shell: the unit is select + chevron by design.
 */
export const SelectBase = forwardRef<HTMLSelectElement, SelectBaseProps>(function SelectBase(
  {
    className,
    size = 'md',
    validationState = 'none',
    disabled = false,
    'aria-invalid': ariaInvalid,
    ...props
  },
  ref,
) {
  const resolvedValidation = isAriaInvalid(ariaInvalid) ? 'invalid' : validationState;

  return (
    <div
      data-variant="default"
      data-validation={resolvedValidation}
      className={classes(
        ROOT_CLASSES,
        SIZE_CLASSES[size].root,
        APPEARANCE_ROOT_CLASSES.default,
        ROOT_VALIDATION_CLASSES[resolvedValidation],
        className,
      )}
    >
      <select
        {...props}
        ref={ref}
        disabled={disabled}
        aria-invalid={ariaInvalid ?? (resolvedValidation === 'invalid' ? true : undefined)}
        data-select-control=""
        data-select-disabled={disabled ? '' : undefined}
        className={classes(CONTROL_CLASSES, COMPOUND_CONTROL_CLASSES)}
      />
      <SelectChevron size={size} />
    </div>
  );
});

export const SelectRoot = forwardRef<HTMLDivElement, SelectRootProps>(function SelectRoot(
  {
    appearance = 'default',
    size = 'md',
    validationState = 'none',
    disabled = false,
    className,
    children,
    ...props
  },
  ref,
) {
  const contextValue = useMemo(
    () => ({ size, validationState, disabled }),
    [size, validationState, disabled],
  );

  return (
    <SelectContext.Provider value={contextValue}>
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
        <SelectChevron size={size} />
      </div>
    </SelectContext.Provider>
  );
});

export const SelectControl = forwardRef<HTMLSelectElement, SelectControlProps>(
  function SelectControl({ className, disabled, 'aria-invalid': ariaInvalid, ...props }, ref) {
    const context = useSelectContext('Select.Control');
    const resolvedDisabled = disabled ?? context.disabled;

    return (
      <select
        {...props}
        ref={ref}
        disabled={resolvedDisabled}
        aria-invalid={ariaInvalid ?? (context.validationState === 'invalid' ? true : undefined)}
        data-select-control=""
        data-select-disabled={resolvedDisabled ? '' : undefined}
        className={classes(CONTROL_CLASSES, COMPOUND_CONTROL_CLASSES, className)}
      />
    );
  },
);

export function SelectStartAddon({
  variant = 'plain',
  className,
  children,
  ...props
}: SelectStartAddonProps) {
  const { size } = useSelectContext('Select.StartAddon');
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

const SelectShorthand = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    value,
    onChange,
    options,
    placeholder,
    disabled = false,
    name,
    id,
    variant,
    appearance = variant ?? 'default',
    size = 'md',
    validationState = 'none',
    startAdornment,
    startAdornmentVariant = 'plain',
    className,
    'aria-invalid': ariaInvalid,
    ...selectProps
  },
  ref,
) {
  const resolvedValidation = isAriaInvalid(ariaInvalid) ? 'invalid' : validationState;
  // The placeholder is a real disabled option; while it is the shown value,
  // the control renders it muted through data-placeholder (see CONTROL_CLASSES).
  const showPlaceholder = placeholder !== undefined && value === '';
  // No type annotation: data-* attributes are legal DOM props but not part
  // of React's typed select attributes.
  const controlProps = {
    ...selectProps,
    ref,
    value,
    onChange: (event: React.ChangeEvent<HTMLSelectElement>) => onChange(event.target.value),
    disabled,
    name,
    id,
    'aria-invalid': ariaInvalid ?? (resolvedValidation === 'invalid' ? true : undefined),
    'data-placeholder': showPlaceholder ? '' : undefined,
  };
  const optionNodes = (
    <>
      {placeholder !== undefined && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} disabled={opt.disabled}>
          {opt.label}
        </option>
      ))}
    </>
  );

  if (startAdornment === undefined) {
    return (
      <SelectBase
        {...controlProps}
        size={size}
        validationState={resolvedValidation}
        className={className}
      >
        {optionNodes}
      </SelectBase>
    );
  }

  return (
    <SelectRoot
      appearance={appearance}
      size={size}
      validationState={resolvedValidation}
      disabled={disabled}
      className={className}
    >
      <SelectStartAddon variant={startAdornmentVariant}>{startAdornment}</SelectStartAddon>
      <SelectControl {...controlProps}>{optionNodes}</SelectControl>
    </SelectRoot>
  );
});

const Select = Object.assign(SelectShorthand, {
  Root: SelectRoot,
  Control: SelectControl,
  StartAddon: SelectStartAddon,
});

export default Select;
