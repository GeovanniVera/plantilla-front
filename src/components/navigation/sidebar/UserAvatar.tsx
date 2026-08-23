import { useSidebar } from './context'

interface UserAvatarProps {
    /** Nombre o alias del usuario (corto) */
    name: string
    /** Rol del usuario */
    role?: string
}

function getInitial(name: string) {
    return name.charAt(0).toUpperCase()
}

/* Collapsed: vertical card with centered initial. Expanded: horizontal
 * row revealing name/role. The unused .roleBadge legacy rule was dead
 * CSS and died with the module. */
const CARD_BASE_CLASSES =
    'flex flex-col items-center justify-center w-full px-3 py-3.5 rounded-lg bg-surface border border-border-base mb-4 transition-[flex-direction,gap] duration-200'
const CARD_EXPANDED_CLASSES = 'flex-row items-center gap-3'

const AVATAR_CLASSES = 'size-10 rounded-[10px] bg-accent text-white font-bold text-[15px] flex items-center justify-center shrink-0'

const INFO_BASE_CLASSES = 'hidden flex-col items-center whitespace-nowrap'
const INFO_VISIBLE_CLASSES = 'flex items-start'

const NAME_CLASSES = 'text-[13px] font-semibold text-heading leading-[1.3] overflow-hidden text-ellipsis max-w-[140px]'
const ROLE_CLASSES = 'text-[11px] font-medium text-secondary leading-[1.3] flex items-center gap-1'

export default function UserAvatar({ name, role }: UserAvatarProps) {
    const { expanded } = useSidebar()

    return (
        <div className={`${CARD_BASE_CLASSES} ${expanded ? CARD_EXPANDED_CLASSES : ''}`}>
            <div className={AVATAR_CLASSES}>
                {getInitial(name)}
            </div>
            <div className={`${INFO_BASE_CLASSES} ${expanded ? INFO_VISIBLE_CLASSES : ''}`}>
                <span className={NAME_CLASSES}>{name}</span>
                {role && <span className={ROLE_CLASSES}>{role}</span>}
            </div>
        </div>
    )
}
