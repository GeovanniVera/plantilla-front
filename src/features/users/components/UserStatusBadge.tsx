import Badge from '@components/primitives/Badge';
import { LuCheck, LuShieldOff } from 'react-icons/lu';

interface UserStatusBadgeProps {
  suspended: boolean;
  isVerified: boolean;
}

export function UserStatusBadge({ suspended, isVerified }: UserStatusBadgeProps) {
  if (suspended) {
    return (
      <Badge variant="danger">
        <LuShieldOff size={12} />
        Suspendido
      </Badge>
    );
  }

  if (!isVerified) {
    return <Badge variant="warning">Sin verificar</Badge>;
  }

  return (
    <Badge variant="success">
      <LuCheck size={12} />
      Activo
    </Badge>
  );
}
