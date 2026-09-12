// ─── Toast Variants ───────────────────────────────────────
export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

// ─── Toast Position ───────────────────────────────────────
export type ToastPosition = 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center';

// ─── Toast Item ───────────────────────────────────────────
export interface ToastItem {
  id: string;
  variant: ToastVariant;
  message: string;
  /** Auto-close delay in ms. Default: 5000 */
  duration?: number;
  /** Optional action button */
  action?: {
    label: string;
    onClick: () => void;
  };
  /** Timestamp for internal tracking */
  createdAt: number;
}

// ─── Toast API (returned by useToast) ─────────────────────
export interface ToastAPI {
  success: (
    message: string,
    options?: Partial<Omit<ToastItem, 'id' | 'variant' | 'message' | 'createdAt'>>,
  ) => void;
  error: (
    message: string,
    options?: Partial<Omit<ToastItem, 'id' | 'variant' | 'message' | 'createdAt'>>,
  ) => void;
  warning: (
    message: string,
    options?: Partial<Omit<ToastItem, 'id' | 'variant' | 'message' | 'createdAt'>>,
  ) => void;
  info: (
    message: string,
    options?: Partial<Omit<ToastItem, 'id' | 'variant' | 'message' | 'createdAt'>>,
  ) => void;
  dismiss: (id: string) => void;
}

// ─── Provider Props ───────────────────────────────────────
export interface ToastProviderProps {
  children: React.ReactNode;
  position?: ToastPosition;
  /** Maximum visible toasts. Default: 3 */
  maxVisible?: number;
  /** Default auto-close duration in ms. Default: 5000 */
  defaultDuration?: number;
}
