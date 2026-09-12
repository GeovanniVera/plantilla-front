import type { ReactNode, ImgHTMLAttributes } from 'react';

// ─── Types ────────────────────────────────────────────────
export type CardVariant = 'default' | 'outlined' | 'elevated' | 'flat';

interface CardRootProps {
  variant?: CardVariant;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
}

interface CardImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'className'> {
  className?: string;
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

interface CardTitleProps {
  children: ReactNode;
  className?: string;
}

interface CardDescriptionProps {
  children: ReactNode;
  className?: string;
}

interface CardBodyProps {
  children: ReactNode;
  className?: string;
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

// ─── Styling ──────────────────────────────────────────────
/* Variant attributes resolved to one effective set per variant so border
 * widths/backgrounds never compete with the base classes (6D.1 lesson).
 * Clickable hover/focus classes attach only when onClick exists. */
const CARD_BASE_CLASSES =
  'flex flex-col overflow-hidden rounded-lg bg-background border-border-base transition-[border-color,box-shadow,transform] [transition-duration:200ms,200ms,150ms]';

const VARIANT_CLASSES: Record<CardVariant, string> = {
  default: 'border',
  outlined: 'border-2 bg-transparent',
  elevated: 'border shadow-(--shadow)',
  flat: 'bg-surface',
};

const CLICKABLE_CLASSES =
  'cursor-pointer hover:border-accent-line hover:shadow-(--shadow) hover:-translate-y-0.5 active:translate-y-0';

const IMAGE_WRAPPER_CLASSES = 'w-full aspect-video overflow-hidden bg-surface';
const IMAGE_CLASSES = 'w-full h-full object-cover block';

const HEADER_CLASSES = 'pt-4 px-4.5';
const TITLE_CLASSES = 'font-semibold text-[15px] text-heading';
const DESCRIPTION_CLASSES = 'text-[13px] text-foreground mt-1 leading-[1.4]';
const BODY_CLASSES = 'py-3.5 px-4.5 flex-1';
const FOOTER_CLASSES = 'px-4.5 py-3 border-t border-border-base flex items-center gap-2';

// ─── Card Root ────────────────────────────────────────────
function CardRoot({ variant = 'default', onClick, children, className = '' }: CardRootProps) {
  const isClickable = !!onClick;

  return (
    <div
      className={[
        CARD_BASE_CLASSES,
        VARIANT_CLASSES[variant],
        isClickable ? CLICKABLE_CLASSES : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      {children}
    </div>
  );
}

// ─── Card.Image ───────────────────────────────────────────
function CardImage({ className = '', ...props }: CardImageProps) {
  return (
    <div className={`${IMAGE_WRAPPER_CLASSES} ${className}`}>
      <img className={IMAGE_CLASSES} {...props} />
    </div>
  );
}

// ─── Card.Header ──────────────────────────────────────────
function CardHeader({ children, className = '' }: CardHeaderProps) {
  return <div className={`${HEADER_CLASSES} ${className}`}>{children}</div>;
}

// ─── Card.Title ───────────────────────────────────────────
function CardTitle({ children, className = '' }: CardTitleProps) {
  return <div className={`${TITLE_CLASSES} ${className}`}>{children}</div>;
}

// ─── Card.Description ─────────────────────────────────────
function CardDescription({ children, className = '' }: CardDescriptionProps) {
  return <div className={`${DESCRIPTION_CLASSES} ${className}`}>{children}</div>;
}

// ─── Card.Body ────────────────────────────────────────────
function CardBody({ children, className = '' }: CardBodyProps) {
  return <div className={`${BODY_CLASSES} ${className}`}>{children}</div>;
}

// ─── Card.Footer ──────────────────────────────────────────
function CardFooter({ children, className = '' }: CardFooterProps) {
  return <div className={`${FOOTER_CLASSES} ${className}`}>{children}</div>;
}

// ─── Compound Export ──────────────────────────────────────
const Card = Object.assign(CardRoot, {
  Image: CardImage,
  Header: CardHeader,
  Title: CardTitle,
  Description: CardDescription,
  Body: CardBody,
  Footer: CardFooter,
});

export default Card;
