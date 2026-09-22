import { useEffect, useContext, useEffectEvent, useId, Children, isValidElement } from 'react';
import { createPortal } from 'react-dom';
import { LuX } from 'react-icons/lu';
import type { DrawerProps, ModalHeaderProps, ModalBodyProps, ModalFooterProps } from './types';
import { ModalContext, ModalTitleIdContext } from './context';

// ─── Styling ──────────────────────────────────────────────
// Fully Tailwind since 6F.3B. DrawerStack still consumes the legacy
// drawer*/body rules in Modal.module.css — those rules stay until 6F.3C.
// The @480px collapse uses an arbitrary variant matching the original
// media query exactly; w-full! (important) is required to beat the
// inline width style, same as the legacy !important rule did.
const OVERLAY_CLASSES =
  'fixed inset-0 z-[1000] flex justify-end bg-black/35 backdrop-blur-[8px] animate-overlay-fade-in max-[480px]:items-end';

const WINDOW_CLASSES =
  'flex flex-col h-full bg-background border-l border-border-base rounded-l-xl shadow-[-25px_0_50px_-12px_rgba(0,0,0,0.25),0_0_0_1px_rgba(0,0,0,0.05)] overflow-hidden animate-drawer-slide-in max-[480px]:w-full! max-[480px]:max-w-full max-[480px]:border-l-0 max-[480px]:rounded-t-[16px] max-[480px]:rounded-l-none max-[480px]:max-h-[85vh] max-[480px]:h-auto';

/* Body/Footer replicate the shared module rules so Drawer no longer
 * depends on them; the module keeps the rules for DrawerStack + Modal. */
const BODY_CLASSES =
  'flex-1 overflow-y-auto px-6 py-5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-sm [&::-webkit-scrollbar-thumb]:bg-border-base';

const FOOTER_CLASSES =
  'flex items-center justify-end gap-2.5 px-6 py-4 border-t border-border-base bg-surface shrink-0';

const HEADER_CLASSES =
  'flex items-center justify-between px-6 py-5 border-b border-border-base bg-surface shrink-0 gap-3 min-h-16';
const TITLE_CLASSES =
  'text-base font-semibold text-heading font-sans leading-[1.3] flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap';

const CLOSE_BTN_CLASSES =
  'flex items-center justify-center size-8 rounded-md border-none bg-transparent text-foreground cursor-pointer shrink-0 transition-[background-color,color] duration-150 hover:bg-danger-strong/10 hover:text-danger-strong';

/* Transparent click-catcher rendered behind the dialog. A real button keeps
 * the click-outside-to-close affordance while staying reachable by assistive
 * tech; the negative z-index tucks it under the in-flow dialog so clicks on
 * the panel keep working without touching the panel's layout classes. */
const BACKDROP_BUTTON_CLASSES = 'absolute inset-0 -z-10 cursor-default border-0 bg-transparent p-0';

// ─── Drawer Root ──────────────────────────────────────────
export function Drawer({
  isOpen,
  onClose,
  children,
  width = 480,
  className,
  'aria-label': ariaLabel,
}: DrawerProps) {
  const titleId = useId();
  // `useEffectEvent` keeps the Escape listener subscribed once per open while
  // still seeing the latest `onClose`, instead of re-subscribing on every
  // parent render when consumers pass inline arrows.
  const closeDrawer = useEffectEvent(() => onClose());

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDrawer();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen]);

  if (!isOpen) return null;

  // Name the dialog from the composed Header: point `aria-labelledby` at its
  // title when one is rendered, otherwise fall back to an explicit
  // `aria-label` so consumers can name a title-less drawer without the
  // component hardcoding copy.
  const hasTitledHeader = Children.toArray(children).some(
    (child) =>
      isValidElement<{ title?: string }>(child) &&
      child.type === Drawer.Header &&
      Boolean(child.props.title),
  );

  return createPortal(
    <ModalContext.Provider value={onClose}>
      <ModalTitleIdContext.Provider value={hasTitledHeader ? titleId : null}>
        <div className={OVERLAY_CLASSES}>
          <button
            type="button"
            aria-label="Close"
            tabIndex={-1}
            className={BACKDROP_BUTTON_CLASSES}
            onClick={onClose}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={hasTitledHeader ? titleId : undefined}
            aria-label={hasTitledHeader ? undefined : ariaLabel}
            className={`${WINDOW_CLASSES} ${className ?? ''}`}
            style={{ width }}
          >
            {children}
          </div>
        </div>
      </ModalTitleIdContext.Provider>
    </ModalContext.Provider>,
    document.body,
  );
}

// ─── Drawer.Header (left-aligned title) ───────────────────
Drawer.Header = function DrawerHeader({
  title,
  rightSlot,
  showClose = true,
  className,
  children,
}: ModalHeaderProps) {
  const titleId = useContext(ModalTitleIdContext);
  return (
    <div className={`${HEADER_CLASSES} ${className ?? ''}`}>
      {children ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>{children}</div>
      ) : title ? (
        <span id={titleId ?? undefined} className={TITLE_CLASSES}>
          {title}
        </span>
      ) : (
        <div style={{ flex: 1 }} />
      )}
      {rightSlot ?? (showClose && <DrawerCloseButton />)}
    </div>
  );
};

// ─── Drawer.Body ──────────────────────────────────────────
Drawer.Body = function DrawerBody({ children, className }: ModalBodyProps) {
  return <div className={`${BODY_CLASSES} ${className ?? ''}`}>{children}</div>;
};

// ─── Drawer.Footer ────────────────────────────────────────
Drawer.Footer = function DrawerFooter({ children, className }: ModalFooterProps) {
  return <div className={`${FOOTER_CLASSES} ${className ?? ''}`}>{children}</div>;
};

// ─── Internal: Close button for Drawer ────────────────────

function DrawerCloseButton() {
  const onClose = useContext(ModalContext);
  if (!onClose) return null;
  return (
    <button className={CLOSE_BTN_CLASSES} onClick={onClose} title="Cerrar">
      <LuX size={18} />
    </button>
  );
}
