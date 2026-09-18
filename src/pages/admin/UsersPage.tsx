import { useState } from 'react';
import { UserTable } from '../../features/users/components/UserTable';
import { UserRolesDrawer } from '../../features/users/components/UserRolesDrawer';
import { useUsers, useSuspendUser, useReactivateUser } from '../../features/users/hooks/useUsers';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { useToast } from '@components/feedback';
import type { AdminUser } from '../../features/users/services/user.service';

export default function UsersPage() {
  const toast = useToast();
  const [confirmAction, setConfirmAction] = useState<{
    type: 'suspend' | 'reactivate';
    user: AdminUser;
  } | null>(null);
  const [rolesUser, setRolesUser] = useState<AdminUser | null>(null);

  const { data, isLoading } = useUsers();
  const users = (data?.content ?? []).map((u) => ({
    ...u,
    status: u.suspended ? 'Suspendido' : u.isVerified ? 'Activo' : 'Sin verificar',
  }));
  const suspendUser = useSuspendUser();
  const reactivateUser = useReactivateUser();

  const handleConfirm = async () => {
    if (!confirmAction) return;

    try {
      switch (confirmAction.type) {
        case 'suspend':
          await suspendUser.mutateAsync(confirmAction.user.id);
          toast.success(`Usuario ${confirmAction.user.name} suspendido`);
          break;
        case 'reactivate':
          await reactivateUser.mutateAsync(confirmAction.user.id);
          toast.success(`Usuario ${confirmAction.user.name} reactivado`);
          break;
      }
    } catch {
      toast.error('Error al realizar la operación');
    }

    setConfirmAction(null);
  };

  const getConfirmConfig = () => {
    if (!confirmAction) return null;

    const { type, user } = confirmAction;

    switch (type) {
      case 'suspend':
        return {
          title: 'Suspender usuario',
          message: `¿Estás seguro de suspender a ${user.name}? El usuario no podrá acceder al sistema.`,
          confirmLabel: 'Suspender',
          variant: 'warning' as const,
        };
      case 'reactivate':
        return {
          title: 'Reactivar usuario',
          message: `¿Reactivar la cuenta de ${user.name}? El usuario podrá acceder nuevamente.`,
          confirmLabel: 'Reactivar',
          variant: 'default' as const,
        };
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-fg-muted">Cargando usuarios...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1440, width: '100%', margin: '0 auto' }}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-fg text-lg font-semibold">Usuarios</h2>
            <p className="text-fg-muted text-sm">{data?.totalElements ?? 0} usuarios registrados</p>
          </div>
        </div>

        <UserTable
          users={users}
          onSuspend={(user) => setConfirmAction({ type: 'suspend', user })}
          onReactivate={(user) => setConfirmAction({ type: 'reactivate', user })}
          onRowClick={(user) => setRolesUser(user)}
        />
      </div>

      <UserRolesDrawer isOpen={!!rolesUser} onClose={() => setRolesUser(null)} user={rolesUser} />

      {confirmAction && (
        <ConfirmDialog
          isOpen={!!confirmAction}
          onClose={() => setConfirmAction(null)}
          onConfirm={handleConfirm}
          title={getConfirmConfig()!.title}
          message={getConfirmConfig()!.message}
          confirmLabel={getConfirmConfig()!.confirmLabel}
          variant={getConfirmConfig()!.variant}
        />
      )}
    </div>
  );
}
