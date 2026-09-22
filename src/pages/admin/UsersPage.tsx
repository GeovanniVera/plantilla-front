import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LuArrowDown, LuArrowUp, LuSearch } from 'react-icons/lu';
import { UserTable } from '../../features/users/components/UserTable';
import { UserRolesDrawer } from '../../features/users/components/UserRolesDrawer';
import { useUsers, useSuspendUser, useReactivateUser } from '../../features/users/hooks/useUsers';
import { ConfirmDialog } from '@components/overlays/ConfirmDialog';
import { useToast } from '@components/feedback';
import Select from '@components/primitives/Select';
import Input from '@components/primitives/Input';
import Button from '@components/primitives/Button';
import Pagination from '@components/data-display/table/parts/Pagination';
import { useDebouncedValue } from '@hooks/useDebouncedValue';
import type {
  AdminUser,
  SortDirection,
  UserSortField,
  UserStatusFilter,
} from '../../features/users/services/user.service';

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_SORT_FIELD: UserSortField = 'createdAt';
const DEFAULT_SORT_DIRECTION: SortDirection = 'desc';
const SEARCH_DEBOUNCE_MS = 300;

export default function UsersPage() {
  const { t } = useTranslation();
  const toast = useToast();

  const [confirmAction, setConfirmAction] = useState<{
    type: 'suspend' | 'reactivate';
    user: AdminUser;
  } | null>(null);
  const [rolesUser, setRolesUser] = useState<AdminUser | null>(null);

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(DEFAULT_PAGE_SIZE);
  const [status, setStatus] = useState<UserStatusFilter | ''>('');
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebouncedValue(searchInput, SEARCH_DEBOUNCE_MS);
  const [sortField, setSortField] = useState<UserSortField>(DEFAULT_SORT_FIELD);
  const [sortDirection, setSortDirection] = useState<SortDirection>(DEFAULT_SORT_DIRECTION);

  // Cualquier cambio de criterio vuelve a la primera página: la página actual
  // deja de ser válida cuando cambia el conjunto de resultados.
  useEffect(() => {
    setPage(0);
  }, [debouncedSearch, status, size, sortField, sortDirection]);

  const { data, isLoading, isFetching } = useUsers({
    page,
    size,
    sort: sortField,
    direction: sortDirection,
    status: status || undefined,
    search: debouncedSearch.trim() || undefined,
  });

  const users = (data?.content ?? []).map((u) => ({
    ...u,
    status: u.suspended ? 'Suspendido' : u.isVerified ? 'Activo' : 'Sin verificar',
  }));

  const suspendUser = useSuspendUser();
  const reactivateUser = useReactivateUser();

  const statusOptions = [
    { value: '', label: t('admin.users.status.all') },
    { value: 'ACTIVE', label: t('admin.users.status.active') },
    { value: 'SUSPENDED', label: t('admin.users.status.suspended') },
    { value: 'UNVERIFIED', label: t('admin.users.status.unverified') },
  ];

  const sortOptions = [
    { value: 'createdAt', label: t('admin.users.sort.createdAt') },
    { value: 'name', label: t('admin.users.sort.name') },
    { value: 'email', label: t('admin.users.sort.email') },
  ];

  const handleConfirm = async () => {
    if (!confirmAction) return;

    try {
      switch (confirmAction.type) {
        case 'suspend':
          await suspendUser.mutateAsync(confirmAction.user.id);
          toast.success(t('admin.users.toast.suspended', { name: confirmAction.user.name }));
          break;
        case 'reactivate':
          await reactivateUser.mutateAsync(confirmAction.user.id);
          toast.success(t('admin.users.toast.reactivated', { name: confirmAction.user.name }));
          break;
      }
    } catch {
      toast.error(t('admin.users.toast.error'));
    }

    setConfirmAction(null);
  };

  const getConfirmConfig = () => {
    if (!confirmAction) return null;

    const { type, user } = confirmAction;

    switch (type) {
      case 'suspend':
        return {
          title: t('admin.users.confirm.suspendTitle'),
          message: t('admin.users.confirm.suspendMessage', { name: user.name }),
          confirmLabel: t('admin.users.confirm.suspendLabel'),
          variant: 'warning' as const,
        };
      case 'reactivate':
        return {
          title: t('admin.users.confirm.reactivateTitle'),
          message: t('admin.users.confirm.reactivateMessage', { name: user.name }),
          confirmLabel: t('admin.users.confirm.reactivateLabel'),
          variant: 'default' as const,
        };
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-fg-muted">{t('admin.users.loading')}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1440, width: '100%', margin: '0 auto' }}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-fg text-lg font-semibold">{t('admin.users.title')}</h2>
            <p className="text-fg-muted text-sm">
              {t('admin.users.count', { total: data?.totalElements ?? 0 })}
            </p>
          </div>
          {isFetching && (
            <span className="text-fg-muted text-xs">{t('admin.users.refreshing')}</span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Input
            value={searchInput}
            onChange={setSearchInput}
            placeholder={t('admin.users.searchPlaceholder')}
            aria-label={t('admin.users.searchLabel')}
            size="sm"
            className="w-full sm:w-64"
            startAdornment={<LuSearch size={16} />}
            startAdornmentVariant="accent"
          />
          <Select
            value={status}
            onChange={(value) => setStatus(value as UserStatusFilter | '')}
            options={statusOptions}
            aria-label={t('admin.users.statusLabel')}
            size="sm"
            className="w-full sm:w-48"
          />
          <Select
            value={sortField}
            onChange={(value) => setSortField(value as UserSortField)}
            options={sortOptions}
            aria-label={t('admin.users.sortLabel')}
            size="sm"
            className="w-full sm:w-48"
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'))}
            title={t('admin.users.sort.toggle')}
            aria-label={t('admin.users.sort.toggle')}
          >
            {sortDirection === 'asc' ? <LuArrowUp size={16} /> : <LuArrowDown size={16} />}
            {t(sortDirection === 'asc' ? 'admin.users.sort.asc' : 'admin.users.sort.desc')}
          </Button>
        </div>

        <UserTable
          users={users}
          onSuspend={(user) => setConfirmAction({ type: 'suspend', user })}
          onReactivate={(user) => setConfirmAction({ type: 'reactivate', user })}
          onRowClick={(user) => setRolesUser(user)}
        />

        <Pagination
          currentPage={page + 1}
          totalPages={data?.totalPages ?? 1}
          onPageChange={(nextPage) => setPage(nextPage - 1)}
          totalItems={data?.totalElements}
          pageSize={size}
          onPageSizeChange={setSize}
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
