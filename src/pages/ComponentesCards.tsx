import Button from '@components/primitives/Button'
import { ExampleCard } from '@dev/showcase/Showcase'
import Card from '@components/layout/Card'
import { StatCard, StatCardGroup } from '@components/layout/StatCard'
import { LuCalendar, LuCheck, LuX, LuClock, LuUsers, LuChartLine, LuZap, LuTarget } from 'react-icons/lu'
import styles from './TablesShowcase.module.css'
import gridStyles from './ComponentesCards.module.css'

// ─── Code Snippets ────────────────────────────────────────
const CODE = {
    basic: `import Card from '@components/layout/Card'

export default function MyComponent() {
    return (
        <Card>
            <Card.Header>
                <Card.Title>Card Title</Card.Title>
            </Card.Header>
            <Card.Body>
                <p>Contenido de ejemplo dentro de una tarjeta reutilizable.</p>
            </Card.Body>
        </Card>
    )
}`,

    description: `import Card from '@components/layout/Card'

export default function ProjectCard() {
    return (
        <Card>
            <Card.Header>
                <Card.Title>Proyecto Alpha</Card.Title>
                <Card.Description>
                    Una aplicación web moderna construida con React y TypeScript.
                </Card.Description>
            </Card.Header>
            <Card.Body>
                <p>Versión 2.1.0 • Última actualización hace 3 días</p>
            </Card.Body>
        </Card>
    )
}`,

    noTitle: `import Card from '@components/layout/Card'

export default function FlexCard() {
    return (
        <Card>
            <Card.Body>
                <p>Tarjeta sin header, ideal para contenido flexible.</p>
            </Card.Body>
        </Card>
    )
}`,

    image: `import Card from '@components/layout/Card'

export default function ImageCard() {
    return (
        <Card>
            <Card.Image src="/path/to/image.jpg" alt="Montañas al atardecer" />
            <Card.Header>
                <Card.Title>Paisaje Mountain</Card.Title>
                <Card.Description>
                    Una vista impresionante de las montañas al atardecer.
                </Card.Description>
            </Card.Header>
            <Card.Body>
                <p>Fotografía capturada en los Andes.</p>
            </Card.Body>
        </Card>
    )
}`,

    footer: `import Card from '@components/layout/Card'
import Button from '@components/primitives/Button'

export default function ActionCard() {
    return (
        <Card>
            <Card.Header>
                <Card.Title>Nuevo Reporte</Card.Title>
                <Card.Description>
                    El reporte mensual está listo para revisión.
                </Card.Description>
            </Card.Header>
            <Card.Body>
                <p>12 páginas • Generado automáticamente.</p>
            </Card.Body>
            <Card.Footer>
                <Button>Ver reporte</Button>
                <Button variant="secondary">Descargar</Button>
            </Card.Footer>
        </Card>
    )
}`,

    clickable: `import Card from '@components/layout/Card'

export default function ClickableCard() {
    const handleClick = () => {
        alert('¡Card clickeada!')
    }

    return (
        <Card onClick={handleClick}>
            <Card.Header>
                <Card.Title>Haz clic aquí</Card.Title>
                <Card.Description>
                    Esta tarjeta es interactiva y responde al click.
                </Card.Description>
            </Card.Header>
            <Card.Body>
                <p>Pasa el mouse y haz click para ver la acción.</p>
            </Card.Body>
        </Card>
    )
}`,

    outlined: `import Card from '@components/layout/Card'

export default function OutlinedCard() {
    return (
        <Card variant="outlined">
            <Card.Header>
                <Card.Title>Borde destacado</Card.Title>
                <Card.Description>
                    Estilo outlined para énfasis visual.
                </Card.Description>
            </Card.Header>
            <Card.Body>
                <p>Sin fondo, solo borde grueso.</p>
            </Card.Body>
        </Card>
    )
}`,

    elevated: `import Card from '@components/layout/Card'

export default function ElevatedCard() {
    return (
        <Card variant="elevated">
            <Card.Header>
                <Card.Title>Card elevada</Card.Title>
                <Card.Description>
                    Sombra permanente para mayor profundidad.
                </Card.Description>
            </Card.Header>
            <Card.Body>
                <p>Perfecta para modales o overlays.</p>
            </Card.Body>
        </Card>
    )
}`,

    flat: `import Card from '@components/layout/Card'

export default function FlatCard() {
    return (
        <Card variant="flat">
            <Card.Header>
                <Card.Title>Card plana</Card.Title>
                <Card.Description>
                    Sin bordes, se integra con el fondo.
                </Card.Description>
            </Card.Header>
            <Card.Body>
                <p>Ideal para secciones de contenido agrupado.</p>
            </Card.Body>
        </Card>
    )
}`,
}

// ─── Page ─────────────────────────────────────────────────
export default function ComponentesCards() {
    return (
        <div className={styles.page}>

            {/* ════════════════════════════════════════════
                CARDS
               ════════════════════════════════════════════ */}
            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Cards</h2>
                <p className={styles.sectionDesc}>
                    Tarjetas contenedoras para mostrar información agrupada. Compónselas con Card.Header, Card.Body, Card.Footer, Card.Image. Variantes: default, outlined, elevated, flat.
                </p>

                {/* Card básica */}
                <ExampleCard
                    title="Con título"
                    desc="Tarjeta básica con header y contenido"
                    filename="BasicCard.tsx"
                    code={CODE.basic}
                    previewClassName={gridStyles.cardGrid}
                >
                    <Card>
                        <Card.Header>
                            <Card.Title>Card Title</Card.Title>
                        </Card.Header>
                        <Card.Body>
                            <p style={{ margin: 0, fontSize: 14, color: 'var(--text)' }}>
                                Contenido de ejemplo dentro de una tarjeta reutilizable.
                            </p>
                        </Card.Body>
                    </Card>
                    <Card>
                        <Card.Header>
                            <Card.Title>Segunda Card</Card.Title>
                        </Card.Header>
                        <Card.Body>
                            <p style={{ margin: 0, fontSize: 14, color: 'var(--text)' }}>
                                Otra tarjeta en la misma fila para demostrar el grid.
                            </p>
                        </Card.Body>
                    </Card>
                    <Card>
                        <Card.Header>
                            <Card.Title>Tercera Card</Card.Title>
                        </Card.Header>
                        <Card.Body>
                            <p style={{ margin: 0, fontSize: 14, color: 'var(--text)' }}>
                                Tres cards por fila en desktop, dos en tablet, una en móvil.
                            </p>
                        </Card.Body>
                    </Card>
                </ExampleCard>

                {/* Card con descripción */}
                <ExampleCard
                    title="Con descripción"
                    desc="Título + subtítulo descriptivo para más contexto"
                    filename="ProjectCard.tsx"
                    code={CODE.description}
                    previewClassName={gridStyles.cardGrid}
                >
                    <Card>
                        <Card.Header>
                            <Card.Title>Proyecto Alpha</Card.Title>
                            <Card.Description>Una aplicación web moderna con React.</Card.Description>
                        </Card.Header>
                        <Card.Body>
                            <p style={{ margin: 0, fontSize: 13, color: 'var(--text)' }}>
                                Versión 2.1.0 • Última actualización hace 3 días
                            </p>
                        </Card.Body>
                    </Card>
                    <Card>
                        <Card.Header>
                            <Card.Title>Proyecto Beta</Card.Title>
                            <Card.Description>Dashboard de analytics en tiempo real.</Card.Description>
                        </Card.Header>
                        <Card.Body>
                            <p style={{ margin: 0, fontSize: 13, color: 'var(--text)' }}>
                                Versión 1.4.2 • En desarrollo activo
                            </p>
                        </Card.Body>
                    </Card>
                    <Card>
                        <Card.Header>
                            <Card.Title>Proyecto Gamma</Card.Title>
                            <Card.Description>API REST para integración con terceros.</Card.Description>
                        </Card.Header>
                        <Card.Body>
                            <p style={{ margin: 0, fontSize: 13, color: 'var(--text)' }}>
                                Versión 3.0.0 • Producción estable
                            </p>
                        </Card.Body>
                    </Card>
                </ExampleCard>

                {/* Card sin título */}
                <ExampleCard
                    title="Sin header"
                    desc="Tarjeta solo con contenido flexible"
                    filename="FlexCard.tsx"
                    code={CODE.noTitle}
                    previewClassName={gridStyles.cardGrid}
                >
                    <Card>
                        <Card.Body>
                            <p style={{ margin: 0, fontSize: 14, color: 'var(--text)' }}>
                                Tarjeta sin header, ideal para contenido flexible.
                            </p>
                        </Card.Body>
                    </Card>
                    <Card>
                        <Card.Body>
                            <p style={{ margin: 0, fontSize: 14, color: 'var(--text)' }}>
                                Contenido libre sin restricciones de estructura.
                            </p>
                        </Card.Body>
                    </Card>
                    <Card>
                        <Card.Body>
                            <p style={{ margin: 0, fontSize: 14, color: 'var(--text)' }}>
                                Perfecta para widgets o gadgets personalizados.
                            </p>
                        </Card.Body>
                    </Card>
                </ExampleCard>

                {/* Card con imagen */}
                <ExampleCard
                    title="Con imagen"
                    desc="Tarjeta con imagen hero en la parte superior (aspect-ratio 16:9)"
                    filename="ImageCard.tsx"
                    code={CODE.image}
                    previewClassName={gridStyles.cardGrid}
                >
                    <Card>
                        <Card.Image src="https://picsum.photos/seed/mountain/400/225" alt="Montañas" />
                        <Card.Header>
                            <Card.Title>Paisaje Mountain</Card.Title>
                            <Card.Description>Vista de las montañas al atardecer.</Card.Description>
                        </Card.Header>
                        <Card.Body>
                            <p style={{ margin: 0, fontSize: 13, color: 'var(--text)' }}>Fotografía en los Andes.</p>
                        </Card.Body>
                    </Card>
                    <Card>
                        <Card.Image src="https://picsum.photos/seed/ocean/400/225" alt="Océano" />
                        <Card.Header>
                            <Card.Title>Costa Azul</Card.Title>
                            <Card.Description>Atardecer sobre el océano Pacífico.</Card.Description>
                        </Card.Header>
                        <Card.Body>
                            <p style={{ margin: 0, fontSize: 13, color: 'var(--text)' }}>Capturada en California.</p>
                        </Card.Body>
                    </Card>
                    <Card>
                        <Card.Image src="https://picsum.photos/seed/forest/400/225" alt="Bosque" />
                        <Card.Header>
                            <Card.Title>Bosque Norte</Card.Title>
                            <Card.Description>Niebla entre los árboles milenarios.</Card.Description>
                        </Card.Header>
                        <Card.Body>
                            <p style={{ margin: 0, fontSize: 13, color: 'var(--text)' }}>Reserve natural de Oregón.</p>
                        </Card.Body>
                    </Card>
                </ExampleCard>

                {/* Card con footer */}
                <ExampleCard
                    title="Con footer"
                    desc="Zona de acciones en el pie de la tarjeta"
                    filename="ActionCard.tsx"
                    code={CODE.footer}
                    previewClassName={gridStyles.cardGrid}
                >
                    <Card>
                        <Card.Header>
                            <Card.Title>Nuevo Reporte</Card.Title>
                            <Card.Description>Listo para revisión.</Card.Description>
                        </Card.Header>
                        <Card.Body>
                            <p style={{ margin: 0, fontSize: 13, color: 'var(--text)' }}>12 páginas • Generado auto.</p>
                        </Card.Body>
                        <Card.Footer>
                            <Button size="sm">Ver</Button>
                            <Button size="sm" variant="secondary">Descargar</Button>
                        </Card.Footer>
                    </Card>
                    <Card>
                        <Card.Header>
                            <Card.Title>Gráfico Q4</Card.Title>
                            <Card.Description>Análisis de ventas trimestral.</Card.Description>
                        </Card.Header>
                        <Card.Body>
                            <p style={{ margin: 0, fontSize: 13, color: 'var(--text)' }}>8 páginas • PDF adjunto.</p>
                        </Card.Body>
                        <Card.Footer>
                            <Button size="sm">Ver</Button>
                            <Button size="sm" variant="secondary">Exportar</Button>
                        </Card.Footer>
                    </Card>
                </ExampleCard>

                {/* Card clickeable */}
                <ExampleCard
                    title="Clickeable"
                    desc="Tarjeta interactiva con estado hover y focus"
                    filename="ClickableCard.tsx"
                    code={CODE.clickable}
                    previewClassName={gridStyles.cardGrid}
                >
                    <Card onClick={() => alert('Opción A seleccionada')}>
                        <Card.Header>
                            <Card.Title>Opción A</Card.Title>
                            <Card.Description>Selecciona esta tarjeta.</Card.Description>
                        </Card.Header>
                        <Card.Body>
                            <p style={{ margin: 0, fontSize: 13, color: 'var(--text)' }}>Hover y click para interactuar.</p>
                        </Card.Body>
                    </Card>
                    <Card onClick={() => alert('Opción B seleccionada')}>
                        <Card.Header>
                            <Card.Title>Opción B</Card.Title>
                            <Card.Description>Otra tarjeta clickeable.</Card.Description>
                        </Card.Header>
                        <Card.Body>
                            <p style={{ margin: 0, fontSize: 13, color: 'var(--text)' }}>Accesible con teclado (Enter/Space).</p>
                        </Card.Body>
                    </Card>
                    <Card onClick={() => alert('Opción C seleccionada')}>
                        <Card.Header>
                            <Card.Title>Opción C</Card.Title>
                            <Card.Description>Tercera opción interactiva.</Card.Description>
                        </Card.Header>
                        <Card.Body>
                            <p style={{ margin: 0, fontSize: 13, color: 'var(--text)' }}>Focus visible con outline.</p>
                        </Card.Body>
                    </Card>
                </ExampleCard>
            </div>

            <div className={styles.divider} />

            {/* ════════════════════════════════════════════
                VARIANTES
               ════════════════════════════════════════════ */}
            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Variantes</h2>
                <p className={styles.sectionDesc}>
                    Estilos visuales diferentes para adaptarse a distintos contextos de la interfaz.
                </p>

                {/* Outlined */}
                <ExampleCard
                    title="Variante Outlined"
                    desc="Borde grueso y fondo transparente"
                    filename="OutlinedCard.tsx"
                    code={CODE.outlined}
                    previewClassName={gridStyles.cardGrid}
                >
                    <Card variant="outlined">
                        <Card.Header>
                            <Card.Title>Outlined A</Card.Title>
                            <Card.Description>Borde destacado.</Card.Description>
                        </Card.Header>
                        <Card.Body>
                            <p style={{ margin: 0, fontSize: 13, color: 'var(--text)' }}>Sin fondo, solo borde.</p>
                        </Card.Body>
                    </Card>
                    <Card variant="outlined">
                        <Card.Header>
                            <Card.Title>Outlined B</Card.Title>
                            <Card.Description>Mismo estilo.</Card.Description>
                        </Card.Header>
                        <Card.Body>
                            <p style={{ margin: 0, fontSize: 13, color: 'var(--text)' }}>Consistencia visual.</p>
                        </Card.Body>
                    </Card>
                    <Card variant="outlined">
                        <Card.Header>
                            <Card.Title>Outlined C</Card.Title>
                            <Card.Description>Tres en fila.</Card.Description>
                        </Card.Header>
                        <Card.Body>
                            <p style={{ margin: 0, fontSize: 13, color: 'var(--text)' }}>Responsive grid.</p>
                        </Card.Body>
                    </Card>
                </ExampleCard>

                {/* Elevated */}
                <ExampleCard
                    title="Variante Elevated"
                    desc="Sombra elevada para destacar del fondo"
                    filename="ElevatedCard.tsx"
                    code={CODE.elevated}
                    previewClassName={gridStyles.cardGrid}
                >
                    <Card variant="elevated">
                        <Card.Header>
                            <Card.Title>Elevada A</Card.Title>
                            <Card.Description>Sombra permanente.</Card.Description>
                        </Card.Header>
                        <Card.Body>
                            <p style={{ margin: 0, fontSize: 13, color: 'var(--text)' }}>Para modales o overlays.</p>
                        </Card.Body>
                    </Card>
                    <Card variant="elevated">
                        <Card.Header>
                            <Card.Title>Elevada B</Card.Title>
                            <Card.Description>Profundidad visual.</Card.Description>
                        </Card.Header>
                        <Card.Body>
                            <p style={{ margin: 0, fontSize: 13, color: 'var(--text)' }}>Destaca del fondo.</p>
                        </Card.Body>
                    </Card>
                    <Card variant="elevated">
                        <Card.Header>
                            <Card.Title>Elevada C</Card.Title>
                            <Card.Description>Máximo énfasis.</Card.Description>
                        </Card.Header>
                        <Card.Body>
                            <p style={{ margin: 0, fontSize: 13, color: 'var(--text)' }}>Tres cards elevadas.</p>
                        </Card.Body>
                    </Card>
                </ExampleCard>

                {/* Flat */}
                <ExampleCard
                    title="Variante Flat"
                    desc="Sin borde, fondo sutil del sistema"
                    filename="FlatCard.tsx"
                    code={CODE.flat}
                    previewClassName={gridStyles.cardGrid}
                >
                    <Card variant="flat">
                        <Card.Header>
                            <Card.Title>Flat A</Card.Title>
                            <Card.Description>Sin bordes.</Card.Description>
                        </Card.Header>
                        <Card.Body>
                            <p style={{ margin: 0, fontSize: 13, color: 'var(--text)' }}>Se integra con el fondo.</p>
                        </Card.Body>
                    </Card>
                    <Card variant="flat">
                        <Card.Header>
                            <Card.Title>Flat B</Card.Title>
                            <Card.Description>Fondo sutil.</Card.Description>
                        </Card.Header>
                        <Card.Body>
                            <p style={{ margin: 0, fontSize: 13, color: 'var(--text)' }}>Contenido agrupado.</p>
                        </Card.Body>
                    </Card>
                    <Card variant="flat">
                        <Card.Header>
                            <Card.Title>Flat C</Card.Title>
                            <Card.Description>Mínimo contraste.</Card.Description>
                        </Card.Header>
                        <Card.Body>
                            <p style={{ margin: 0, fontSize: 13, color: 'var(--text)' }}>Tres planas en fila.</p>
                        </Card.Body>
                    </Card>
                </ExampleCard>
            </div>

            <div className={styles.divider} />

            {/* ════════════════════════════════════════════
                STAT CARDS
               ════════════════════════════════════════════ */}
            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Stat Cards</h2>
                <p className={styles.sectionDesc}>
                    Tarjetas de estadísticas para dashboards. Borde superior de color, ícono en caja y número destacado. Composición: StatCardGroup + StatCard.
                </p>

                {/* Básicas */}
                <ExampleCard
                    title="Básicas"
                    desc="4 tarjetas de stats con acentos de color diferentes"
                    filename="StatCards.tsx"
                    code={`import { StatCard, StatCardGroup } from '@components/layout/StatCard'
import { LuCalendar, LuCheck, LuX, LuClock } from 'react-icons/lu'

export default function Dashboard() {
    return (
        <StatCardGroup>
            <StatCard value={25} label="Total" accent="#64748b" icon={LuCalendar} />
            <StatCard value={5} label="Disponibles" accent="#10b981" icon={LuCheck} />
                    <StatCard value={17} label="Ocupados" accent="#ef4444" icon={LuX} />
            <StatCard value={3} label="Atención" accent="#f59e0b" icon={LuClock} />
        </StatCardGroup>
    )
}`}
                    previewClassName={gridStyles.cardGrid}
                >
                    <StatCardGroup>
                        <StatCard value={25} label="Total" accent="#64748b" icon={LuCalendar} />
                        <StatCard value={5} label="Disponibles" accent="#10b981" icon={LuCheck} />
                        <StatCard value={17} label="Ocupados" accent="#ef4444" icon={LuX} />
                        <StatCard value={3} label="Atención" accent="#f59e0b" icon={LuClock} />
                    </StatCardGroup>
                </ExampleCard>

                {/* Dashboard real */}
                <ExampleCard
                    title="Dashboard de proyecto"
                    desc="Stats con métricas de un proyecto"
                    filename="ProjectStats.tsx"
                    code={`import { StatCard, StatCardGroup } from '@components/layout/StatCard'
import { LuUsers, LuChartLine, LuZap, LuTarget } from 'react-icons/lu'

export default function ProjectStats() {
    return (
        <StatCardGroup>
            <StatCard value={128} label="Usuarios activos" accent="#3b82f6" icon={LuUsers} />
            <StatCard value={84} label="Tareas completadas" accent="#10b981" icon={LuChartLine} />
            <StatCard value={12} label="En progreso" accent="#f59e0b" icon={LuZap} />
            <StatCard value={96} label="Meta alcanzada" accent="#8b5cf6" icon={LuTarget} />
        </StatCardGroup>
    )
}`}
                    previewClassName={gridStyles.cardGrid}
                >
                    <StatCardGroup>
                        <StatCard value={128} label="Usuarios activos" accent="#3b82f6" icon={LuUsers} />
                        <StatCard value={84} label="Tareas completadas" accent="#10b981" icon={LuChartLine} />
                        <StatCard value={12} label="En progreso" accent="#f59e0b" icon={LuZap} />
                        <StatCard value={96} label="Meta alcanzada" accent="#8b5cf6" icon={LuTarget} />
                    </StatCardGroup>
                </ExampleCard>

                {/* Dos en fila */}
                <ExampleCard
                    title="Dos estadísticas"
                    desc="Grid se adapta: 2 en desktop, 1 en móvil"
                    filename="SimpleStats.tsx"
                    code={`import { StatCard, StatCardGroup } from '@components/layout/StatCard'
import { LuCheck, LuX } from 'react-icons/lu'

export default function SimpleStats() {
    return (
        <StatCardGroup>
            <StatCard value={42} label="Aprobados" accent="#10b981" icon={LuCheck} />
            <StatCard value={8} label="Rechazados" accent="#ef4444" icon={LuX} />
        </StatCardGroup>
    )
}`}
                    previewClassName={gridStyles.cardGrid}
                >
                    <StatCardGroup>
                        <StatCard value={42} label="Aprobados" accent="#10b981" icon={LuCheck} />
                        <StatCard value={8} label="Rechazados" accent="#ef4444" icon={LuX} />
                    </StatCardGroup>
                </ExampleCard>
            </div>
        </div>
    )
}
