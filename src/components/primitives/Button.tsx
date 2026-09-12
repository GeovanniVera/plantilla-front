import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonShape = 'default' | 'rounded' | 'square';
export type ButtonAnimation = 'none' | 'pulse' | 'bounce' | 'shake';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: ButtonShape;
  animation?: ButtonAnimation;
  /** Override text/icon color */
  color?: string;
  /** Override background color */
  colorBg?: string;
  children: ReactNode;
}

/*
 * Styling lives in Tailwind utilities consuming the runtime token layer
 * (see src/styles/tailwind.css). Radius and font-size are resolved to a
 * single class per attribute so shape overrides can't lose the CSS
 * cascade against size classes.
 */
const BASE_CLASSES =
  'inline-flex items-center justify-center gap-2 font-medium font-sans cursor-pointer border border-transparent whitespace-nowrap transition-[background-color,color,border-color,filter] duration-150';

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-accent border-accent text-white hover:brightness-110 active:brightness-95',
  secondary: 'bg-transparent text-accent border-accent-line hover:bg-accent-subtle',
  ghost: 'bg-transparent text-foreground hover:bg-accent-subtle hover:text-accent',
  danger:
    'bg-danger-strong/8 text-danger-strong border-danger-strong/20 hover:bg-danger-strong/15 hover:border-danger-strong/35',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'px-3.5 py-1.5 text-[13px]',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3 text-[15px]',
};

const SHAPE_CLASSES: Record<ButtonShape, string> = {
  default: '',
  rounded: 'rounded-full',
  square: 'rounded-none',
};

/** Radius applied only when no explicit shape overrides it */
const SIZE_RADIUS_CLASSES: Record<ButtonSize, string> = {
  sm: 'rounded-md',
  md: 'rounded-[10px]',
  lg: 'rounded-lg',
};

const ANIMATION_CLASSES: Record<ButtonAnimation, string> = {
  none: '',
  pulse: 'hover:animate-btn-pulse',
  bounce: 'hover:animate-btn-bounce',
  shake: 'hover:animate-btn-shake',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  shape = 'default',
  animation = 'none',
  color,
  colorBg,
  children,
  className,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const customStyle =
    color || colorBg
      ? { ...style, ...(color ? { color } : {}), ...(colorBg ? { background: colorBg } : {}) }
      : style;

  const radiusClasses = shape === 'default' ? SIZE_RADIUS_CLASSES[size] : SHAPE_CLASSES[shape];

  return (
    <button
      className={`${BASE_CLASSES} ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${radiusClasses} ${ANIMATION_CLASSES[animation]} ${className ?? ''}`}
      disabled={disabled}
      style={customStyle}
      {...props}
    >
      {children}
    </button>
  );
}
