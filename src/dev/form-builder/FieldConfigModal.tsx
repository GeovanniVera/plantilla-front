import { useState, useCallback } from 'react'
import { LuTag, LuTrash2 } from 'react-icons/lu'
import { Drawer, ConfirmDialog } from '@components/overlays'
import styles from './FieldConfigModal.module.css'
import type { FieldConfig, FieldType } from '@components/forms/types'

// ─── Field Types for select ───────────────────────────────
const FIELD_TYPES: { value: FieldType; label: string }[] = [
    { value: 'text', label: 'Texto' },
    { value: 'email', label: 'Email' },
    { value: 'password', label: 'Password' },
    { value: 'number', label: 'Number' },
    { value: 'tel', label: 'Teléfono' },
    { value: 'textarea', label: 'Textarea' },
    { value: 'select', label: 'Select' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'radio', label: 'Radio' },
]

// ─── Props ────────────────────────────────────────────────
interface FieldConfigModalProps {
    isOpen: boolean
    field: FieldConfig | null
    onClose: () => void
    onSave: (updated: FieldConfig) => void
    onRemove?: () => void
}

// ─── Component ────────────────────────────────────────────
export function FieldConfigModal({ isOpen, field, onClose, onSave, onRemove }: FieldConfigModalProps) {
    const [confirmOpen, setConfirmOpen] = useState(false)
    // Reset draft whenever the modal opens with a new field
    const draft: FieldConfig = field ? { ...field } : {} as FieldConfig
    const [localDraft, setLocalDraft] = useState<FieldConfig>(draft)

    // Track the field identity to reset localDraft on change
    const fieldKey = field ? `${field.label}-${field.type}` : ''
    const [prevKey, setPrevKey] = useState(fieldKey)
    if (fieldKey !== prevKey) {
        setPrevKey(fieldKey)
        setLocalDraft(draft)
    }

    const update = useCallback((patch: Partial<FieldConfig>) => {
        setLocalDraft((prev) => ({ ...prev, ...patch }))
    }, [])

    const handleSave = () => {
        onSave(localDraft)
        onClose()
    }

    if (!isOpen || !field) return null

    return (
        <>
        <Drawer isOpen={isOpen} onClose={onClose}>
            <Drawer.Header title={`Configurar: ${localDraft.label}`} />
            <Drawer.Body>
                {/* ── General Section ── */}
                <div className={styles.section}>
                    <div className={styles.sectionTitle}>
                        <span className={styles.sectionIcon}><LuTag size={12} /></span>
                        General
                    </div>

                    <div className={styles.field}>
                        <label className={styles.fieldLabel}>Tipo de campo</label>
                        <select
                            className={styles.fieldSelect}
                            value={localDraft.type}
                            onChange={(e) => update({ type: e.target.value as FieldType })}
                        >
                            {FIELD_TYPES.map((ft) => (
                                <option key={ft.value} value={ft.value}>{ft.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.fieldRow}>
                        <div className={styles.field}>
                            <label className={styles.fieldLabel}>Etiqueta (Label)</label>
                            <input
                                className={styles.fieldInput}
                                type="text"
                                value={localDraft.label}
                                onChange={(e) => update({ label: e.target.value })}
                                placeholder="Nombre del campo"
                            />
                        </div>
                        <div className={styles.field}>
                            <label className={styles.fieldLabel}>Placeholder</label>
                            <input
                                className={styles.fieldInput}
                                type="text"
                                value={localDraft.placeholder}
                                onChange={(e) => update({ placeholder: e.target.value })}
                                placeholder="Texto de ayuda"
                            />
                        </div>
                    </div>

                    <div className={styles.field}>
                        <label className={styles.fieldLabel}>Helper text / Tooltip</label>
                        <input
                            className={styles.fieldInput}
                            type="text"
                            value={localDraft.helperText ?? ''}
                            onChange={(e) => update({ helperText: e.target.value || undefined })}
                            placeholder="Instrucción adicional para el usuario"
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.fieldLabel}>Valor por defecto</label>
                        <input
                            className={styles.fieldInput}
                            type="text"
                            value={localDraft.defaultValue ?? ''}
                            onChange={(e) => update({ defaultValue: e.target.value || undefined })}
                            placeholder="Sin valor por defecto"
                        />
                    </div>

                    {/* Options for select / radio */}
                    {(localDraft.type === 'select' || localDraft.type === 'radio') && (
                        <div className={styles.field}>
                            <label className={styles.fieldLabel}>Opciones (una por línea)</label>
                            <textarea
                                className={styles.fieldTextarea}
                                value={(localDraft.options ?? []).join('\n')}
                                onChange={(e) => update({ options: e.target.value.split('\n').filter(Boolean) })}
                                placeholder={"Opción 1\nOpción 2\nOpción 3"}
                                rows={4}
                            />
                        </div>
                    )}
                </div>

                <div className={styles.divider} />

                {/* ── Required toggle ── */}
                <div className={styles.section}>
                    <div className={styles.sectionTitle}>
                        <span className={styles.sectionIcon}><LuTag size={12} /></span>
                        Estado
                    </div>
                    <div className={styles.toggleRow}>
                        <div className={styles.toggleInfo}>
                            <span className={styles.toggleName}>Campo obligatorio</span>
                            <span className={styles.toggleDesc}>El usuario debe completar este campo</span>
                        </div>
                        <button
                            className={`${styles.toggle} ${localDraft.required ? styles.toggleOn : ''}`}
                            onClick={() => update({ required: !localDraft.required })}
                            type="button"
                        >
                            <span className={styles.knob} />
                        </button>
                    </div>
                </div>
            </Drawer.Body>

            <Drawer.Footer>
                {onRemove && (
                    <button
                        className={`${styles.btn} ${styles.btnDanger}`}
                        onClick={() => setConfirmOpen(true)}
                        style={{ marginRight: 'auto' }}
                    >
                        Eliminar
                    </button>
                )}
                <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={onClose}>
                    Cancelar
                </button>
                <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleSave}>
                    Guardar cambios
                </button>
            </Drawer.Footer>
        </Drawer>

            {/* Confirm delete dialog */}
            <ConfirmDialog
                isOpen={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={() => { onRemove?.(); onClose() }}
                title="Eliminar campo"
                message={`¿Eliminar el campo "${localDraft.label}"? Esta acción no se puede deshacer.`}
                confirmLabel="Eliminar"
                variant="destructive"
                icon={<LuTrash2 />}
            />
        </>
    )
}
