import type { Meta, StoryObj } from '@storybook/react-vite'
import Card from './Card'

const meta: Meta<typeof Card> = {
    title: 'Layout/Card',
    component: Card,
    tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Card>

export const WithTitle: Story = {
    render: () => (
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
    ),
}

export const WithDescription: Story = {
    render: () => (
        <Card>
            <Card.Header>
                <Card.Title>Proyecto Alpha</Card.Title>
                <Card.Description>Una aplicación web moderna con React y TypeScript.</Card.Description>
            </Card.Header>
            <Card.Body>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--text)' }}>
                    Versión 2.1.0 • Última actualización hace 3 días
                </p>
            </Card.Body>
        </Card>
    ),
}

export const WithImage: Story = {
    render: () => (
        <Card>
            <Card.Image src="https://picsum.photos/seed/mountain/400/225" alt="Montañas" />
            <Card.Header>
                <Card.Title>Paisaje Mountain</Card.Title>
                <Card.Description>Vista de las montañas al atardecer.</Card.Description>
            </Card.Header>
            <Card.Body>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--text)' }}>
                    Fotografía capturada en los Andes.
                </p>
            </Card.Body>
        </Card>
    ),
}

export const WithFooter: Story = {
    render: () => (
        <Card>
            <Card.Header>
                <Card.Title>Nuevo Reporte</Card.Title>
                <Card.Description>El reporte mensual está listo.</Card.Description>
            </Card.Header>
            <Card.Body>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--text)' }}>
                    12 páginas • Generado automáticamente.
                </p>
            </Card.Body>
            <Card.Footer>
                <button style={{
                    padding: '6px 14px', borderRadius: 6, border: 'none',
                    background: 'var(--accent)', color: '#fff', fontSize: 13,
                    fontWeight: 500, cursor: 'pointer',
                }}>Ver reporte</button>
                <button style={{
                    padding: '6px 14px', borderRadius: 6,
                    border: '1px solid var(--border)', background: 'transparent',
                    color: 'var(--text)', fontSize: 13, cursor: 'pointer',
                }}>Descargar</button>
            </Card.Footer>
        </Card>
    ),
}

export const Outlined: Story = {
    render: () => (
        <Card variant="outlined">
            <Card.Header>
                <Card.Title>Borde destacado</Card.Title>
                <Card.Description>Estilo outlined para énfasis visual.</Card.Description>
            </Card.Header>
            <Card.Body>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--text)' }}>
                    Sin fondo, solo borde grueso.
                </p>
            </Card.Body>
        </Card>
    ),
}

export const Elevated: Story = {
    render: () => (
        <Card variant="elevated">
            <Card.Header>
                <Card.Title>Card elevada</Card.Title>
                <Card.Description>Sombra permanente para mayor profundidad.</Card.Description>
            </Card.Header>
            <Card.Body>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--text)' }}>
                    Perfecta para modales o overlays.
                </p>
            </Card.Body>
        </Card>
    ),
}

export const Clickable: Story = {
    render: () => (
        <Card onClick={() => alert('¡Card clickeada!')}>
            <Card.Header>
                <Card.Title>Haz clic aquí</Card.Title>
                <Card.Description>Esta tarjeta es interactiva.</Card.Description>
            </Card.Header>
            <Card.Body>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--text)' }}>
                    Pasa el mouse y haz click para ver la acción.
                </p>
            </Card.Body>
        </Card>
    ),
}
