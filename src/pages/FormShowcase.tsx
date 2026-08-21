import { useState, useCallback } from 'react'
import { LuEye, LuCode, LuCopy, LuCheck, LuFileCode2, LuSettings2, LuRotateCcw, LuTrash2, LuPlus, LuChevronRight, LuApple, LuPaintbrush, LuSquarePen } from 'react-icons/lu'
import styles from './TablesShowcase.module.css'

// ─── Form Components ─────────────────────────────────────
import Input from '../components/ui/Form/Input'
import Textarea from '../components/ui/Form/Textarea'
import Select from '../components/ui/Form/Select'
import Checkbox from '../components/ui/Form/Checkbox'
import { RadioGroup } from '../components/ui/Form/Radio'
import FormField from '../components/ui/Form/FormField'
import { RowBlock } from '../components/ui/Form/FormBuilder/FieldCard'
import type { DragData } from '../components/ui/Form/FormBuilder/FieldCard'
import { FieldConfigModal } from '../components/ui/Form/FormBuilder/FieldConfigModal'
import type { InputVariant, FieldConfig } from '../components/ui/Form/types'

// ─── Types ───────────────────────────────────────────────
type LabelMode = 'above' | 'placeholder' | 'none'
type ViewMode = 'preview' | 'code'
type ConfigTab = 'variants' | 'fields' | 'validation' | 'sections'

interface EditingField {
    sectionIndex: number
    rowIndex: number
    fieldIndex: number
}

interface RowConfig {
    columns: 1 | 2 | 3
    fields: FieldConfig[]
}

interface SectionConfig {
    title: string
    description: string
    rows: RowConfig[]
}

interface FormConfig {
    sections: SectionConfig[]
    labelMode: LabelMode
    inputVariant: InputVariant
    isMultiStep: boolean
}

const DEFAULT_SECTIONS: SectionConfig[] = [
    {
        title: 'Información personal',
        description: 'Datos básicos del contacto',
        rows: [
            { columns: 2, fields: [
                { type: 'text', label: 'Nombre', placeholder: 'Tu nombre completo', required: true, minLength: 2, maxLength: 100 },
                { type: 'email', label: 'Email', placeholder: 'correo@ejemplo.com', required: true },
            ]},
            { columns: 2, fields: [
                { type: 'tel', label: 'Teléfono', placeholder: '+52 55 1234 5678', required: false, pattern: '^\\+?[0-9]{10,13}$' },
                { type: 'select', label: 'Departamento', placeholder: 'Seleccionar...', required: true, options: ['Tecnología', 'Diseño', 'Marketing', 'Ventas'] },
            ]},
        ],
    },
    {
        title: 'Detalles',
        description: 'Información adicional',
        rows: [
            { columns: 1, fields: [
                { type: 'textarea', label: 'Mensaje', placeholder: 'Escribe tu mensaje...', required: true, minLength: 10, maxLength: 500 },
            ]},
            { columns: 2, fields: [
                { type: 'checkbox', label: 'Acepto los términos', placeholder: '', required: true },
                { type: 'radio', label: 'Urgencia', placeholder: '', required: true, options: ['Baja', 'Media', 'Alta'] },
            ]},
        ],
    },
]

// ─── Helpers ─────────────────────────────────────────────
const fieldToKey = (label: string) => label.toLowerCase().replace(/\s/g, '_')

// ─── CopyButton ──────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false)
    const handleCopy = useCallback(async () => {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }, [text])
    return (
        <button className={`${styles.copyBtn} ${copied ? styles.copyBtnCopied : ''}`} onClick={handleCopy}>
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

// ─── Live Preview ────────────────────────────────────────
function LivePreview({ config }: { config: FormConfig }) {
    const [formData, setFormData] = useState<Record<string, string>>({})
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [currentStep, setCurrentStep] = useState(0)

    const allFields = config.sections.flatMap((s) => s.rows.flatMap((r) => r.fields))

    const setField = (key: string, value: string) => {
        setFormData((prev) => ({ ...prev, [key]: value }))
        if (errors[key]) setErrors((prev) => { const n = { ...prev }; delete n[key]; return n })
    }

    const validate = () => {
        const errs: Record<string, string> = {}
        allFields.forEach((f) => {
            const key = fieldToKey(f.label)
            const val = formData[key] ?? ''
            if (f.required && !val) errs[key] = `${f.label} es requerido`
            if (f.type === 'email' && val && !val.includes('@')) errs[key] = 'Email inválido'
            if (f.minLength && val && val.length < f.minLength) errs[key] = `Mínimo ${f.minLength} caracteres`
            if (f.maxLength && val && val.length > f.maxLength) errs[key] = `Máximo ${f.maxLength} caracteres`
            if (f.pattern && val && !new RegExp(f.pattern).test(val)) errs[key] = 'Formato inválido'
        })
        setErrors(errs)
        return Object.keys(errs).length === 0
    }

    const validateSection = (sectionIdx: number) => {
        const section = config.sections[sectionIdx]
        if (!section) return true
        const sectionFields = section.rows.flatMap((r) => r.fields)
        const errs: Record<string, string> = {}
        sectionFields.forEach((f) => {
            const key = fieldToKey(f.label)
            const val = formData[key] ?? ''
            if (f.required && !val) errs[key] = `${f.label} es requerido`
            if (f.type === 'email' && val && !val.includes('@')) errs[key] = 'Email inválido'
            if (f.minLength && val && val.length < f.minLength) errs[key] = `Mínimo ${f.minLength} caracteres`
            if (f.maxLength && val && val.length > f.maxLength) errs[key] = `Máximo ${f.maxLength} caracteres`
            if (f.pattern && val && !new RegExp(f.pattern).test(val)) errs[key] = 'Formato inválido'
        })
        setErrors(errs)
        return Object.keys(errs).length === 0
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (validate()) { /* integrar con API real */ }
    }

    const handleNext = () => {
        if (validateSection(currentStep)) setCurrentStep((s) => s + 1)
    }

    const renderField = (field: FieldConfig) => {
        const key = fieldToKey(field.label)
        const showLabel = config.labelMode === 'above'
        const placeholder = config.labelMode === 'placeholder' ? field.label : field.placeholder
        const err = errors[key]
        const req = field.required
        const v = config.inputVariant

        if (field.type === 'checkbox') return (
            <FormField key={key} error={err} required={req}>
                <Checkbox checked={formData[key] === 'true'} onChange={(cv) => setField(key, cv ? 'true' : '')} label={field.label} variant={v} />
            </FormField>
        )
        if (field.type === 'radio') return (
            <FormField key={key} label={showLabel ? field.label : undefined} error={err} required={req}>
                <RadioGroup value={formData[key] ?? ''} onChange={(rv) => setField(key, rv)} options={(field.options ?? []).map((o) => ({ value: o, label: o }))} variant={v} />
            </FormField>
        )
        return (
            <FormField key={key} label={showLabel ? field.label : undefined} error={err} required={req}>
                {field.type === 'select' ? (
                    <Select value={formData[key] ?? ''} onChange={(sv) => setField(key, sv)} options={(field.options ?? []).map((o) => ({ value: o, label: o }))} placeholder={placeholder} variant={v} />
                ) : field.type === 'textarea' ? (
                    <Textarea value={formData[key] ?? ''} onChange={(tv) => setField(key, tv)} placeholder={placeholder} variant={v} />
                ) : (
                    <Input type={field.type as 'text' | 'email' | 'password' | 'number' | 'tel'} value={formData[key] ?? ''} onChange={(iv) => setField(key, iv)} placeholder={placeholder} variant={v} />
                )}
            </FormField>
        )
    }

    const visibleSections = config.isMultiStep ? [config.sections[currentStep]] : config.sections

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Step indicator */}
            {config.isMultiStep && config.sections.length > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {config.sections.map((section, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button
                                type="button"
                                onClick={() => setCurrentStep(i)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    padding: '6px 12px', borderRadius: '8px',
                                    border: `1.5px solid ${i === currentStep ? 'var(--accent)' : 'var(--border)'}`,
                                    background: i === currentStep ? 'var(--accent-bg)' : 'var(--bg)',
                                    color: i === currentStep ? 'var(--accent)' : 'var(--text)',
                                    fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--sans)',
                                }}
                            >
                                <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: i === currentStep ? 'var(--accent)' : 'var(--border)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700 }}>
                                    {i + 1}
                                </span>
                                {section.title}
                            </button>
                            {i < config.sections.length - 1 && <LuChevronRight size={14} style={{ color: 'var(--text)', opacity: 0.3 }} />}
                        </div>
                    ))}
                </div>
            )}

            {/* Sections */}
            {visibleSections.map((section, sIdx) => {
                const realIdx = config.isMultiStep ? currentStep : sIdx
                return (
                    <div key={realIdx}>
                        <div style={{ marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-h)', margin: 0 }}>{section.title}</h3>
                            {section.description && <p style={{ fontSize: '13px', color: 'var(--text)', opacity: 0.6, margin: '4px 0 0' }}>{section.description}</p>}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {section.rows.map((row, rIdx) => (
                                <div key={rIdx} className={styles.responsiveGrid} style={{ gridTemplateColumns: `repeat(${row.columns}, 1fr)` }}>
                                    {row.fields.map((field) => renderField(field))}
                                </div>
                            ))}
                        </div>
                    </div>
                )
            })}

            {/* Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                {config.isMultiStep && currentStep > 0 && (
                    <button type="button" onClick={() => setCurrentStep((s) => s - 1)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--sans)' }}>
                        Anterior
                    </button>
                )}
                <div style={{ flex: 1 }} />
                {config.isMultiStep && currentStep < config.sections.length - 1 ? (
                    <button type="button" onClick={handleNext} style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: 'var(--accent)', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--sans)' }}>
                        Siguiente
                    </button>
                ) : (
                    <button type="submit" style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: 'var(--accent)', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--sans)' }}>
                        Enviar
                    </button>
                )}
            </div>
        </form>
    )
}

// ─── Configurator ────────────────────────────────────────
function ConfiguratorPanel({
    config,
    onChange,
    onReset,
}: {
    config: FormConfig
    onChange: (patch: Partial<FormConfig>) => void
    onReset: () => void
}) {
    const [tab, setTab] = useState<ConfigTab>('fields')
    const [editingField, setEditingField] = useState<EditingField | null>(null)
    const [activeDrag, setActiveDrag] = useState<DragData | null>(null)
    const [collapsed, setCollapsed] = useState(false)
    const allFields = config.sections.flatMap((s) => s.rows.flatMap((r) => r.fields))

    const updateSection = (sIdx: number, patch: Partial<SectionConfig>) => {
        const next = [...config.sections]
        next[sIdx] = { ...next[sIdx], ...patch }
        onChange({ sections: next })
    }

    const addSection = () => {
        onChange({ sections: [...config.sections, { title: `Sección ${config.sections.length + 1}`, description: '', rows: [{ columns: 2, fields: [] }] }] })
    }

    const removeSection = (sIdx: number) => {
        onChange({ sections: config.sections.filter((_, i) => i !== sIdx) })
    }

    const addRowToSection = (sIdx: number, columns: 1 | 2 | 3) => {
        const next = [...config.sections]
        next[sIdx] = { ...next[sIdx], rows: [...next[sIdx].rows, { columns, fields: [] }] }
        onChange({ sections: next })
    }

    const addFieldToRow = (sIdx: number, rIdx: number) => {
        const next = [...config.sections]
        const row = next[sIdx].rows[rIdx]
        if (row.fields.length >= row.columns) return
        next[sIdx] = {
            ...next[sIdx],
            rows: next[sIdx].rows.map((r, i) => i === rIdx ? { ...r, fields: [...r.fields, { type: 'text', label: `Campo ${r.fields.length + 1}`, placeholder: '', required: false }] } : r),
        }
        onChange({ sections: next })
    }

    const removeField = (sIdx: number, rIdx: number, fIdx: number) => {
        const next = [...config.sections]
        next[sIdx] = {
            ...next[sIdx],
            rows: next[sIdx].rows.map((r, i) => i === rIdx ? { ...r, fields: r.fields.filter((_, j) => j !== fIdx) } : r),
        }
        onChange({ sections: next })
    }

    const removeRow = (sIdx: number, rIdx: number) => {
        const next = [...config.sections]
        next[sIdx] = { ...next[sIdx], rows: next[sIdx].rows.filter((_, i) => i !== rIdx) }
        onChange({ sections: next })
    }

    const tabs: { key: ConfigTab; label: string }[] = [
        { key: 'variants', label: 'Variantes' },
        { key: 'fields', label: 'Campos' },
        { key: 'validation', label: 'Validación' },
        { key: 'sections', label: 'Secciones' },
    ]

    const handleFieldDrop = (source: DragData, target: DragData) => {
        // Same position — no-op
        if (source.sectionIndex === target.sectionIndex && source.rowIndex === target.rowIndex && source.fieldIndex === target.fieldIndex) return

        const next = [...config.sections]

        // Remove from source
        const srcRow = next[source.sectionIndex].rows[source.rowIndex]
        const srcField = srcRow.fields[source.fieldIndex]
        if (!srcField) return

        const newSrcFields = srcRow.fields.filter((_, i) => i !== source.fieldIndex)
        next[source.sectionIndex] = {
            ...next[source.sectionIndex],
            rows: next[source.sectionIndex].rows.map((r, i) =>
                i === source.rowIndex ? { ...r, fields: newSrcFields } : r
            ),
        }

        // Insert at target
        const tgtRow = next[target.sectionIndex].rows[target.rowIndex]
        if (!tgtRow) return

        const tgtIdx = Math.min(target.fieldIndex, tgtRow.fields.length)
        const newTgtFields = [...tgtRow.fields]
        newTgtFields.splice(tgtIdx, 0, srcField)

        // Trim to column limit
        const trimmedFields = newTgtFields.slice(0, tgtRow.columns)

        next[target.sectionIndex] = {
            ...next[target.sectionIndex],
            rows: next[target.sectionIndex].rows.map((r, i) =>
                i === target.rowIndex ? { ...r, fields: trimmedFields } : r
            ),
        }

        onChange({ sections: next })
    }

    return (
        <div className={styles.configurator}>
            <div className={styles.configHeader}>
                <span className={styles.configIcon}><LuSettings2 size={18} /></span>
                <span className={styles.configTitle}>Configurador</span>
                <button className={`${styles.collapseBtn} ${collapsed ? styles.collapseBtnCollapsed : ''}`} onClick={() => setCollapsed(!collapsed)} title={collapsed ? 'Expandir' : 'Colapsar'}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </button>
                <button className={styles.resetBtn} onClick={onReset} title="Restaurar"><LuRotateCcw size={14} /></button>
            </div>

            {!collapsed && (
            <>
            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
                {tabs.map((t) => (
                    <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        style={{
                            flex: 1, padding: '10px 0', border: 'none', background: 'transparent',
                            fontSize: '12px', fontWeight: tab === t.key ? 700 : 500,
                            color: tab === t.key ? 'var(--accent)' : 'var(--text)',
                            borderBottom: `2px solid ${tab === t.key ? 'var(--accent)' : 'transparent'}`,
                            cursor: 'pointer', fontFamily: 'var(--sans)', transition: 'color 0.15s, border-color 0.15s, font-weight 0.15s',
                        }}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* ─── Tab: Fields ─── */}
            {/* ─── Tab: Variants ─── */}
            {tab === 'variants' && (
                <>
                    {/* Variant selector */}
                    <div className={styles.configGroup}>
                        <label className={styles.configLabel}>Estilo visual de inputs</label>
                        <div className={styles.radioGroup}>
                            {([
                                { value: 'default' as InputVariant, label: 'macOS', desc: 'Bordes sutiles, esquinas redondeadas, estilo limpio y minimalista', icon: <LuApple size={16} /> },
                                { value: 'filled' as InputVariant, label: 'Material', desc: 'Fondo relleno, borde inferior, inspirado en Material Design', icon: <LuPaintbrush size={16} /> },
                                { value: 'outlined' as InputVariant, label: 'Outlined', desc: 'Bordes prominentes, sin relleno, estilo estructurado y moderno', icon: <LuSquarePen size={16} /> },
                            ]).map((opt) => (
                                <button key={opt.value} className={`${styles.radioCard} ${config.inputVariant === opt.value ? styles.radioCardActive : ''}`} onClick={() => onChange({ inputVariant: opt.value })}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ color: config.inputVariant === opt.value ? 'var(--accent)' : 'var(--text)' }}>{opt.icon}</span>
                                        <span className={styles.radioLabel}>{opt.label}</span>
                                    </div>
                                    <span className={styles.radioDesc}>{opt.desc}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Preview of current variant */}
                    <div className={styles.configGroup}>
                        <label className={styles.configLabel}>Preview rápido</label>
                        <div style={{ padding: '16px', border: '1px solid var(--border)', borderRadius: '10px', background: 'var(--code-bg)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <Input value="" onChange={() => {}} placeholder="Input example" variant={config.inputVariant} />
                            <Select value="" onChange={() => {}} options={[{ value: 'a', label: 'Option A' }, { value: 'b', label: 'Option B' }]} placeholder="Select example" variant={config.inputVariant} />
                            <Textarea value="" onChange={() => {}} placeholder="Textarea example" variant={config.inputVariant} rows={2} />
                            <div style={{ display: 'flex', gap: '16px' }}>
                                <Checkbox checked={false} onChange={() => {}} label="Checkbox" variant={config.inputVariant} />
                                <RadioGroup value="" onChange={() => {}} options={[{ value: 'a', label: 'Radio A' }]} variant={config.inputVariant} />
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* ─── Tab: Fields ─── */}
            {tab === 'fields' && (
                <>
                    {/* Label mode */}
                    <div className={styles.configGroup}>
                        <label className={styles.configLabel}>Etiquetas</label>
                        <div className={styles.radioGroup}>
                            {([
                                { value: 'above' as LabelMode, label: 'Arriba del input' },
                                { value: 'placeholder' as LabelMode, label: 'Solo placeholder' },
                                { value: 'none' as LabelMode, label: 'Sin etiquetas' },
                            ]).map((opt) => (
                                <button key={opt.value} className={`${styles.radioCard} ${config.labelMode === opt.value ? styles.radioCardActive : ''}`} onClick={() => onChange({ labelMode: opt.value })}>
                                    <span className={styles.radioLabel}>{opt.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Sections */}
                    {config.sections.map((section, sIdx) => (
                        <div key={sIdx} className={styles.configGroup}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                                <span className={styles.configLabel} style={{ flex: 1, margin: 0 }}>Sección {sIdx + 1}</span>
                                <button onClick={() => removeSection(sIdx)} style={{ padding: '2px', border: 'none', background: 'transparent', color: '#dc2626', cursor: 'pointer', display: 'flex' }} title="Eliminar sección"><LuTrash2 size={14} /></button>
                            </div>

                            <input
                                type="text"
                                value={section.title}
                                onChange={(e) => updateSection(sIdx, { title: e.target.value })}
                                placeholder="Título de la sección"
                                style={{ width: '100%', padding: '6px 10px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '13px', fontWeight: 600, background: 'var(--bg)', color: 'var(--text-h)', fontFamily: 'var(--sans)', marginBottom: '6px', boxSizing: 'border-box' }}
                            />
                            <input
                                type="text"
                                value={section.description}
                                onChange={(e) => updateSection(sIdx, { description: e.target.value })}
                                placeholder="Descripción (opcional)"
                                style={{ width: '100%', padding: '6px 10px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '12px', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--sans)', marginBottom: '10px', boxSizing: 'border-box' }}
                            />

                            {/* Rows in section */}
                            {section.rows.map((row, rIdx) => (
                                <RowBlock
                                    key={rIdx}
                                    sectionIndex={sIdx}
                                    rowIndex={rIdx}
                                    columns={row.columns}
                                    fields={row.fields}
                                    activeDrag={activeDrag}
                                    onColumnsChange={(cols) => {
                                        const next = [...config.sections]
                                        next[sIdx] = { ...next[sIdx], rows: next[sIdx].rows.map((r, i) => i === rIdx ? { columns: cols, fields: r.fields.slice(0, cols) } : r) }
                                        onChange({ sections: next })
                                    }}
                                    onRemoveRow={() => removeRow(sIdx, rIdx)}
                                    onAddField={() => addFieldToRow(sIdx, rIdx)}
                                    onEditField={(fIdx) => setEditingField({ sectionIndex: sIdx, rowIndex: rIdx, fieldIndex: fIdx })}
                                    onRemoveField={(fIdx) => removeField(sIdx, rIdx, fIdx)}
                                    onFieldDragStart={setActiveDrag}
                                    onFieldDragEnd={() => setActiveDrag(null)}
                                    onFieldDrop={handleFieldDrop}
                                />
                            ))}

                            {/* Add row to section */}
                            <div style={{ display: 'flex', gap: '4px' }}>
                                {([1, 2, 3] as const).map((n) => (
                                    <button key={n} onClick={() => addRowToSection(sIdx, n)} style={{ flex: 1, padding: '5px', border: '1px dashed var(--border)', borderRadius: '5px', background: 'transparent', color: 'var(--accent)', fontSize: '10px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--sans)' }}>+{n}col</button>
                                ))}
                            </div>
                        </div>
                    ))}

                    <div className={styles.configGroup}>
                        <button onClick={addSection} style={{ width: '100%', padding: '8px', border: '1.5px dashed var(--border)', borderRadius: '8px', background: 'transparent', color: 'var(--accent)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--sans)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                            <LuPlus size={14} /> Agregar sección
                        </button>
                    </div>
                </>
            )}

            {/* ─── Tab: Validation ─── */}
            {tab === 'validation' && (
                <div className={styles.configGroup}>
                    <label className={styles.configLabel}>Validación por campo ({allFields.length} campos)</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {allFields.map((field) => {
                            const key = fieldToKey(field.label)
                            return (
                                <div key={key} style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '10px', background: 'var(--bg)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                                        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--accent)', background: 'var(--accent-bg)', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>{field.type}</span>
                                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-h)' }}>{field.label}</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <span style={{ fontSize: '11px', color: field.required ? '#dc2626' : 'var(--text)', opacity: field.required ? 1 : 0.5 }}>
                                            {field.required ? '★ Requerido (configurar en Campos)' : 'Opcional'}
                                        </span>
                                        {['text', 'email', 'password', 'number', 'tel', 'textarea'].includes(field.type) && (
                                            <>
                                                <div style={{ display: 'flex', gap: '6px' }}>
                                                    <div style={{ flex: 1 }}>
                                                        <label style={{ fontSize: '10px', color: 'var(--text)', opacity: 0.6, display: 'block', marginBottom: '2px' }}>Min length</label>
                                                        <input type="number" value={field.minLength ?? ''} onChange={(e) => {
                                                            const next = [...config.sections]
                                                            for (const sec of next) for (const row of sec.rows) { const f = row.fields.find((f) => fieldToKey(f.label) === key); if (f) { f.minLength = e.target.value ? Number(e.target.value) : undefined } }
                                                            onChange({ sections: next })
                                                        }} placeholder="—" style={{ width: '100%', padding: '4px 6px', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '11px', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--sans)', boxSizing: 'border-box' }} />
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <label style={{ fontSize: '10px', color: 'var(--text)', opacity: 0.6, display: 'block', marginBottom: '2px' }}>Max length</label>
                                                        <input type="number" value={field.maxLength ?? ''} onChange={(e) => {
                                                            const next = [...config.sections]
                                                            for (const sec of next) for (const row of sec.rows) { const f = row.fields.find((f) => fieldToKey(f.label) === key); if (f) { f.maxLength = e.target.value ? Number(e.target.value) : undefined } }
                                                            onChange({ sections: next })
                                                        }} placeholder="—" style={{ width: '100%', padding: '4px 6px', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '11px', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--sans)', boxSizing: 'border-box' }} />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '10px', color: 'var(--text)', opacity: 0.6, display: 'block', marginBottom: '2px' }}>Pattern (regex)</label>
                                                    <input type="text" value={field.pattern ?? ''} onChange={(e) => {
                                                        const next = [...config.sections]
                                                        for (const sec of next) for (const row of sec.rows) { const f = row.fields.find((f) => fieldToKey(f.label) === key); if (f) { f.pattern = e.target.value || undefined } }
                                                        onChange({ sections: next })
                                                    }} placeholder="^[A-Za-z]+$" style={{ width: '100%', padding: '4px 6px', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '11px', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--mono)', boxSizing: 'border-box' }} />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* ─── Tab: Sections ─── */}
            {tab === 'sections' && (
                <>
                    <div className={styles.configGroup}>
                        <label className={styles.configLabel}>Modo de presentación</label>
                        <div className={styles.radioGroup}>
                            <button className={`${styles.radioCard} ${!config.isMultiStep ? styles.radioCardActive : ''}`} onClick={() => onChange({ isMultiStep: false })}>
                                <span className={styles.radioLabel}>Página única</span>
                                <span className={styles.radioDesc}>Todas las secciones visibles a la vez</span>
                            </button>
                            <button className={`${styles.radioCard} ${config.isMultiStep ? styles.radioCardActive : ''}`} onClick={() => onChange({ isMultiStep: true })}>
                                <span className={styles.radioLabel}>Multi-paso</span>
                                <span className={styles.radioDesc}>Una sección por paso con navegación</span>
                            </button>
                        </div>
                    </div>

                    {config.isMultiStep && (
                        <div className={styles.configGroup}>
                            <label className={styles.configLabel}>Pasos ({config.sections.length})</label>
                            {config.sections.map((section, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', border: '1px solid var(--border)', borderRadius: '6px', marginBottom: '6px', background: 'var(--bg)' }}>
                                    <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-h)' }}>{section.title || `Paso ${i + 1}`}</div>
                                        <div style={{ fontSize: '11px', color: 'var(--text)', opacity: 0.5 }}>{section.rows.flatMap((r) => r.fields).length} campos</div>
                                    </div>
                                    {config.sections.length > 1 && (
                                        <button onClick={() => removeSection(i)} style={{ padding: '4px', border: 'none', background: 'transparent', color: '#dc2626', cursor: 'pointer' }}><LuTrash2 size={14} /></button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    <div className={styles.configGroup}>
                        <button onClick={addSection} style={{ width: '100%', padding: '8px', border: '1.5px dashed var(--border)', borderRadius: '8px', background: 'transparent', color: 'var(--accent)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--sans)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                            <LuPlus size={14} /> Agregar paso
                        </button>
                    </div>
                </>
            )}

            {/* Summary */}
            <div className={styles.configSummary}>
                <span className={styles.summaryLabel}>Configuración:</span>
                <div className={styles.summaryFlags}>
                    <span className={styles.flagBadge}>{config.sections.length} secciones</span>
                    <span className={styles.flagBadge}>{allFields.length} campos</span>
                    <span className={styles.flagBadge}>{config.isMultiStep ? 'multi-paso' : 'página única'}</span>
                    <span className={styles.flagBadge}>{config.labelMode}</span>
                </div>
            </div>
            </>
            )}

            {/* Field Config Modal */}
            <FieldConfigModal
                isOpen={editingField !== null}
                field={editingField ? config.sections[editingField.sectionIndex]?.rows[editingField.rowIndex]?.fields[editingField.fieldIndex] ?? null : null}
                onClose={() => setEditingField(null)}
                onSave={(updated) => {
                    if (!editingField) return
                    const { sectionIndex, rowIndex, fieldIndex } = editingField
                    const next = [...config.sections]
                    next[sectionIndex] = {
                        ...next[sectionIndex],
                        rows: next[sectionIndex].rows.map((r, i) =>
                            i === rowIndex ? { ...r, fields: r.fields.map((f, j) => j === fieldIndex ? updated : f) } : r
                        ),
                    }
                    onChange({ sections: next })
                }}
                onRemove={() => {
                    if (!editingField) return
                    removeField(editingField.sectionIndex, editingField.rowIndex, editingField.fieldIndex)
                }}
            />
        </div>
    )
}

// ─── Generated Code ──────────────────────────────────────
function GeneratedCode({ config }: { config: FormConfig }) {
    const allFields = config.sections.flatMap((s) => s.rows.flatMap((r) => r.fields))

    // Types
    const typesCode = allFields.map((f) => {
        const key = fieldToKey(f.label)
        const tsType = f.type === 'checkbox' ? 'boolean' : 'string'
        return `    ${key}: ${tsType}`
    }).join('\n')

    // Zod
    const zodLines = allFields.map((f) => {
        const key = fieldToKey(f.label)
        let chain = 'z.string()'
        if (f.type === 'email') chain += '.email("Correo inválido")'
        if (f.type === 'checkbox') chain = 'z.boolean()'
        if (f.required) chain += '.min(1, "Campo requerido")'
        if (f.minLength) chain += `.min(${f.minLength}, "Mínimo ${f.minLength} caracteres")`
        if (f.maxLength) chain += `.max(${f.maxLength}, "Máximo ${f.maxLength} caracteres")`
        if (f.pattern) chain += `.regex(/${f.pattern}/, "Formato inválido")`
        if (!f.required) chain += '.optional()'
        return `    ${key}: ${chain}`
    }).join(',\n')

    const zodCode = `import { z } from 'zod'\n\nexport const formSchema = z.object({\n${zodLines}\n})\n\nexport type FormData = z.infer<typeof formSchema>`

    // Component
    const imports = new Set<string>()
    imports.add("import { useState } from 'react'")
    imports.add("import FormLayout from '../components/ui/Form/FormLayout'")
    imports.add("import FormField from '../components/ui/Form/FormField'")
    const usedInputs = new Set<string>()
    allFields.forEach((f) => {
        if (['text', 'email', 'password', 'number', 'tel'].includes(f.type)) usedInputs.add('Input')
        if (f.type === 'textarea') usedInputs.add('Textarea')
        if (f.type === 'select') usedInputs.add('Select')
        if (f.type === 'checkbox') usedInputs.add('Checkbox')
        if (f.type === 'radio') usedInputs.add('RadioGroup')
    })
    usedInputs.forEach((c) => imports.add(`import ${c === 'RadioGroup' ? '{ RadioGroup }' : c} from '../components/ui/Form/${c === 'RadioGroup' ? 'Radio' : c}'`))

    if (config.isMultiStep) imports.add("import { LuChevronLeft, LuChevronRight } from 'react-icons/lu'")

    const initialState = allFields.map((f) => `        ${fieldToKey(f.label)}: ${f.type === 'checkbox' ? 'false' : "''"}`).join(',\n')

    const validationRules = allFields.filter((f) => f.required || f.minLength || f.maxLength || f.pattern).map((f) => {
        const key = fieldToKey(f.label)
        const lines: string[] = []
        if (f.required) {
            if (f.type === 'email') lines.push(`        if (!data.${key}.includes('@')) errs.${key} = 'Email inválido'`)
            else lines.push(`        if (!data.${key}) errs.${key} = '${f.label} es requerido'`)
        }
        if (f.minLength) lines.push(`        if (data.${key} && data.${key}.length < ${f.minLength}) errs.${key} = 'Mínimo ${f.minLength} caracteres'`)
        if (f.maxLength) lines.push(`        if (data.${key} && data.${key}.length > ${f.maxLength}) errs.${key} = 'Máximo ${f.maxLength} caracteres'`)
        if (f.pattern) lines.push(`        if (data.${key} && !/${f.pattern}/.test(data.${key})) errs.${key} = 'Formato inválido'`)
        return lines.join('\n')
    }).filter(Boolean).join('\n')

    const renderSection = (section: SectionConfig) => {
        return section.rows.map((row) => {
            const fieldsJSX = row.fields.map((f) => {
                const key = fieldToKey(f.label)
                const showLabel = config.labelMode === 'above'
                const ph = config.labelMode === 'placeholder' ? f.label : f.placeholder
                const hasErr = f.required || f.minLength || f.maxLength || f.pattern
                const errProp = hasErr ? ` error={errors.${key}}` : ''
                const reqProp = f.required ? ' required' : ''
                const minProp = f.minLength ? ` /* minLength: ${f.minLength} */` : ''

                if (f.type === 'checkbox') return `        <FormField${errProp}>\n            <Checkbox checked={data.${key}} onChange={(v) => setField('${key}', v)} label="${f.label}" />\n        </FormField>`
                if (f.type === 'radio') return `        <FormField${showLabel ? ` label="${f.label}"` : ''}${errProp}>\n            <RadioGroup value={data.${key}} onChange={(v) => setField('${key}', v)} options={[${(f.options ?? []).map((o) => `{ value: '${o}', label: '${o}' }`).join(', ')}]} />\n        </FormField>`
                if (f.type === 'select') return `        <FormField${showLabel ? ` label="${f.label}"` : ''}${errProp}${reqProp}>\n            <Select value={data.${key}} onChange={(v) => setField('${key}', v)} options={[${(f.options ?? []).map((o) => `{ value: '${o}', label: '${o}' }`).join(', ')}]} placeholder="${ph}" />\n        </FormField>`
                if (f.type === 'textarea') return `        <FormField${showLabel ? ` label="${f.label}"` : ''}${errProp}${reqProp}>\n            <Textarea value={data.${key}} onChange={(v) => setField('${key}', v)} placeholder="${ph}" />\n        </FormField>`
                return `        <FormField${showLabel ? ` label="${f.label}"` : ''}${errProp}${reqProp}>\n            <Input type="${f.type}" value={data.${key}} onChange={(v) => setField('${key}', v)} placeholder="${ph}"${minProp} />\n        </FormField>`
            }).join('\n')

            if (row.columns > 1) {
                return `    <FormLayout columns={${row.columns}}>\n${fieldsJSX}\n    </FormLayout>`
            }
            return fieldsJSX
        }).join('\n\n')
    }

    let componentCode: string

    if (config.isMultiStep) {
        const sectionsCode = config.sections.map((section, i) => {
            return `    // ─── Paso ${i + 1}: ${section.title} ───\n    ${i === 0 ? 'if' : 'else if'} (step === ${i}) {\n        return (\n            <div>\n                <h3>${section.title}</h3>\n${renderSection(section)}\n            </div>\n        )\n    }`
        }).join('\n')

        // Generate section validation for multi-step
        const sectionValidationRules = config.sections.map((section, sIdx) => {
            const sectionFields = section.rows.flatMap((r) => r.fields)
            const rules = sectionFields.filter((f) => f.required || f.minLength || f.maxLength || f.pattern).map((f) => {
                const key = fieldToKey(f.label)
                const lines: string[] = []
                if (f.required) {
                    if (f.type === 'email') lines.push(`            if (!data.${key}.includes('@')) errs.${key} = 'Email inválido'`)
                    else lines.push(`            if (!data.${key}) errs.${key} = '${f.label} es requerido'`)
                }
                if (f.minLength) lines.push(`            if (data.${key} && data.${key}.length < ${f.minLength}) errs.${key} = 'Mínimo ${f.minLength} caracteres'`)
                if (f.maxLength) lines.push(`            if (data.${key} && data.${key}.length > ${f.maxLength}) errs.${key} = 'Máximo ${f.maxLength} caracteres'`)
                if (f.pattern) lines.push(`            if (data.${key} && !/${f.pattern}/.test(data.${key})) errs.${key} = 'Formato inválido'`)
                return lines.join('\n')
            }).filter(Boolean).join('\n')
            return `    const validateStep${sIdx} = () => {\n        const errs: typeof errors = {}\n${rules}\n        setErrors(errs)\n        return Object.keys(errs).length === 0\n    }`
        }).join('\n\n')

        componentCode = `${Array.from(imports).join('\n')}\n\ninterface ContactFormData {\n${typesCode}\n}\n\nexport default function ContactForm() {\n    const [step, setStep] = useState(0)\n    const [data, setData] = useState<ContactFormData>({\n${initialState}\n    })\n    const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({})\n\n    const setField = (key: string, value: unknown) => {\n        setData((prev) => ({ ...prev, [key]: value }))\n        if (errors[key as keyof ContactFormData]) {\n            setErrors((prev) => { const n = { ...prev }; delete n[key as keyof ContactFormData]; return n })\n        }\n    }\n\n${sectionValidationRules}\n\n    const handleSubmit = (e: React.FormEvent) => {\n        e.preventDefault()\n        const isValid = [${config.sections.map((_, i) => `validateStep${i}()`).join(', ')}]\n        if (isValid.every(Boolean)) console.log('Submit:', data)\n    }\n\n    const handleNext = () => {\n        if (validateStep[step]()) setStep((s) => s + 1)\n    }\n\n    return (\n        <form onSubmit={handleSubmit}>\n            <div style={{ display: 'flex', gap: '8px', marginBottom: 24 }}>\n                {[${config.sections.map((s) => `'${s.title}'`).join(', ')}].map((label, i) => (\n                    <button key={i} type="button" onClick={() => setStep(i)} style={{ padding: '6px 12px', borderRadius: 8, border: \`1px solid \${i === step ? 'var(--accent)' : 'var(--border)'}\`, background: i === step ? 'var(--accent-bg)' : 'var(--bg)', color: i === step ? 'var(--accent)' : 'var(--text)', fontWeight: 600, cursor: 'pointer', fontSize: 12 }}>\n                        {i + 1}. {label}\n                    </button>\n                ))}\n            </div>\n\n${sectionsCode}\n\n            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>\n                {step > 0 && <button type="button" onClick={() => setStep((s) => s - 1)} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', cursor: 'pointer' }}>← Anterior</button>}\n                <div style={{ flex: 1 }} />\n                {step < ${config.sections.length - 1} ? (\n                    <button type="button" onClick={handleNext} style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: 'var(--accent)', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Siguiente →</button>\n                ) : (\n                    <button type="submit" style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: 'var(--accent)', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Enviar</button>\n                )}\n            </div>\n        </form>\n    )\n}`
    } else {
        const sectionsJSX = config.sections.map((section) => {
            return `        {/* ${section.title} */}\n        <div>\n            <h3>${section.title}</h3>\n${section.description ? `            <p>${section.description}</p>\n` : ''}${renderSection(section)}\n        </div>`
        }).join('\n\n')

        componentCode = `${Array.from(imports).join('\\n')}\n\ninterface ContactFormData {\n${typesCode}\n}\n\nexport default function ContactForm() {\n    const [data, setData] = useState<ContactFormData>({\n${initialState}\n    })\n    const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({})\n\n    const setField = (key: string, value: unknown) => {\n        setData((prev) => ({ ...prev, [key]: value }))\n        if (errors[key as keyof ContactFormData]) {\n            setErrors((prev) => { const n = { ...prev }; delete n[key as keyof ContactFormData]; return n })\n        }\n    }${validationRules ? `\n\n    const validate = () => {\n        const errs: typeof errors = {}\n${validationRules}\n        setErrors(errs)\n        return Object.keys(errs).length === 0\n    }` : ''}\n\n    const handleSubmit = (e: React.FormEvent) => {\n        e.preventDefault()${validationRules ? '\n        if (!validate()) return' : ''}\n        console.log('Submit:', data)\n    }\n\n    return (\n        <form onSubmit={handleSubmit}>\n${sectionsJSX}\n\n            <button type="submit" style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: 'var(--accent)', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>\n                Enviar\n            </button>\n        </form>\n    )\n}`
    }

    return (
        <div className={styles.codeStack}>
            <CodeBlock filename="types/form.ts" code={`export interface ContactFormData {\n${typesCode}\n}`} />
            <CodeBlock filename="schema/form.ts" code={zodCode} />
            <CodeBlock filename="ContactForm.tsx" code={componentCode} />
        </div>
    )
}

// ─── Main Component ──────────────────────────────────────
export default function FormShowcase() {
    const [view, setView] = useState<ViewMode>('preview')
    const [config, setConfig] = useState<FormConfig>({
        sections: DEFAULT_SECTIONS,
        labelMode: 'above',
        inputVariant: 'default',
        isMultiStep: false,
    })

    const handleChange = useCallback((patch: Partial<FormConfig>) => {
        setConfig((prev) => ({ ...prev, ...patch }))
    }, [])

    const handleReset = useCallback(() => {
        setConfig({ sections: DEFAULT_SECTIONS, labelMode: 'above', inputVariant: 'default', isMultiStep: false })
    }, [])

    const totalFields = config.sections.reduce((s, sec) => s + sec.rows.reduce((s2, r) => s2 + r.fields.length, 0), 0)

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div className={styles.toggleBar}>
                    <button className={`${styles.toggleBtn} ${view === 'preview' ? styles.toggleActive : ''}`} onClick={() => setView('preview')}>
                        <span className={styles.toggleIcon}><LuEye size={16} /></span>
                        Configurador
                    </button>
                    <button className={`${styles.toggleBtn} ${view === 'code' ? styles.toggleActive : ''}`} onClick={() => setView('code')}>
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
                            {config.sections.length} secciones · {totalFields} campos · {config.inputVariant} · {config.isMultiStep ? 'multi-paso' : 'página única'}
                        </span>
                    </div>
                    <div className={styles.tableWrapper} style={{ padding: '28px' }}>
                        {view === 'preview' ? <LivePreview config={config} /> : <GeneratedCode config={config} />}
                    </div>
                </div>
            </div>
        </div>
    )
}
