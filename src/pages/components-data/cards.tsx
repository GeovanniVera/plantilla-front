import type { ReactNode } from 'react'
import Card from '../../components/ui/Card'

export interface Variant {
    name: string
    desc: string
    preview: ReactNode
    code?: string
}

export const cardVariants: Variant[] = [
    {
        name: 'Con título',
        desc: 'Tarjeta con header y contenido',
        preview: (
            <Card title="Card Title">
                <p style={{ margin: 0, fontSize: 14, color: 'var(--text)' }}>
                    Contenido de ejemplo dentro de una tarjeta reutilizable.
                </p>
            </Card>
        ),
        code: `<Card title="Card Title">
  <p>Contenido de ejemplo</p>
</Card>`,
    },
    {
        name: 'Sin título',
        desc: 'Tarjeta solo con contenido',
        preview: (
            <Card>
                <p style={{ margin: 0, fontSize: 14, color: 'var(--text)' }}>
                    Tarjeta sin header, ideal para contenido flexible.
                </p>
            </Card>
        ),
        code: `<Card>
  <p>Contenido flexible</p>
</Card>`,
    },
]
