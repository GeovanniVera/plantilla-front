import { useEffect, useRef, useEffectEvent, useId, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { LuX, LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import { ModalContext, ModalTitleIdContext } from './context';

// ─── Breadcrumb Item ──────────────────────────────────────
export interface DrawerBreadcrumb {
  label: string;
  level: number;
}

// ─── Props ────────────────────────────────────────────────
export interface DrawerStackProps {
  isOpen: boolean;
  onClose: () => void;
  /** Current level (0 = first, 1 = second, etc.) */
  level?: number;
  /** Called when back button or breadcrumb is pressed */
  onBack?: () => void;
  /** Called when a breadcrumb is clicked — receives target level */
  onNavigate?: (level: number) => void;
  /** Breadcrumb items — renders nav path instead of title */
  breadcrumbs?: DrawerBreadcrumb[];
  /** Title (used when no breadcrumbs) */
  title?: string;
  width?: number | string;
  children: ReactNode;
  className?: string;
  /**
   * Accessible name for the dialog when no title is rendered (e.g. when
   * breadcrumbs replace the title). When a title is rendered it names the
   * dialog via `aria-labelledby` and this prop is ignored.
   */
  'aria-label'?: string;
}

// ─── Styling ──────────────────────────────────────────────
// Fully Tailwind since 6F.3C. Shares the overlay/window/header/close
// class sets with Drawer (6F.3B). Push/pop animations are separate
// exclusive tokens chosen by navigation direction — never concatenated.
const OVERLAY_CLASSES =
  'fixed inset-0 z-[1000] flex justify-end bg-black/35 backdrop-blur-[8px] animate-overlay-fade-in max-[480px]:items-end';

const WINDOW_CLASSES =
  'flex flex-col h-full bg-background border-l border-border-base shadow-[-25px_0_50px_-12px_rgba(0,0,0,0.25),0_0_0_1px_rgba(0,0,0,0.05)] overflow-hidden animate-drawer-slide-in max-[480px]:w-full! max-[480px]:max-w-full max-[480px]:border-l-0 max-[480px]:rounded-t-[16px] max-[480px]:max-h-[85vh] max-[480px]:h-auto';

const HEADER_CLASSES =
  'flex items-center justify-between px-6 py-5 border-b border-border-base bg-surface shrink-0 gap-3 min-h-16';
const TITLE_CLASSES =
  'text-base font-semibold text-heading font-sans leading-[1.3] flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap';

const BACK_BTN_CLASSES =
  'flex items-center justify-center size-8 rounded-md border-none bg-transparent text-accent cursor-pointer shrink-0 transition-[background-color] duration-150 hover:bg-accent-subtle';
const CLOSE_BTN_CLASSES =
  'flex items-center justify-center size-8 rounded-md border-none bg-transparent text-foreground cursor-pointer shrink-0 transition-[background-color,color] duration-150 hover:bg-danger-strong/10 hover:text-danger-strong';

const BREADCRUMBS_CLASSES = 'flex items-center flex-wrap gap-0.5 flex-1 min-w-0 px-1';
const CRUMB_CLASSES = 'inline-flex items-center gap-0.5';
const CRUMB_SEP_CLASSES = 'text-foreground opacity-30 shrink-0';
const CRUMB_LINK_CLASSES =
  'border-none bg-transparent text-accent text-[13px] font-medium font-sans cursor-pointer px-1 py-0.5 rounded-sm transition-[background-color] duration-150 whitespace-nowrap hover:bg-accent-subtle';
const CRUMB_CURRENT_CLASSES =
  'text-[13px] font-semibold text-heading px-1 py-0.5 whitespace-nowrap';

const LEVEL_INDICATOR_CLASSES =
  'flex items-center justify-center gap-1.5 py-2 border-b border-border-base bg-surface';
const LEVEL_DOT_BASE_CLASSES =
  'size-1.5 rounded-full bg-border-base transition-[background-color,transform] duration-200';
const LEVEL_DOT_ACTIVE_CLASSES = 'bg-accent scale-[1.3]';

/* Body replicates the legacy combined .body + .drawerContent element:
 * padding 20px/24px, scroll on Y with hidden X (the old cascade of
 * overflow:hidden + overflow-y:auto), and custom scrollbar. The module
 * rule stays only because Modal.Body still consumes it. */
const BODY_CLASSES =
  'relative flex-1 overflow-x-hidden overflow-y-auto px-6 py-5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-sm [&::-webkit-scrollbar-thumb]:bg-border-base';

const CONTENT_INNER_CLASSES = 'w-full';
const SLIDE_ANIMATION_CLASSES = {
  forward: 'animate-stack-slide-forward',
  back: 'animate-stack-slide-back',
} as const;

/* Transparent click-catcher rendered behind the dialog. A real button keeps
 * the click-outside-to-close affordance while staying reachable by assistive
 * tech; the negative z-index tucks it under the in-flow dialog so clicks on
 * the panel keep working without touching the panel's layout classes. */
const BACKDROP_BUTTON_CLASSES = 'absolute inset-0 -z-10 cursor-default border-0 bg-transparent p-0';

// ─── Component ────────────────────────────────────────────
export function DrawerStack({
  isOpen,
  onClose,
  level = 0,
  onBack,
  onNavigate,
  breadcrumbs,
  title = '',
  width = 480,
  children,
  className,
  'aria-label': ariaLabel,
}: DrawerStackProps) {
  const prevLevelRef = useRef(level);
  const animDir = level > prevLevelRef.current ? 'forward' : 'back';

  // Sync ref after render
  useEffect(() => {
    prevLevelRef.current = level;
  }, [level]);

  const titleId = useId();
  // `useEffectEvent` keeps the Escape listener subscribed once per open while
  // still seeing the latest level/onBack/onClose, instead of re-subscribing on
  // every parent render when consumers pass inline arrows.
  const handleEscape = useEffectEvent(() => {
    if (level > 0 && onBack) onBack();
    else onClose();
  });

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleEscape();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen]);

  if (!isOpen) return null;

  const showBack = level > 0;
  const showBreadcrumbs = Boolean(breadcrumbs && breadcrumbs.length > 0);
  // Name the dialog from the title span when one is rendered (no breadcrumbs);
  // otherwise fall back to an explicit `aria-label` so consumers can name a
  // breadcrumb-driven drawer without the component hardcoding copy.
  const hasTitle = !showBreadcrumbs && Boolean(title);

  return createPortal(
    <ModalContext.Provider value={onClose}>
      <ModalTitleIdContext.Provider value={hasTitle ? titleId : null}>
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
            aria-labelledby={hasTitle ? titleId : undefined}
            aria-label={hasTitle ? undefined : ariaLabel}
            className={`${WINDOW_CLASSES} ${className ?? ''}`}
            style={{ width }}
          >
            {/* Header */}
            <div className={HEADER_CLASSES}>
              {showBack ? (
                <button className={BACK_BTN_CLASSES} onClick={onBack} title="Volver">
                  <LuChevronLeft size={18} />
                </button>
              ) : (
                <div style={{ width: 32 }} />
              )}

              {/* Breadcrumbs or Title */}
              {showBreadcrumbs ? (
                <nav className={BREADCRUMBS_CLASSES}>
                  {breadcrumbs!.map((crumb, i) => {
                    const isLast = i === breadcrumbs!.length - 1;
                    const canNavigate = !isLast && onNavigate;
                    return (
                      <span key={crumb.level} className={CRUMB_CLASSES}>
                        {i > 0 && <LuChevronRight size={12} className={CRUMB_SEP_CLASSES} />}
                        {canNavigate ? (
                          <button
                            className={CRUMB_LINK_CLASSES}
                            onClick={() => onNavigate!(crumb.level)}
                          >
                            {crumb.label}
                          </button>
                        ) : (
                          <span className={CRUMB_CURRENT_CLASSES}>{crumb.label}</span>
                        )}
                      </span>
                    );
                  })}
                </nav>
              ) : (
                <span id={titleId ?? undefined} className={TITLE_CLASSES}>
                  {title}
                </span>
              )}

              <button className={CLOSE_BTN_CLASSES} onClick={onClose} title="Cerrar">
                <LuX size={18} />
              </button>
            </div>

            {/* Level dots */}
            {level > 0 && !showBreadcrumbs && (
              <div className={LEVEL_INDICATOR_CLASSES}>
                {Array.from({ length: level + 1 }).map((_, i) => (
                  <span
                    key={i}
                    className={`${LEVEL_DOT_BASE_CLASSES} ${i === level ? LEVEL_DOT_ACTIVE_CLASSES : ''}`}
                  />
                ))}
              </div>
            )}

            {/* Content */}
            <div className={BODY_CLASSES}>
              <div
                className={`${CONTENT_INNER_CLASSES} ${SLIDE_ANIMATION_CLASSES[animDir]}`}
                key={level}
              >
                {children}
              </div>
            </div>
          </div>
        </div>
      </ModalTitleIdContext.Provider>
    </ModalContext.Provider>,
    document.body,
  );
}
