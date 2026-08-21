import { useState, useCallback } from 'react'
import { LuEye, LuCode, LuCopy, LuCheck, LuFileCode2, LuSettings2, LuRotateCcw } from 'react-icons/lu'
import Button from '../components/ui/Button'
import type { ButtonVariant, ButtonSize, ButtonShape, ButtonAnimation } from '../components/ui/Button'
import styles from './TablesShowcase.module.css'

// ─── Types ────────────────────────────────────────────────
type ViewMode = 'preview' | 'code'

interface ButtonConfig {
    variant: ButtonVariant
    size: ButtonSize
    shape: ButtonShape
    animation: ButtonAnimation
    label: string
    disabled: boolean
    loading: boolean
}

const DEFAULT_CONFIG: ButtonConfig = {
    variant: 'primary',
    size: 'md',
    shape: 'default',
    animation: 'none',
    label: 'Botón',
    disabled: false,
    loading: false,
}

// ─── Helpers ──────────────────────────────────────────────
function buildProps(config: ButtonConfig): string {
    const props: string[] = []
    if (config.variant !== 'primary') props.push('variant="' + config.variant + '"')
    if (config.size !== 'md') props.push('size="' + config.size + '"')
    if (config.shape !== 'default') props.push('shape="' + config.shape + '"')
    if (config.animation !== 'none') props.push('animation="' + config.animation + '"')
    if (config.loading) props.push('loading')
    if (config.disabled) props.push('disabled')
    return props.length > 0 ? ' ' + props.join(' ') : ''
}

function indent(str: string, spaces: number): string {
    const pad = ' '.repeat(spaces)
    return str.split('\n').map(function (l) { return pad + l }).join('\n')
}

// ─── CopyButton ───────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false)
    const handleCopy = useCallback(async () => {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }, [text])
    return (
        <button className={styles.copyBtn + (copied ? ' ' + styles.copyBtnCopied : '')} onClick={handleCopy}>
            {copied ? <LuCheck size={14} /> : <LuCopy size={14} />}
            {copied ? 'Copiado' : 'Copiar'}
        </button>
    )
}

function CodeBlock({ filename, code }: { filename: string; code: string }) {
    return (
        <div className={styles.codeBlock}>
            <div className={styles.codeHeader}>
                <span className={styles.codeFilename}>
                    <span className={styles.codeFilenameIcon}><LuFileCode2 size={14} /></span>
                    {filename}
                </span>
                <CopyButton text={code} />
            </div>
            <pre className={styles.codeContent}>{code}</pre>
        </div>
    )
}

// ─── Configurator Panel ───────────────────────────────────
function ConfiguratorPanel({
    config,
    onChange,
    onReset,
}: {
    config: ButtonConfig
    onChange: (patch: Partial<ButtonConfig>) => void
    onReset: () => void
}) {
    const [collapsed, setCollapsed] = useState(false)
    var variantOpts: { value: ButtonVariant; label: string }[] = [
        { value: 'primary', label: 'Primary' },
        { value: 'secondary', label: 'Secondary' },
        { value: 'ghost', label: 'Ghost' },
        { value: 'danger', label: 'Danger' },
    ]
    var sizeOpts: { value: ButtonSize; label: string }[] = [
        { value: 'sm', label: 'SM' },
        { value: 'md', label: 'MD' },
        { value: 'lg', label: 'LG' },
    ]
    var shapeOpts: { value: ButtonShape; label: string; desc: string }[] = [
        { value: 'default', label: 'Default', desc: '10px radius' },
        { value: 'rounded', label: 'Rounded', desc: 'Pill / fully rounded' },
        { value: 'square', label: 'Square', desc: '0px radius' },
    ]
    var animOpts: { value: ButtonAnimation; label: string }[] = [
        { value: 'none', label: 'Ninguna' },
        { value: 'pulse', label: 'Pulse' },
        { value: 'bounce', label: 'Bounce' },
        { value: 'shake', label: 'Shake' },
    ]

    return (
        <div className={styles.configurator}>
            <div className={styles.configHeader}>
                <span className={styles.configIcon}><LuSettings2 size={18} /></span>
                <span className={styles.configTitle}>Configurador</span>
                <button className={styles.collapseBtn + (collapsed ? ' ' + styles.collapseBtnCollapsed : '')} onClick={function () { setCollapsed(!collapsed) }} title={collapsed ? 'Expandir' : 'Colapsar'}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </button>
                <button className={styles.resetBtn} onClick={onReset} title="Restaurar"><LuRotateCcw size={14} /></button>
            </div>

            {!collapsed && (
            <>
            <div className={styles.configGroup}>
                <label className={styles.configLabel}>Variante</label>
                <div style={{ display: 'flex', gap: 6 }}>
                    {variantOpts.map(function (opt) {
                        return (
                            <button
                                key={opt.value}
                                className={styles.radioCard + (config.variant === opt.value ? ' ' + styles.radioCardActive : '')}
                                onClick={function () { onChange({ variant: opt.value }) }}
                                style={{ flex: 1, textAlign: 'center', padding: '8px 4px' }}
                            >
                                <span className={styles.radioLabel} style={{ fontSize: 12 }}>{opt.label}</span>
                            </button>
                        )
                    })}
                </div>
            </div>

            <div className={styles.configGroup}>
                <label className={styles.configLabel}>Tamaño</label>
                <div style={{ display: 'flex', gap: 6 }}>
                    {sizeOpts.map(function (opt) {
                        return (
                            <button
                                key={opt.value}
                                className={styles.radioCard + (config.size === opt.value ? ' ' + styles.radioCardActive : '')}
                                onClick={function () { onChange({ size: opt.value }) }}
                                style={{ flex: 1, textAlign: 'center', padding: '8px 4px' }}
                            >
                                <span className={styles.radioLabel} style={{ fontSize: 12 }}>{opt.label}</span>
                            </button>
                        )
                    })}
                </div>
            </div>

            <div className={styles.configGroup}>
                <label className={styles.configLabel}>Forma</label>
                <div style={{ display: 'flex', gap: 6 }}>
                    {shapeOpts.map(function (opt) {
                        return (
                            <button
                                key={opt.value}
                                className={styles.radioCard + (config.shape === opt.value ? ' ' + styles.radioCardActive : '')}
                                onClick={function () { onChange({ shape: opt.value }) }}
                                style={{ flex: 1, textAlign: 'center', padding: '8px 4px' }}
                            >
                                <span className={styles.radioLabel} style={{ fontSize: 12 }}>{opt.label}</span>
                                <span className={styles.radioDesc}>{opt.desc}</span>
                            </button>
                        )
                    })}
                </div>
            </div>

            <div className={styles.configGroup}>
                <label className={styles.configLabel}>Animación (hover)</label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {animOpts.map(function (opt) {
                        return (
                            <button
                                key={opt.value}
                                className={styles.radioCard + (config.animation === opt.value ? ' ' + styles.radioCardActive : '')}
                                onClick={function () { onChange({ animation: opt.value }) }}
                                style={{ padding: '6px 12px' }}
                            >
                                <span className={styles.radioLabel} style={{ fontSize: 12 }}>{opt.label}</span>
                            </button>
                        )
                    })}
                </div>
            </div>

            <div className={styles.configGroup}>
                <label className={styles.configLabel}>Texto del botón</label>
                <input
                    type="text"
                    value={config.label}
                    onChange={function (e) { onChange({ label: e.target.value }) }}
                    placeholder="Texto del botón"
                    style={{
                        width: '100%', padding: '8px 12px', border: '1px solid var(--border)',
                        borderRadius: 8, fontSize: 13, background: 'var(--bg)', color: 'var(--text-h)',
                        fontFamily: 'var(--sans)', boxSizing: 'border-box',
                    }}
                />
            </div>

            <div className={styles.configGroup}>
                <label className={styles.configLabel}>Estado</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {[
                        { key: 'disabled' as const, label: 'Deshabilitado', desc: 'No interaction' },
                        { key: 'loading' as const, label: 'Loading', desc: 'Spinner + disabled' },
                    ].map(function (item) {
                        return (
                            <div key={item.key} className={styles.toggleItem}>
                                <div className={styles.toggleInfo}>
                                    <span className={styles.toggleName}>{item.label}</span>
                                    <span className={styles.toggleDesc}>{item.desc}</span>
                                </div>
                                <button
                                    className={styles.toggleSwitch + (config[item.key] ? ' ' + styles.toggleSwitchOn : '')}
                                    onClick={function () { var patch: Record<string, boolean> = {}; patch[item.key] = !config[item.key]; onChange(patch as Partial<ButtonConfig>) }}
                                    type="button"
                                >
                                    <span className={styles.toggleKnob} />
                                </button>
                            </div>
                        )
                    })}
                </div>
            </div>

            <div className={styles.configSummary}>
                <span className={styles.summaryLabel}>Configuración:</span>
                <div className={styles.summaryFlags}>
                    <span className={styles.flagBadge}>{config.variant}</span>
                    <span className={styles.flagBadge}>{config.size}</span>
                    <span className={styles.flagBadge}>{config.shape}</span>
                    {config.animation !== 'none' && <span className={styles.flagBadge}>anim: {config.animation}</span>}
                    {config.disabled && <span className={styles.flagBadge}>disabled</span>}
                    {config.loading && <span className={styles.flagBadge}>loading</span>}
                </div>
            </div>
            </>
            )}
        </div>
    )
}

// ─── Generated Code (functional) ──────────────────────────
function GeneratedCode({ config }: { config: ButtonConfig }) {
    var props = buildProps(config)
    var filename = ''
    var code = ''

    // ── Primary: Form submission ──
    if (config.variant === 'primary') {
        filename = 'ContactForm.tsx'
        code = [
            "import { useState } from 'react'",
            "import Button from '../components/ui/Button'",
            "",
            "export default function ContactForm() {",
            "    const [email, setEmail] = useState('')",
            indent(config.loading || true ? "const [loading, setLoading] = useState(false)" : "", 4),
            "",
            "    const handleSubmit = async (e: React.FormEvent) => {",
            "        e.preventDefault()",
            "        setLoading(true)",
            "        try {",
            "            const res = await fetch('/api/contact', {",
            "                method: 'POST',",
            "                headers: { 'Content-Type': 'application/json' },",
            "                body: JSON.stringify({ email }),",
            "            })",
            "            if (!res.ok) throw new Error('Error del servidor')",
            "            alert('¡Mensaje enviado!')",
            "            setEmail('')",
            "        } catch (err) {",
            "            alert('Error: ' + (err as Error).message)",
            "        } finally {",
            "            setLoading(false)",
            "        }",
            "    }",
            "",
            "    return (",
            "        <form onSubmit={handleSubmit}>",
            "            <input",
            "                type=\"email\"",
            "                value={email}",
            "                onChange={(e) => setEmail(e.target.value)}",
            "                placeholder=\"tu@email.com\"",
            "                required",
            "            />",
            indent("<Button" + props + " type=\"submit\">", 12),
            indent("    {loading ? 'Enviando...' : '" + config.label + "'}", 12),
            indent("</Button>", 12),
            "        </form>",
            "    )",
            "}",
        ].join('\n')
    }

    // ── Danger: Delete with confirmation ──
    else if (config.variant === 'danger') {
        filename = 'DeleteUserButton.tsx'
        code = [
            "import { useState } from 'react'",
            "import Button from '../components/ui/Button'",
            "",
            "interface Props {",
            "    userId: string",
            "    userName: string",
            "    onDeleted: (id: string) => void",
            "}",
            "",
            "export default function DeleteUserButton({ userId, userName, onDeleted }: Props) {",
            "    const [loading, setLoading] = useState(false)",
            "",
            "    const handleDelete = async () => {",
            "        const ok = window.confirm(`¿Eliminar a ${userName}?\\n\\nEsta acción no se puede deshacer.`)",
            "        if (!ok) return",
            "",
            "        setLoading(true)",
            "        try {",
            "            const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' })",
            "            if (!res.ok) throw new Error('No se pudo eliminar')",
            "            onDeleted(userId)  // Notificar al padre para actualizar la lista",
            "        } catch (err) {",
            "            alert('Error: ' + (err as Error).message)",
            "        } finally {",
            "            setLoading(false)",
            "        }",
            "    }",
            "",
            "    return (",
            indent("<Button" + props + " onClick={handleDelete}>", 8),
            indent("    {loading ? 'Eliminando...' : '" + config.label + "'}", 8),
            indent("</Button>", 8),
            "    )",
            "}",
        ].join('\n')
    }

    // ── Ghost: Menu toggle / navigation ──
    else if (config.variant === 'ghost') {
        filename = 'UserMenu.tsx'
        code = [
            "import { useState, useRef, useEffect } from 'react'",
            "import Button from '../components/ui/Button'",
            "",
            "export default function UserMenu() {",
            "    const [open, setOpen] = useState(false)",
            "    const menuRef = useRef<HTMLDivElement>(null)",
            "",
            "    // Cerrar al hacer click afuera",
            "    useEffect(() => {",
            "        const handleClick = (e: MouseEvent) => {",
            "            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {",
            "                setOpen(false)",
            "            }",
            "        }",
            "        document.addEventListener('mousedown', handleClick)",
            "        return () => document.removeEventListener('mousedown', handleClick)",
            "    }, [])",
            "",
            "    const handleAction = (action: string) => {",
            "        setOpen(false)",
            "        console.log('Acción:', action)",
            "    }",
            "",
            "    return (",
            "        <div ref={menuRef} style={{ position: 'relative', display: 'inline-block' }}>",
            indent("<Button" + props + " onClick={() => setOpen(!open)}>", 12),
            indent("    {open ? 'Cerrar menú' : 'Menú'}", 12),
            indent("</Button>", 12),
            "",
            "            {open && (",
            "                <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 4, ... }}>",
            "                    <button onClick={() => handleAction('profile')}>Mi perfil</button>",
            "                    <button onClick={() => handleAction('settings')}>Configuración</button>",
            "                    <button onClick={() => handleAction('logout')}>Cerrar sesión</button>",
            "                </div>",
            "            )}",
            "        </div>",
            "    )",
            "}",
        ].join('\n')
    }

    // ── Secondary: Cancel / close action ──
    else if (config.variant === 'secondary') {
        filename = 'ConfirmDialog.tsx'
        code = [
            "import { useState } from 'react'",
            "import Button from '../components/ui/Button'",
            "",
            "interface Props {",
            "    title: string",
            "    message: string",
            "    onConfirm: () => void",
            "}",
            "",
            "export default function ConfirmDialog({ title, message, onConfirm }: Props) {",
            "    const [visible, setVisible] = useState(true)",
            "",
            "    if (!visible) return null",
            "",
            "    const handleCancel = () => {",
            "        setVisible(false)",
            "        console.log('Acción cancelada por el usuario')",
            "    }",
            "",
            "    const handleConfirm = () => {",
            "        setVisible(false)",
            "        onConfirm()  // Ejecutar la acción real",
            "    }",
            "",
            "    return (",
            "        <div className=\"dialog-overlay\">",
            "            <div className=\"dialog\">",
            "                <h3>{title}</h3>",
            "                <p>{message}</p>",
            "                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>",
            indent("<Button" + props + " onClick={handleCancel}>", 16),
            indent("    Cancelar", 16),
            indent("</Button>", 16),
            "                    <Button variant=\"danger\" onClick={handleConfirm}>",
            "                        Confirmar",
            "                    </Button>",
            "                </div>",
            "            </div>",
            "        </div>",
            "    )",
            "}",
        ].join('\n')
    }

    // ── Fallback ──
    else {
        filename = 'App.tsx'
        code = [
            "import { useState } from 'react'",
            "import Button from '../components/ui/Button'",
            "",
            "export default function App() {",
            "    const [count, setCount] = useState(0)",
            "",
            "    return (",
            "        <div>",
            "            <p>Contador: {count}</p>",
            indent("<Button" + props + " onClick={() => setCount(c => c + 1)}>", 12),
            indent("    " + config.label + " ({count})", 12),
            indent("</Button>", 12),
            "        </div>",
            "    )",
            "}",
        ].join('\n')
    }

    return (
        <div className={styles.codeStack}>
            <CodeBlock filename={filename} code={code} />
        </div>
    )
}

// ─── Main Component ───────────────────────────────────────
export default function ComponentesBotones() {
    const [view, setView] = useState<ViewMode>('preview')
    const [config, setConfig] = useState<ButtonConfig>(DEFAULT_CONFIG)

    const handleChange = useCallback((patch: Partial<ButtonConfig>) => {
        setConfig((prev) => ({ ...prev, ...patch }))
    }, [])

    const handleReset = useCallback(() => {
        setConfig(DEFAULT_CONFIG)
    }, [])

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div className={styles.toggleBar}>
                    <button className={styles.toggleBtn + (view === 'preview' ? ' ' + styles.toggleActive : '')} onClick={function () { setView('preview') }}>
                        <span className={styles.toggleIcon}><LuEye size={16} /></span>
                        Configurador
                    </button>
                    <button className={styles.toggleBtn + (view === 'code' ? ' ' + styles.toggleActive : '')} onClick={function () { setView('code') }}>
                        <span className={styles.toggleIcon}><LuCode size={16} /></span>
                        Código Generado
                    </button>
                </div>
            </div>

            <div className={styles.builderLayout}>
                <ConfiguratorPanel config={config} onChange={handleChange} onReset={handleReset} />
                <div className={styles.previewArea}>
                    <div className={styles.previewHeader}>
                        <span className={styles.previewLabel}>{view === 'preview' ? 'Vista previa en vivo' : 'Código generado'}</span>
                        <span className={styles.previewComponent}>
                            {config.variant} · {config.size} · {config.shape} · {config.animation !== 'none' ? config.animation : 'sin anim'}
                        </span>
                    </div>
                    <div className={styles.tableWrapper} style={{ padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {view === 'preview' ? (
                            <Button
                                variant={config.variant}
                                size={config.size}
                                shape={config.shape}
                                animation={config.animation}
                                disabled={config.disabled}
                                loading={config.loading}
                            >
                                {config.label}
                            </Button>
                        ) : (
                            <GeneratedCode config={config} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
