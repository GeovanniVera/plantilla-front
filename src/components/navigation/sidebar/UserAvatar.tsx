import { useState } from 'react';
import { useSidebar } from './context';
import { useAuthenticatedImage } from '@hooks/useAuthenticatedImage';

interface UserAvatarProps {
  /** Nombre o alias del usuario (corto) */
  name: string;
  /** Rol del usuario */
  role?: string;
  /** URL de la foto de perfil (opcional) */
  photoUrl?: string;
}

function getInitial(name: string) {
  return name.charAt(0).toUpperCase();
}

/* Collapsed: vertical card with centered initial. Expanded: horizontal
 * row revealing name/role. Info visibility uses ONE effective class set
 * per state: applying `hidden` + `flex` together regresses, because TW
 * emits `.hidden` after `.flex` in the stylesheet (6F.1 hotfix). */
const CARD_BASE_CLASSES =
  'flex flex-col items-center justify-center w-full px-3 py-3.5 rounded-lg bg-surface border border-border-base mb-4 transition-[flex-direction,gap] duration-200';
const CARD_EXPANDED_CLASSES = 'flex-row items-center gap-3';

const AVATAR_CLASSES =
  'size-10 rounded-full bg-accent text-white font-bold text-[15px] flex items-center justify-center shrink-0';

const AVATAR_IMG_CLASSES = 'size-10 rounded-full object-cover shrink-0';

const INFO_COLLAPSED_CLASSES = 'hidden flex-col items-center whitespace-nowrap';
const INFO_EXPANDED_CLASSES = 'flex flex-col items-start whitespace-nowrap';

const NAME_CLASSES =
  'text-[13px] font-semibold text-heading leading-[1.3] overflow-hidden text-ellipsis max-w-[140px]';
const ROLE_CLASSES = 'text-[11px] font-medium text-secondary leading-[1.3] flex items-center gap-1';

export default function UserAvatar({ name, role, photoUrl }: UserAvatarProps) {
  const { expanded } = useSidebar();
  const [imgError, setImgError] = useState(false);
  // La foto requiere sesión: se descarga autenticada y se expone como object URL.
  const resolvedPhotoUrl = useAuthenticatedImage(photoUrl);

  return (
    <div className={`${CARD_BASE_CLASSES} ${expanded ? CARD_EXPANDED_CLASSES : ''}`}>
      {resolvedPhotoUrl && !imgError ? (
        <img
          src={resolvedPhotoUrl}
          alt={name}
          className={AVATAR_IMG_CLASSES}
          onError={() => setImgError(true)}
        />
      ) : (
        <div className={AVATAR_CLASSES}>{getInitial(name)}</div>
      )}
      <div className={expanded ? INFO_EXPANDED_CLASSES : INFO_COLLAPSED_CLASSES}>
        <span className={NAME_CLASSES}>{name}</span>
        {role && <span className={ROLE_CLASSES}>{role}</span>}
      </div>
    </div>
  );
}
