import type { ReactNode } from 'react'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'

export interface Variant {
    name: string
    desc: string
    preview: ReactNode
    code?: string
}

export const buttonVariants: Variant[] = [
    {
        name: 'Variantes',
        desc: 'Primary, secondary y ghost',
        preview: (
            <>
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
            </>
        ),
        code: `<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>`,
    },
    {
        name: 'Tamaños',
        desc: 'Small, medium y large',
        preview: (
            <>
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
            </>
        ),
        code: `<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>`,
    },
    {
        name: 'Badge',
        desc: 'Etiquetas con variantes de color',
        preview: (
            <>
                <Badge>Default</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="info">Info</Badge>
            </>
        ),
        code: `<Badge>Default</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="info">Info</Badge>`,
    },
]
