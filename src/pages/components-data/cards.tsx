import type { ReactNode } from 'react'
import Card from '@components/layout/Card'

export interface Variant {
    name: string
    desc: string
    preview: ReactNode
    code?: string
}

export const cardVariants: Variant[] = [
    {
        name: 'Con título',
        desc: 'Tarjeta con header y contenido básico',
        preview: (
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
        code: `<Card>
  <Card.Header>
    <Card.Title>Card Title</Card.Title>
  </Card.Header>
  <Card.Body>
    <p>Contenido de ejemplo</p>
  </Card.Body>
</Card>`,
    },
    {
        name: 'Sin título',
        desc: 'Tarjeta solo con contenido flexible',
        preview: (
            <Card>
                <Card.Body>
                    <p style={{ margin: 0, fontSize: 14, color: 'var(--text)' }}>
                        Tarjeta sin header, ideal para contenido flexible.
                    </p>
                </Card.Body>
            </Card>
        ),
        code: `<Card>
  <Card.Body>
    <p>Contenido flexible</p>
  </Card.Body>
</Card>`,
    },
]
