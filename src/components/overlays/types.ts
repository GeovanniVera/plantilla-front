import type { ReactNode } from 'react';

// ─── Modal Root ───────────────────────────────────────────
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Width of the modal window. Default: 520px */
  width?: number | string;
  /** Max height. Default: 85vh */
  maxHeight?: string;
  className?: string;
  /**
   * Accessible name for the dialog when the composed Header renders no
   * `title`. When a titled Header is used, its title names the dialog via
   * `aria-labelledby` and this prop is ignored.
   */
  'aria-label'?: string;
}

// ─── Drawer Root ──────────────────────────────────────────
export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Width of the drawer. Default: 480px */
  width?: number | string;
  className?: string;
  /**
   * Accessible name for the dialog when the composed Header renders no
   * `title`. When a titled Header is used, its title names the dialog via
   * `aria-labelledby` and this prop is ignored.
   */
  'aria-label'?: string;
}

// ─── Shared Header/Body/Footer ────────────────────────────
export interface ModalHeaderProps {
  /** Title text rendered centered */
  title?: string;
  /** Optional right-side content (overrides close button) */
  rightSlot?: ReactNode;
  /** Show the close button. Default: true */
  showClose?: boolean;
  className?: string;
  children?: ReactNode;
}

export interface ModalBodyProps {
  children: ReactNode;
  className?: string;
}

export interface ModalFooterProps {
  children: ReactNode;
  className?: string;
}
