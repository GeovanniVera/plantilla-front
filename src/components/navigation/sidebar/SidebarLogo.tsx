import { Link } from 'react-router'
import { useSidebar } from './context'

interface SidebarLogoProps {
    src: string
    name: string
}

const LOGO_BASE_CLASSES =
    'flex items-center justify-center w-full px-3 py-2.5 mb-4 rounded-lg border border-border-base transition-[justify-content,background-color,border-color] duration-200 ease-in-out no-underline hover:bg-accent-subtle hover:border-accent-line'
const LOGO_EXPANDED_CLASSES = 'justify-start'

const IMG_CLASSES = 'size-9 rounded-md object-contain shrink-0'

/* Name reveal: opacity faster than max-width/margin, matching the
 * original per-property durations. */
const NAME_BASE_CLASSES =
    'font-sans text-xs font-semibold text-foreground opacity-0 max-w-0 overflow-hidden ml-0 no-underline leading-[1.3] transition-[opacity,max-width,margin] [transition-duration:200ms,300ms,300ms]'
const NAME_VISIBLE_CLASSES = 'opacity-100 max-w-[160px] ml-2.5'

export default function SidebarLogo({ src, name }: SidebarLogoProps) {
    const { expanded } = useSidebar()

    return (
        <Link to="/" className={`${LOGO_BASE_CLASSES} ${expanded ? LOGO_EXPANDED_CLASSES : ''}`}>
            <img src={src} alt={name} className={IMG_CLASSES} />
            <span className={`${NAME_BASE_CLASSES} ${expanded ? NAME_VISIBLE_CLASSES : ''}`}>
                {name}
            </span>
        </Link>
    )
}
