import { useState, type ReactNode } from 'react'
import { LuCheck, LuCircleAlert, LuTriangleAlert, LuInfo, LuFileCode2 } from 'react-icons/lu'
import { useToast } from '../components/ui/Toast'
import { ConfirmDialog } from '../components/ui/Modal'
import type { ConfirmVariant } from '../components/ui/Modal'
import Button from '../components/ui/Button'
import { CopyButton } from '../components/ui/Showcase'
import styles from './TablesShowcase.module.css'

// ─── Toast variants ───────────────────────────────────────
const toastVariants = [
    { key: 'success' as const, label: 'Success', color: '#22c55e', icon: <LuCheck size={16} />, message: 'Cambios guardados correctamente' },
    { key: 'error' as const, label: 'Error', color: '#ef4444', icon: <LuCircleAlert size={16} />, message: 'Error al guardar los cambios' },
    { key: 'warning' as const, label: 'Warning', color: '#f59e0b', icon: <LuTriangleAlert size={16} />, message: 'Sesión por expirar en 5 minutos' },
    { key: 'info' as const, label: 'Info', color: '#3b82f6', icon: <LuInfo size={16} />, message: 'Nueva actualización disponible' },
]

// ─── Confirm variants ─────────────────────────────────────
const confirmVariants: {
    variant: ConfirmVariant
    label: string
    desc: string
    color: string
    bg: string
    icon: ReactNode
    title: string
    message: string
    confirmLabel: string
    toastMsg: string
    toastVariant: 'success' | 'warning'
}[] = [
    {
        variant: 'default', label: 'Default', desc: 'Confirmar acción normal',
        color: '#22c55e', bg: 'rgba(34,197,94,0.04)', icon: <LuCheck size={16} />,
        title: 'Confirmar acción', message: '¿Deseas proceder? Se aplicarán los cambios inmediatamente.',
        confirmLabel: 'Confirmar', toastMsg: 'Acción completada correctamente', toastVariant: 'success',
    },
    {
        variant: 'destructive', label: 'Destructive', desc: 'Eliminar o desactivar',
        color: '#dc2626', bg: 'rgba(220,38,38,0.04)', icon: <LuCircleAlert size={16} />,
        title: 'Eliminar usuario', message: '¿Estás seguro? Esta acción no se puede deshacer. Se eliminarán todos los datos asociados.',
        confirmLabel: 'Eliminar', toastMsg: 'Usuario eliminado correctamente', toastVariant: 'success',
    },
    {
        variant: 'warning', label: 'Warning', desc: 'Acción con precaución',
        color: '#f59e0b', bg: 'rgba(245,158,11,0.04)', icon: <LuTriangleAlert size={16} />,
        title: 'Cerrar sesión', message: 'Tienes cambios sin guardar. Si cierras sesión, perderás los cambios no guardados.',
        confirmLabel: 'Cerrar sesión', toastMsg: 'La sesión se cerrará en 60 segundos', toastVariant: 'warning',
    },
    {
        variant: 'info', label: 'Info', desc: 'Información o permisos',
        color: '#3b82f6', bg: 'rgba(59,130,246,0.04)', icon: <LuInfo size={16} />,
        title: 'Actualizar permisos', message: 'El usuario tendrá acceso de lectura y escritura a todos los archivos del proyecto.',
        confirmLabel: 'Actualizar', toastMsg: 'Permisos actualizados', toastVariant: 'success',
    },
]


// ─── Page ─────────────────────────────────────────────────
export default function ComponentesNotificaciones() {
    const toast = useToast()
    const [actionLog, setActionLog] = useState<string[]>([])
    const [confirmOpen, setConfirmOpen] = useState<string | null>(null)

    const activeConfirm = confirmVariants.find((v) => v.variant === confirmOpen)

    return (
        <div className={styles.page}>


            {/* ════════════════════════════════════════════
                TOASTS
               ════════════════════════════════════════════ */}
            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Toasts</h2>
                <p className={styles.sectionDesc}>
                    Notificaciones efímeras con API imperativa. 4 variantes, auto-close, pause on hover y link de acción.
                </p>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {toastVariants.map((v) => (
                        <Button
                            key={v.key}
                            variant="ghost"
                            color={v.color}
                            colorBg={`${v.color}0a`}
                            onClick={() => toast[v.key](v.message)}
                            style={{ border: `1.5px solid ${v.color}20` }}
                        >
                            {v.icon} {v.label}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Con acción */}
            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Con link de acción</h2>
                <p className={styles.sectionDesc}>
                    Los toasts pueden incluir un link que ejecuta una acción (Reintentar, Deshacer, Ver).
                </p>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <Button
                        variant="ghost"
                        color="#dc2626"
                        colorBg="rgba(220,38,38,0.08)"
                        onClick={() => {
                            toast.error('Error de red', {
                                action: {
                                    label: 'Reintentar',
                                    onClick: () => {
                                        setActionLog((prev) => [...prev, `Reintentado a las ${new Date().toLocaleTimeString()}`])
                                        toast.success('Reconexión exitosa')
                                    },
                                },
                            })
                        }}
                    >
                        Error + Reintentar
                    </Button>
                    <Button
                        variant="ghost"
                        color="#22c55e"
                        colorBg="rgba(34,197,94,0.08)"
                        onClick={() => {
                            toast.success('Borrador guardado', {
                                action: { label: 'Ver borrador', onClick: () => toast.info('Navegando al borrador...') }
                            })
                        }}
                    >
                        Success + Ver
                    </Button>
                    <Button
                        variant="ghost"
                        color="#d97706"
                        colorBg="rgba(245,158,11,0.08)"
                        onClick={() => {
                            toast.warning('Tu sesión expira en 5 minutos', {
                                action: { label: 'Extender sesión', onClick: () => toast.success('Sesión extendida 30 min más') }
                            })
                        }}
                    >
                        Warning + Extender
                    </Button>
                </div>
                {actionLog.length > 0 && (
                    <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text)', opacity: 0.6 }}>
                        {actionLog.map((log, i) => <div key={i}>• {log}</div>)}
                    </div>
                )}
            </div>

            {/* API */}
            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>API</h2>
                <div className={styles.codeBlock}>
                    <div className={styles.codeHeader}>
                        <span className={styles.codeFilename}>
                            <span className={styles.codeFilenameIcon}><LuFileCode2 size={14} /></span>
                            useToast()
                        </span>
                        <CopyButton text={`import { useToast } from '../components/ui/Toast'\n\nconst toast = useToast()\n\ntoast.success('Guardado')\ntoast.error('Error')\ntoast.warning('Advertencia')\ntoast.info('Info')\n\ntoast.error('Error de red', {\n    action: { label: 'Reintentar', onClick: retry },\n    duration: 8000,\n})`} />
                    </div>
                    <pre className={styles.codeContent}>
{`import { useToast } from '../components/ui/Toast'

const toast = useToast()

// Básico
toast.success('Guardado')
toast.error('Error')
toast.warning('Advertencia')
toast.info('Info')

// Con link de acción
toast.error('Error de red', {
    action: { label: 'Reintentar', onClick: retry },
    duration: 8000,
})`}
                    </pre>
                </div>
            </div>

            <div className={styles.divider} />

            {/* ════════════════════════════════════════════
                CONFIRMACIONES
               ════════════════════════════════════════════ */}
            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Confirmaciones</h2>
                <p className={styles.sectionDesc}>
                    Modales de confirmación con 4 variantes. Cada una tiene su icono y color automáticos. Después de confirmar se muestra un toast con el resultado.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                    {confirmVariants.map((v) => (
                        <button
                            key={v.variant}
                            onClick={() => setConfirmOpen(v.variant)}
                            style={{
                                padding: '14px 20px', borderRadius: 12,
                                border: `1px solid ${v.color}33`,
                                background: v.bg, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left',
                                fontFamily: 'var(--sans)', transition: 'border-color 0.15s, background 0.15s',
                            }}
                        >
                            <div style={{
                                width: 40, height: 40, borderRadius: 10,
                                background: `${v.color}1a`, color: v.color,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 18, flexShrink: 0, fontWeight: 600,
                            }}>
                                {v.icon}
                            </div>
                            <div>
                                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-h)', marginBottom: 2 }}>{v.label}</div>
                                <div style={{ fontSize: 12, color: 'var(--text)' }}>{v.desc}</div>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Single dynamic ConfirmDialog */}
                {activeConfirm && (
                    <ConfirmDialog
                        isOpen={!!confirmOpen}
                        onClose={() => setConfirmOpen(null)}
                        onConfirm={() => {
                            setConfirmOpen(null)
                            toast[activeConfirm.toastVariant](activeConfirm.toastMsg)
                        }}
                        title={activeConfirm.title}
                        message={activeConfirm.message}
                        confirmLabel={activeConfirm.confirmLabel}
                        cancelLabel="Cancelar"
                        variant={activeConfirm.variant}
                    />
                )}
            </div>

            {/* ConfirmDialog API */}
            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>API ConfirmDialog</h2>
                <div className={styles.codeBlock}>
                    <div className={styles.codeHeader}>
                        <span className={styles.codeFilename}>
                            <span className={styles.codeFilenameIcon}><LuFileCode2 size={14} /></span>
                            ConfirmDialog.tsx
                        </span>
                        <CopyButton text={`import { ConfirmDialog } from '../components/ui/Modal'\nimport { useToast } from '../components/ui/Toast'\n\nconst [open, setOpen] = useState(false)\nconst toast = useToast()\n\n<ConfirmDialog\n    isOpen={open}\n    onClose={() => setOpen(false)}\n    onConfirm={() => {\n        setOpen(false)\n        toast.success('Hecho')\n    }}\n    title="Eliminar usuario"\n    message="¿Estás seguro?"\n    confirmLabel="Eliminar"\n    cancelLabel="Cancelar"\n    variant="destructive"  // default | destructive | warning | info\n/>`} />
                    </div>
                    <pre className={styles.codeContent}>
{`import { ConfirmDialog } from '../components/ui/Modal'
import { useToast } from '../components/ui/Toast'

const [open, setOpen] = useState(false)
const toast = useToast()

<ConfirmDialog
    isOpen={open}
    onClose={() => setOpen(false)}
    onConfirm={() => {
        setOpen(false)
        toast.success('Hecho')
    }}
    title="Eliminar usuario"
    message="¿Estás seguro?"
    confirmLabel="Eliminar"
    cancelLabel="Cancelar"
    variant="destructive"  // default | destructive | warning | info
/>`}
                    </pre>
                </div>
            </div>
        </div>
    )
}
