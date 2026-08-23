import { useState } from 'react'
import { LuUser, LuSettings } from 'react-icons/lu'
import { Modal, Drawer, DrawerStack } from '@components/overlays'
import { useToast } from '@components/feedback'
import Button from '@components/primitives/Button'
import { ExampleCard } from '@dev/showcase/Showcase'
import styles from './TablesShowcase.module.css'

// ─── Code Snippets ────────────────────────────────────────
const CODE = {
    modal: `import { useState } from 'react'
import { Modal } from '@components/overlays'

export default function MyComponent() {
    const [open, setOpen] = useState(false)

    return (
        <>
            <button onClick={() => setOpen(true)}>
                Abrir modal
            </button>

            <Modal isOpen={open} onClose={() => setOpen(false)} width={480}>
                <Modal.Header title="Título del modal" />
                <Modal.Body>
                    <p>Contenido del modal aquí.</p>
                </Modal.Body>
                <Modal.Footer>
                    <button onClick={() => setOpen(false)}>Cerrar</button>
                </Modal.Footer>
            </Modal>
        </>
    )
}`,

    modalForm: `import { useState } from 'react'
import { Modal } from '@components/overlays'
import { useToast } from '@components/feedback'

export default function EditUserModal({ user, onSave }) {
    const [open, setOpen] = useState(false)
    const [name, setName] = useState(user.name)
    const toast = useToast()

    const handleSave = async () => {
        try {
            await onSave({ ...user, name })
            toast.success('Usuario actualizado correctamente')
            setOpen(false)
        } catch {
            toast.error('Error al guardar los cambios')
        }
    }

    return (
        <>
            <button onClick={() => setOpen(true)}>Editar</button>

            <Modal isOpen={open} onClose={() => setOpen(false)} width={480}>
                <Modal.Header title="Editar usuario" />
                <Modal.Body>
                    <label>Nombre</label>
                    <input value={name} onChange={(e) => setName(e.target.value)} />
                </Modal.Body>
                <Modal.Footer>
                    <button onClick={() => setOpen(false)}>Cancelar</button>
                    <button onClick={handleSave}>Guardar</button>
                </Modal.Footer>
            </Modal>
        </>
    )
}`,

    drawer: `import { useState } from 'react'
import { Drawer } from '@components/overlays'

export default function MyComponent() {
    const [open, setOpen] = useState(false)

    return (
        <>
            <button onClick={() => setOpen(true)}>
                Abrir drawer
            </button>

            <Drawer isOpen={open} onClose={() => setOpen(false)} width={480}>
                <Drawer.Header title="Panel lateral" />
                <Drawer.Body>
                    <p>Contenido del drawer aquí.</p>
                </Drawer.Body>
                <Drawer.Footer>
                    <button onClick={() => setOpen(false)}>Cerrar</button>
                </Drawer.Footer>
            </Drawer>
        </>
    )
}`,

    drawerStack: `import { useState } from 'react'
import { DrawerStack } from '@components/overlays'

const USERS = [
    { id: 1, name: 'Ana García', email: 'ana@email.com' },
    { id: 2, name: 'Carlos López', email: 'carlos@email.com' },
]

export default function UserExplorer() {
    const [open, setOpen] = useState(false)
    const [level, setLevel] = useState(0)
    const [selected, setSelected] = useState(null)

    const handleClose = () => {
        setOpen(false)
        setLevel(0)
        setSelected(null)
    }

    return (
        <>
            <button onClick={() => setOpen(true)}>
                Explorar usuarios
            </button>

            <DrawerStack
                isOpen={open}
                onClose={handleClose}
                level={level}
                onBack={() => setLevel((l) => l - 1)}
                onNavigate={(lvl) => setLevel(lvl)}
                breadcrumbs={[
                    { label: 'Usuarios', level: 0 },
                    ...(level >= 1 ? [{ label: selected.name, level: 1 }] : []),
                    ...(level >= 2 ? [{ label: 'Configuración', level: 2 }] : []),
                ]}
                width={480}
            >
                {level === 0 && USERS.map((user) => (
                    <button key={user.id} onClick={() => { setSelected(user); setLevel(1) }}>
                        {user.name}
                    </button>
                ))}

                {level === 1 && (
                    <div>
                        <p>Email: {selected.email}</p>
                        <button onClick={() => setLevel(2)}>
                            Configuración →
                        </button>
                    </div>
                )}

                {level === 2 && (
                    <div>
                        <p>Preferencias de {selected.name}</p>
                    </div>
                )}
            </DrawerStack>
        </>
    )
}`,

    confirmDefault: `import { useState } from 'react'
import { ConfirmDialog } from '@components/overlays'
import { useToast } from '@components/feedback'

export default function ConfirmAction() {
    const [open, setOpen] = useState(false)
    const toast = useToast()

    const handleConfirm = () => {
        setOpen(false)
        toast.success('Acción completada correctamente')
    }

    return (
        <>
            <button onClick={() => setOpen(true)}>Confirmar</button>

            <ConfirmDialog
                isOpen={open}
                onClose={() => setOpen(false)}
                onConfirm={handleConfirm}
                title="Confirmar acción"
                message="¿Deseas proceder? Se aplicarán los cambios inmediatamente."
                confirmLabel="Confirmar"
                cancelLabel="Cancelar"
                variant="default"
            />
        </>
    )
}`,

    confirmDestructive: `import { useState } from 'react'
import { ConfirmDialog } from '@components/overlays'
import { useToast } from '@components/feedback'

export default function DeleteButton({ userId, onDeleted }) {
    const [open, setOpen] = useState(false)
    const toast = useToast()

    const handleConfirm = async () => {
        setOpen(false)
        try {
            await fetch(\`/api/users/\${userId}\`, { method: 'DELETE' })
            onDeleted(userId)
            toast.success('Usuario eliminado correctamente')
        } catch {
            toast.error('Error al eliminar', {
                action: { label: 'Reintentar', onClick: () => setOpen(true) }
            })
        }
    }

    return (
        <>
            <button onClick={() => setOpen(true)}>Eliminar usuario</button>

            <ConfirmDialog
                isOpen={open}
                onClose={() => setOpen(false)}
                onConfirm={handleConfirm}
                title="Eliminar usuario"
                message="¿Estás seguro? Esta acción no se puede deshacer."
                confirmLabel="Eliminar"
                cancelLabel="Cancelar"
                variant="destructive"
            />
        </>
    )
}`,

    confirmWarning: `import { useState } from 'react'
import { ConfirmDialog } from '@components/overlays'
import { useToast } from '@components/feedback'

export default function LogoutButton() {
    const [open, setOpen] = useState(false)
    const toast = useToast()

    const handleConfirm = () => {
        setOpen(false)
        toast.warning('La sesión se cerrará en 60 segundos')
        // Redirigir al login...
    }

    return (
        <>
            <button onClick={() => setOpen(true)}>Cerrar sesión</button>

            <ConfirmDialog
                isOpen={open}
                onClose={() => setOpen(false)}
                onConfirm={handleConfirm}
                title="Cerrar sesión"
                message="Tienes cambios sin guardar. Los perderás si cierras sesión."
                confirmLabel="Cerrar sesión"
                cancelLabel="Quedarme"
                variant="warning"
            />
        </>
    )
}`,

    confirmInfo: `import { useState } from 'react'
import { ConfirmDialog } from '@components/overlays'
import { useToast } from '@components/feedback'

export default function UpdatePermissions() {
    const [open, setOpen] = useState(false)
    const toast = useToast()

    const handleConfirm = () => {
        setOpen(false)
        toast.success('Permisos actualizados')
    }

    return (
        <>
            <button onClick={() => setOpen(true)}>Actualizar permisos</button>

            <ConfirmDialog
                isOpen={open}
                onClose={() => setOpen(false)}
                onConfirm={handleConfirm}
                title="Actualizar permisos"
                message="El usuario tendrá acceso de lectura y escritura a todos los archivos."
                confirmLabel="Actualizar"
                cancelLabel="Cancelar"
                variant="info"
            />
        </>
    )
}`,


}

// ─── Page ─────────────────────────────────────────────────
export default function ComponentesModales() {
    const toast = useToast()

    // Modal states
    const [modalOpen, setModalOpen] = useState(false)
    const [modalFormOpen, setModalFormOpen] = useState(false)
    const [modalFormName, setModalFormName] = useState('Ana García')
    // Drawer states
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [stackOpen, setStackOpen] = useState(false)
    const [stackLevel, setStackLevel] = useState(0)
    const [stackSelected, setStackSelected] = useState<{ name: string; email: string } | null>(null)


    const closeStack = () => { setStackOpen(false); setStackLevel(0); setStackSelected(null) }

    return (
        <div className={styles.page}>


            {/* ════════════════════════════════════════════
                MODALES
               ════════════════════════════════════════════ */}
            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Modales</h2>
                <p className={styles.sectionDesc}>
                    Diálogos centrados con backdrop blur. Se cierran con clic fuera del overlay o tecla Escape. Composición: Header, Body, Footer.
                </p>

                {/* Modal básico */}
                <ExampleCard
                    title="Modal básico"
                    desc="Diálogo centrado con header, body y footer"
                    filename="MyModal.tsx"
                    code={CODE.modal}
                >
                    <Button onClick={() => setModalOpen(true)}>Abrir Modal</Button>
                </ExampleCard>

                <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} width={480}>
                    <Modal.Header title="Título del modal" />
                    <Modal.Body>
                        <p style={{ fontSize: 14, color: 'var(--text)', margin: 0, lineHeight: 1.6 }}>
                            Modal de ejemplo. Puedes colocar cualquier contenido: formularios, listas, imágenes, etc.
                        </p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={() => setModalOpen(false)}>Cerrar</Button>
                    </Modal.Footer>
                </Modal>

                {/* Modal con formulario + toast */}
                <ExampleCard
                    title="Modal con formulario"
                    desc="Formulario con guardado — muestra toast de éxito o error"
                    filename="EditUserModal.tsx"
                    code={CODE.modalForm}
                >
                    <Button onClick={() => setModalFormOpen(true)}>Editar usuario</Button>
                </ExampleCard>

                <Modal isOpen={modalFormOpen} onClose={() => setModalFormOpen(false)} width={480}>
                    <Modal.Header title="Editar usuario" />
                    <Modal.Body>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div>
                                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-h)', display: 'block', marginBottom: 4 }}>Nombre</label>
                                <input
                                    value={modalFormName}
                                    onChange={(e) => setModalFormName(e.target.value)}
                                    style={{
                                        width: '100%', padding: '8px 12px', border: '1px solid var(--border)',
                                        borderRadius: 8, fontSize: 13, background: 'var(--bg)', color: 'var(--text-h)',
                                        boxSizing: 'border-box', fontFamily: 'var(--sans)',
                                    }}
                                />
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setModalFormOpen(false)}>Cancelar</Button>
                        <Button onClick={() => {
                            setModalFormOpen(false)
                            toast.success('Usuario actualizado correctamente')
                        }}>Guardar</Button>
                    </Modal.Footer>
                </Modal>
            </div>

            <div className={styles.divider} />

            {/* ════════════════════════════════════════════
                DRAWERS
               ════════════════════════════════════════════ */}
            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Drawers</h2>
                <p className={styles.sectionDesc}>
                    Paneles laterales con slide-in desde la derecha. En móvil (&lt;480px) se convierten en bottom sheet.
                </p>

                {/* Drawer básico */}
                <ExampleCard
                    title="Drawer lateral"
                    desc="Panel deslizante desde la derecha con header, body y footer"
                    filename="MyDrawer.tsx"
                    code={CODE.drawer}
                >
                    <Button onClick={() => setDrawerOpen(true)}>Abrir Drawer</Button>
                </ExampleCard>

                <Drawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} width={480}>
                    <Drawer.Header title="Panel lateral" />
                    <Drawer.Body>
                        <p style={{ fontSize: 14, color: 'var(--text)', margin: 0, lineHeight: 1.6 }}>
                            Drawer de ejemplo. Se desliza desde la derecha y en móvil aparece como bottom sheet.
                        </p>
                    </Drawer.Body>
                    <Drawer.Footer>
                        <Button onClick={() => setDrawerOpen(false)}>Cerrar</Button>
                    </Drawer.Footer>
                </Drawer>

                {/* DrawerStack */}
                <ExampleCard
                    title="DrawerStack — multinivel"
                    desc="3 niveles: lista → detalle → configuración. Breadcrumbs para navegar entre niveles"
                    filename="UserExplorer.tsx"
                    code={CODE.drawerStack}
                >
                    <Button onClick={() => setStackOpen(true)}>Abrir DrawerStack</Button>
                </ExampleCard>

                <DrawerStack
                    isOpen={stackOpen}
                    onClose={closeStack}
                    level={stackLevel}
                    onBack={() => setStackLevel((l) => l - 1)}
                    onNavigate={(lvl) => setStackLevel(lvl)}
                    breadcrumbs={[
                        { label: 'Usuarios', level: 0 },
                        ...(stackLevel >= 1 && stackSelected ? [{ label: stackSelected.name, level: 1 }] : []),
                        ...(stackLevel >= 2 ? [{ label: 'Configuración', level: 2 }] : []),
                    ]}
                    width={480}
                >
                    {stackLevel === 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {[
                                { id: 1, name: 'Ana García', email: 'ana@email.com' },
                                { id: 2, name: 'Carlos López', email: 'carlos@email.com' },
                                { id: 3, name: 'María Ruiz', email: 'maria@email.com' },
                            ].map((user) => (
                                <Button
                                    key={user.id}
                                    variant="secondary"
                                    onClick={() => { setStackSelected(user); setStackLevel(1) }}
                                    style={{
                                        justifyContent: 'flex-start', gap: 10, height: 'auto',
                                        padding: '12px 16px',
                                    }}
                                >
                                    <LuUser size={18} />
                                    <div>
                                        <div style={{ fontWeight: 600 }}>{user.name}</div>
                                        <div style={{ fontSize: 12, color: 'var(--text)', opacity: 0.6 }}>{user.email}</div>
                                    </div>
                                </Button>
                            ))}
                        </div>
                    )}

                    {stackLevel === 1 && stackSelected && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div>
                                <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-h)', marginBottom: 4 }}>{stackSelected.name}</div>
                                <div style={{ fontSize: 13, color: 'var(--text)' }}>{stackSelected.email}</div>
                            </div>
                            <Button
                                variant="secondary"
                                onClick={() => setStackLevel(2)}
                                style={{ justifyContent: 'flex-start', gap: 8 }}
                            >
                                <LuSettings size={16} /> Configuración →
                            </Button>
                        </div>
                    )}

                    {stackLevel === 2 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-h)' }}>Configuración</div>
                            {['Notificaciones', 'Privacidad', 'Idioma'].map((opt) => (
                                <div
                                    key={opt}
                                    style={{
                                        padding: '12px 16px', border: '1px solid var(--border)',
                                        borderRadius: 8, fontSize: 13, color: 'var(--text-h)',
                                        background: 'var(--bg)', fontFamily: 'var(--sans)',
                                    }}
                                >
                                    {opt}
                                </div>
                            ))}
                        </div>
                    )}
                </DrawerStack>
            </div>
        </div>
    )
}
