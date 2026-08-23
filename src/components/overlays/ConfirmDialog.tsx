import { LuCircleCheck, LuCircleAlert, LuTriangleAlert, LuInfo } from 'react-icons/lu'
import { Modal } from './Modal'

// ─── Types ────────────────────────────────────────────────
export type ConfirmVariant = 'default' | 'destructive' | 'warning' | 'info'

export interface ConfirmDialogProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    message: string
    confirmLabel?: string
    cancelLabel?: string
    variant?: ConfirmVariant
    /** Override the auto-generated icon */
    icon?: React.ReactNode
}

// ─── Styling ──────────────────────────────────────────────
// Colors consume the semantic status tokens. Exact legacy matches:
// default -> success (#22c55e / #16a34a hover), destructive -> danger-strong
// family (rgba(220,38,38,*) literals), warning base/hover -> warning tokens,
// info -> info tokens.
const CONTENT_CLASSES = 'flex flex-col items-center text-center gap-4 py-2'

const ICON_BASE_CLASSES =
    'flex items-center justify-center size-14 rounded-full text-2xl transition-transform duration-200 ease-in-out hover:scale-105'

const VARIANT_CONFIG: Record<
    ConfirmVariant,
    { icon: React.ReactNode; iconClasses: string; confirmClasses: string }
> = {
    default: {
        icon: <LuCircleCheck size={24} />,
        iconClasses: 'bg-success-bg text-success',
        confirmClasses:
            'border-none bg-success text-white hover:bg-success-strong',
    },
    destructive: {
        icon: <LuCircleAlert size={24} />,
        iconClasses: 'bg-danger-strong/10 text-danger-strong',
        confirmClasses:
            'border border-danger-line bg-danger-strong/8 text-danger-strong hover:bg-danger-strong hover:text-white hover:border-danger-strong',
    },
    warning: {
        icon: <LuTriangleAlert size={24} />,
        iconClasses: 'bg-warning-bg text-warning',
        confirmClasses:
            'border border-warning-line bg-warning/8 text-warning-strong hover:bg-warning hover:text-white hover:border-warning',
    },
    info: {
        icon: <LuInfo size={24} />,
        iconClasses: 'bg-info-bg text-info',
        confirmClasses:
            'border border-info-line bg-info/8 text-info-strong hover:bg-info hover:text-white hover:border-info',
    },
}

const MESSAGE_CLASSES = 'text-sm leading-[1.6] text-foreground m-0 max-w-[340px]'

const BTN_BASE_CLASSES =
    'px-5 py-2 rounded-md text-[13px] font-semibold font-sans cursor-pointer transition-[background-color,color,border-color] duration-150'
const CANCEL_CLASSES = 'border border-border-base bg-background text-foreground hover:border-accent-line hover:text-heading'

// ─── Component ────────────────────────────────────────────
export function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = 'Confirmar',
    cancelLabel = 'Cancelar',
    variant = 'default',
    icon,
}: ConfirmDialogProps) {
    const config = VARIANT_CONFIG[variant]

    const handleConfirm = () => {
        onConfirm()
        onClose()
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} width={420}>
            <Modal.Header title={title} showClose />
            <Modal.Body>
                <div className={CONTENT_CLASSES}>
                    <div className={`${ICON_BASE_CLASSES} ${config.iconClasses}`}>
                        {icon || config.icon}
                    </div>
                    <p className={MESSAGE_CLASSES}>{message}</p>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <button className={`${BTN_BASE_CLASSES} ${CANCEL_CLASSES}`} onClick={onClose}>
                    {cancelLabel}
                </button>
                <button
                    className={`${BTN_BASE_CLASSES} ${config.confirmClasses}`}
                    onClick={handleConfirm}
                >
                    {confirmLabel}
                </button>
            </Modal.Footer>
        </Modal>
    )
}
