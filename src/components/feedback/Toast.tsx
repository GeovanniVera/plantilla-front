import { useState, useEffect, useCallback } from 'react';
import { LuX, LuCheck, LuTriangleAlert, LuInfo, LuCircleAlert } from 'react-icons/lu';
import type { ToastItem } from './types';

// ─── Styling ──────────────────────────────────────────────
// Colors reuse the semantic status tokens (exact match with the
// original literals: bg alpha .1 = --*-bg, border alpha .3 =
// --*-border, icon color = --*).
const TOAST_BASE_CLASSES =
  'flex items-center gap-2.5 px-4 py-3 rounded-[10px] bg-background border border-border-base shadow-[0_10px_25px_-5px_rgba(0,0,0,0.15),0_0_0_1px_rgba(0,0,0,0.05)] w-full';

/* Enter/exit animations compete for the same property — ONE effective
 * animation token is chosen per state (never both concatenated). */
const ANIMATION_ENTER_CLASSES = 'animate-toast-in';
const ANIMATION_EXIT_CLASSES = 'animate-toast-out';

const ICON_BASE_CLASSES = 'flex items-center justify-center size-6 rounded-sm shrink-0';

const VARIANT_CONFIG: Record<
  ToastItem['variant'],
  { icon: React.ReactNode; toast: string; iconBox: string }
> = {
  success: {
    icon: <LuCheck size={16} />,
    toast: 'border-success-line',
    iconBox: 'bg-success-bg text-success',
  },
  error: {
    icon: <LuCircleAlert size={16} />,
    toast: 'border-danger-line',
    iconBox: 'bg-danger-bg text-danger',
  },
  warning: {
    icon: <LuTriangleAlert size={16} />,
    toast: 'border-warning-line',
    iconBox: 'bg-warning-bg text-warning',
  },
  info: {
    icon: <LuInfo size={16} />,
    toast: 'border-info-line',
    iconBox: 'bg-info-bg text-info',
  },
};

// ─── Props ────────────────────────────────────────────────
interface ToastProps {
  item: ToastItem;
  defaultDuration: number;
  onDismiss: (id: string) => void;
}

// ─── Component ────────────────────────────────────────────
export function Toast({ item, defaultDuration, onDismiss }: ToastProps) {
  const [isPaused, setIsPaused] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const duration = item.duration ?? defaultDuration;
  const config = VARIANT_CONFIG[item.variant];

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => onDismiss(item.id), 200);
  }, [item.id, onDismiss]);

  // Auto-close timer
  useEffect(() => {
    if (isPaused || isExiting) return;
    const timer = setTimeout(handleClose, duration);
    return () => clearTimeout(timer);
  }, [isPaused, isExiting, duration, handleClose]);

  return (
    <div
      className={`${TOAST_BASE_CLASSES} ${config.toast} ${isExiting ? ANIMATION_EXIT_CLASSES : ANIMATION_ENTER_CLASSES}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="alert"
      aria-live="polite"
    >
      <span className={`${ICON_BASE_CLASSES} ${config.iconBox}`}>{config.icon}</span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-heading min-w-0 flex-1 text-[13px] leading-[1.4] font-medium">
          {item.message}
        </span>
        {item.action && (
          <button
            className="text-accent shrink-0 cursor-pointer border-none bg-transparent p-0 text-left font-sans text-xs font-medium opacity-80 transition-colors duration-150 hover:opacity-100"
            onClick={item.action.onClick}
          >
            {item.action.label}
          </button>
        )}
      </div>
      <button
        className="text-foreground flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-sm border-none bg-transparent opacity-50 transition-[opacity,background-color,color] duration-150 hover:bg-black/5 hover:opacity-100"
        onClick={handleClose}
        title="Cerrar"
      >
        <LuX size={14} />
      </button>
    </div>
  );
}
