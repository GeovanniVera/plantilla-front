import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { LuX } from 'react-icons/lu';
import type { ModalProps, ModalHeaderProps, ModalBodyProps, ModalFooterProps } from './types';
import { ModalContext, useModalClose } from './context';

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

// ─── Modal Root ───────────────────────────────────────────
export function Modal({
  isOpen,
  onClose,
  children,
  width = 520,
  maxHeight = '85vh',
  className,
}: ModalProps) {
  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <ModalContext.Provider value={onClose}>
      <div
        className={OVERLAY_CLASSES}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div
          role="dialog"
          aria-modal="true"
          className={`${WINDOW_CLASSES} ${className ?? ''}`}
          style={{ width, maxHeight }}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
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

  return (
    <div className={`${HEADER_CLASSES} ${className ?? ''}`}>
      {children ? (
        <div className={HEADER_CHILDREN_CLASSES}>{children}</div>
      ) : title ? (
        <span className={HEADER_TITLE_CLASSES}>{title}</span>
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
