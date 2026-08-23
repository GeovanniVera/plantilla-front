import { useState } from 'react'
import { LuHouse, LuFolder, LuFile, LuSettings, LuUser, LuBell, LuPalette, LuShield } from 'react-icons/lu'
import { Tabs, Breadcrumb } from '@components/navigation'
import { ExampleCard } from '@dev/showcase/Showcase'
import styles from './TablesShowcase.module.css'

// ─── Code Snippets ────────────────────────────────────────
const CODE = {
    breadcrumbBasic: `import { Breadcrumb } from '@components/navigation'
import { LuHouse, LuFolder } from 'react-icons/lu'

export default function MyBreadcrumb() {
    return (
        <Breadcrumb
            items={[
                { label: 'Inicio', href: '/', icon: <LuHouse size={14} /> },
                { label: 'Proyectos', href: '/proyectos', icon: <LuFolder size={14} /> },
                { label: 'Proyecto Alpha' },
            ]}
        />
    )
}

// El último item NO tiene href → se renderiza como texto
// Si hay más de 3 items, los intermedios se colapsan con "..."`,

    breadcrumbSeparator: `import { Breadcrumb } from '@components/navigation'

export default function SettingsBreadcrumb() {
    return (
        <Breadcrumb
            separator=">"
            items={[
                { label: 'Dashboard', href: '/' },
                { label: 'Usuarios', href: '/usuarios' },
                { label: 'Configuración', href: '/usuarios/config' },
                { label: 'Perfil' },
            ]}
        />
    )
}

// Separadores disponibles: "/", ">", "›", o un ReactNode custom`,

    breadcrumbCollapse: `import { Breadcrumb } from '@components/navigation'

export default function DeepBreadcrumb() {
    return (
        <Breadcrumb
            items={[
                { label: 'Inicio', href: '/' },
                { label: 'Organización', href: '/org' },
                { label: 'Equipos', href: '/org/equipos' },
                { label: 'Proyecto', href: '/org/equipos/proyecto' },
                { label: 'Configuración avanzada' },
            ]}
        />
    )
}

// Con 5 items se muestra: Inicio / ... / Proyecto / Configuración avanzada
// Los items del medio se colapsan automáticamente`,

    tabsBasic: `import { useState } from 'react'
import { Tabs } from '@components/navigation'

export default function SettingsPage() {
    const [tab, setTab] = useState('general')

    return (
        <Tabs value={tab} onChange={setTab}>
            <Tabs.List>
                <Tabs.Trigger value="general">General</Tabs.Trigger>
                <Tabs.Trigger value="security" icon={<ShieldIcon />}>
                    Seguridad
                </Tabs.Trigger>
                <Tabs.Trigger value="advanced" disabled>
                    Avanzado
                </Tabs.Trigger>
            </Tabs.List>

            <Tabs.Panel value="general">
                <p>Configuración general de la aplicación.</p>
            </Tabs.Panel>

            <Tabs.Panel value="security">
                <p>2FA, contraseñas, sesiones activas.</p>
            </Tabs.Panel>
        </Tabs>
    )
}

// variant: "underline" (default) | "pills" | "enclosed"
// Props: value, onChange, defaultValue, disabled, icon`,

    tabsPills: `import { Tabs } from '@components/navigation'
import { LuUser, LuBell, LuPalette } from 'react-icons/lu'

export default function UserProfile() {
    return (
        <Tabs defaultValue="profile" variant="pills">
            <Tabs.List>
                <Tabs.Trigger value="profile" icon={<LuUser size={14} />}>
                    Perfil
                </Tabs.Trigger>
                <Tabs.Trigger value="notifications" icon={<LuBell size={14} />}>
                    Notificaciones
                </Tabs.Trigger>
                <Tabs.Trigger value="appearance" icon={<LuPalette size={14} />}>
                    Apariencia
                </Tabs.Trigger>
            </Tabs.List>

            <Tabs.Panel value="profile">
                <p>Nombre, avatar, bio del usuario.</p>
            </Tabs.Panel>

            <Tabs.Panel value="notifications">
                <p>Email, push, in-app notifications.</p>
            </Tabs.Panel>

            <Tabs.Panel value="appearance">
                <p>Tema claro/oscuro, idioma, fuentes.</p>
            </Tabs.Panel>
        </Tabs>
    )
}`,
}

// ─── Page ─────────────────────────────────────────────────
export default function ComponentesNavegacion() {
    const [currentTab, setCurrentTab] = useState('overview')

    return (
        <div className={styles.page}>


            {/* ════════════════════════════════════════════
                BREADCRUMB
               ════════════════════════════════════════════ */}
            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Breadcrumb</h2>
                <p className={styles.sectionDesc}>
                    Migas de pan con separador customizable. Más de 3 items colapsa los intermedios con "...". El último item es texto (no link).
                </p>

                {/* Basic with icons */}
                <ExampleCard
                    title="Breadcrumb con iconos"
                    desc="Cada item puede tener un ícono opcional"
                    filename="MyBreadcrumb.tsx"
                    code={CODE.breadcrumbBasic}
                >
                    <Breadcrumb items={[
                        { label: 'Inicio', href: '/', icon: <LuHouse size={14} /> },
                        { label: 'Proyectos', href: '/proyectos', icon: <LuFolder size={14} /> },
                        { label: 'Proyecto Alpha' },
                    ]} />
                </ExampleCard>

                {/* Custom separator */}
                <ExampleCard
                    title="Separador personalizado"
                    desc="Separador > en lugar de /"
                    filename="SettingsBreadcrumb.tsx"
                    code={CODE.breadcrumbSeparator}
                >
                    <Breadcrumb
                        separator=">"
                        items={[
                            { label: 'Dashboard', href: '/' },
                            { label: 'Usuarios', href: '/usuarios' },
                            { label: 'Configuración', href: '/usuarios/config' },
                            { label: 'Perfil' },
                        ]}
                    />
                </ExampleCard>

                {/* Collapsed */}
                <ExampleCard
                    title="Colapsado automático"
                    desc="5 items → los intermedios se reemplazan por '...'"
                    filename="DeepBreadcrumb.tsx"
                    code={CODE.breadcrumbCollapse}
                >
                    <Breadcrumb items={[
                        { label: 'Inicio', href: '/' },
                        { label: 'Organización', href: '/org' },
                        { label: 'Equipos', href: '/org/equipos' },
                        { label: 'Proyecto', href: '/org/equipos/proyecto' },
                        { label: 'Configuración avanzada' },
                    ]} />
                </ExampleCard>
            </div>

            <div className={styles.divider} />

            {/* ════════════════════════════════════════════
                TABS
               ════════════════════════════════════════════ */}
            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Tabs</h2>
                <p className={styles.sectionDesc}>
                    Navegación por pestañas con 3 variantes: underline, pills y enclosed. Value controlado, lazy rendering y keyboard navigation.
                </p>

                {/* Underline */}
                <ExampleCard
                    title="Underline (default)"
                    desc="Tabs con línea inferior. Ideal para formularios y settings."
                    filename="SettingsPage.tsx"
                    code={CODE.tabsBasic}
                >
                    <Tabs value={currentTab} onChange={setCurrentTab}>
                        <Tabs.List>
                            <Tabs.Trigger value="overview">Resumen</Tabs.Trigger>
                            <Tabs.Trigger value="details" icon={<LuFile size={14} />}>Detalles</Tabs.Trigger>
                            <Tabs.Trigger value="settings" icon={<LuSettings size={14} />} disabled>Configuración</Tabs.Trigger>
                        </Tabs.List>
                        <Tabs.Panel value="overview">
                            <div style={{ padding: 16, fontSize: 14, color: 'var(--text)' }}>
                                Panel de resumen con estadísticas generales del proyecto.
                            </div>
                        </Tabs.Panel>
                        <Tabs.Panel value="details">
                            <div style={{ padding: 16, fontSize: 14, color: 'var(--text)' }}>
                                Detalles técnicos, dependencias y configuración del proyecto.
                            </div>
                        </Tabs.Panel>
                    </Tabs>
                </ExampleCard>

                {/* Pills */}
                <ExampleCard
                    title="Pills"
                    desc="Tabs redondeados estilo badge. Ideal para perfiles y preferencias."
                    filename="UserProfile.tsx"
                    code={CODE.tabsPills}
                >
                    <Tabs defaultValue="profile" variant="pills">
                        <Tabs.List>
                            <Tabs.Trigger value="profile" icon={<LuUser size={14} />}>Perfil</Tabs.Trigger>
                            <Tabs.Trigger value="notifications" icon={<LuBell size={14} />}>Notificaciones</Tabs.Trigger>
                            <Tabs.Trigger value="appearance" icon={<LuPalette size={14} />}>Apariencia</Tabs.Trigger>
                        </Tabs.List>
                        <Tabs.Panel value="profile">
                            <div style={{ padding: 16, fontSize: 14, color: 'var(--text)' }}>
                                Configuración del perfil de usuario: nombre, avatar, bio.
                            </div>
                        </Tabs.Panel>
                        <Tabs.Panel value="notifications">
                            <div style={{ padding: 16, fontSize: 14, color: 'var(--text)' }}>
                                Preferencias de notificaciones: email, push, in-app.
                            </div>
                        </Tabs.Panel>
                        <Tabs.Panel value="appearance">
                            <div style={{ padding: 16, fontSize: 14, color: 'var(--text)' }}>
                                Tema claro/oscuro, idioma, fuentes.
                            </div>
                        </Tabs.Panel>
                    </Tabs>
                </ExampleCard>

                {/* Enclosed */}
                <ExampleCard
                    title="Enclosed"
                    desc="Tabs con borde completo. Ideal para configuración de admin."
                    filename="AdminSettings.tsx"
                    code={`import { Tabs } from '@components/navigation'
import { LuShield } from 'react-icons/lu'

export default function AdminSettings() {
    return (
        <Tabs defaultValue="general" variant="enclosed">
            <Tabs.List>
                <Tabs.Trigger value="general">General</Tabs.Trigger>
                <Tabs.Trigger value="security" icon={<LuShield size={14} />}>
                    Seguridad
                </Tabs.Trigger>
                <Tabs.Trigger value="advanced">Avanzado</Tabs.Trigger>
            </Tabs.List>

            <Tabs.Panel value="general">
                <p>Configuración general de la aplicación.</p>
            </Tabs.Panel>

            <Tabs.Panel value="security">
                <p>2FA, contraseñas, sesiones activas.</p>
            </Tabs.Panel>

            <Tabs.Panel value="advanced">
                <p>Debug, logs, features experimentales.</p>
            </Tabs.Panel>
        </Tabs>
    )
}`}
                >
                    <Tabs defaultValue="tab1" variant="enclosed">
                        <Tabs.List>
                            <Tabs.Trigger value="tab1">General</Tabs.Trigger>
                            <Tabs.Trigger value="tab2" icon={<LuShield size={14} />}>Seguridad</Tabs.Trigger>
                            <Tabs.Trigger value="tab3">Avanzado</Tabs.Trigger>
                        </Tabs.List>
                        <Tabs.Panel value="tab1">
                            <div style={{ padding: 16, fontSize: 14, color: 'var(--text)' }}>
                                Configuración general de la aplicación.
                            </div>
                        </Tabs.Panel>
                        <Tabs.Panel value="tab2">
                            <div style={{ padding: 16, fontSize: 14, color: 'var(--text)' }}>
                                Configuración de seguridad: 2FA, contraseñas, sesiones.
                            </div>
                        </Tabs.Panel>
                        <Tabs.Panel value="tab3">
                            <div style={{ padding: 16, fontSize: 14, color: 'var(--text)' }}>
                                Opciones avanzadas: debug, logs, experimental features.
                            </div>
                        </Tabs.Panel>
                    </Tabs>
                </ExampleCard>
            </div>
        </div>
    )
}
