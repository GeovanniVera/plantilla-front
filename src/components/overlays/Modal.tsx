import { useEffect, useContext, useEffectEvent, useId, Children, isValidElement } from 'react';
import { createPortal } from 'react-dom';
import { LuX } from 'react-icons/lu';
import type { ModalProps, ModalHeaderProps, ModalBodyProps, ModalFooterProps } from './types';
import { ModalContext, ModalTitleIdContext, useModalClose } from './context';

// ─── Styling ──────────────────────────────────────────────
// Overlay/window/header migrated to Tailwind (6F.3A). Body/Footer keep
// the shared module classes: Drawer/DrawerStack consume the exact same
// rules and splitting them now would create drift risk (documented for
// 6F.3B/C).
const OVERLAY_CLASSES =
  'fixed inset-0 z-[1000] flex items-center justify-center bg-black/35 backdrop-blur-[8px] animate-overlay-fade-in';

const WINDOW_CLASSES =
  'flex flex-col bg-background border border-border-base rounded-[16px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25),0_0_0_1px_rgba(0,0,0,0.05)] overflow-hidden animate-window-slide-in';

const HEADER_CLASSES =
  'relative flex items-center justify-center px-5 py-4 border-b border-border-base bg-surface shrink-0';
const HEADER_TITLE_CLASSES = 'text-sm font-semibold text-heading font-sans';
const HEADER_CHILDREN_CLASSES = 'flex items-center gap-2';
/* Close button keeps its own focus-visible dialect need in mind; hover
 * turns destructive exactly like the legacy rule. */
const CLOSE_BTN_CLASSES =
  'absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center size-7 rounded-full border-none bg-transparent text-foreground cursor-pointer transition-[background-color,color] duration-150 hover:bg-danger-strong/10 hover:text-danger-strong';

/* Transparent click-catcher rendered behind the dialog. A real button keeps
 * the click-outside-to-close affordance while staying reachable by assistive
 * tech; the negative z-index tucks it under the in-flow dialog so clicks on
 * the panel keep working without touching the panel's layout classes. */
const BACKDROP_BUTTON_CLASSES = 'absolute inset-0 -z-10 cursor-default border-0 bg-transparent p-0';

// ─── Modal Root ───────────────────────────────────────────
export function Modal({
  isOpen,
  onClose,
  children,
  width = 520,
  maxHeight = '85vh',
  className,
  'aria-label': ariaLabel,
}: ModalProps) {
  const titleId = useId();
  // `useEffectEvent` keeps the Escape listener subscribed once per open while
  // still seeing the latest `onClose`, instead of re-subscribing on every
  // parent render when consumers pass inline arrows.
  const closeModal = useEffectEvent(() => onClose());

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen]);

  if (!isOpen) return null;

  // Name the dialog from the composed Header: point `aria-labelledby` at its
  // title when one is rendered, otherwise fall back to an explicit
  // `aria-label` so consumers can name a title-less modal without the
  // component hardcoding copy.
  const hasTitledHeader = Children.toArray(children).some(
    (child) =>
      isValidElement<{ title?: string }>(child) &&
      child.type === Modal.Header &&
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
            style={{ width, maxHeight }}
          >
            {children}
          </div>
        </div>
      </ModalTitleIdContext.Provider>
    </ModalContext.Provider>,
    document.body,
  );
}

// ─── Modal.Header ─────────────────────────────────────────
Modal.Header = function ModalHeader({
  title,
  rightSlot,
  showClose = true,
  className,
  children,
}: ModalHeaderProps) {
  const onClose = useModalClose();
  const titleId = useContext(ModalTitleIdContext);

  return (
    <div className={`${HEADER_CLASSES} ${className ?? ''}`}>
      {children ? (
        <div className={HEADER_CHILDREN_CLASSES}>{children}</div>
      ) : title ? (
        <span id={titleId ?? undefined} className={HEADER_TITLE_CLASSES}>
          {title}
        </span>
      ) : null}
      {showClose && !rightSlot && (
        <button className={CLOSE_BTN_CLASSES} onClick={onClose} title="Cerrar">
          <LuX size={16} />
        </button>
      )}
      {rightSlot}
    </div>
  );
};

// ─── Modal.Body ───────────────────────────────────────────
/* Scrollable body replicating the legacy .body rule (incl. custom
 * scrollbar via arbitrary variants). Modal.module.css was deleted in
 * 6F.3D once this was its last consumer. */
const BODY_CLASSES =
  'flex-1 overflow-y-auto px-6 py-5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-sm [&::-webkit-scrollbar-thumb]:bg-border-base';

Modal.Body = function ModalBody({ children, className }: ModalBodyProps) {
  return <div className={`${BODY_CLASSES} ${className ?? ''}`}>{children}</div>;
};

// ─── Modal.Footer ─────────────────────────────────────────
const FOOTER_CLASSES =
  'flex items-center justify-end gap-2.5 px-6 py-4 border-t border-border-base bg-surface shrink-0';

Modal.Footer = function ModalFooter({ children, className }: ModalFooterProps) {
  return <div className={`${FOOTER_CLASSES} ${className ?? ''}`}>{children}</div>;
};
