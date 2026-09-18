import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roleService, type CreateRoleData, type UpdateRoleData } from '../services/role.service';

/**
 * Opciones para las queries de administración.
 * Permiten gatear el fetch según el privilegio del usuario.
 *
 * La plantilla no tiene el `useProducts.ts` de la app (donde vivía este tipo),
 * así que se define localmente: sus únicos consumidores son estos hooks.
 */
export interface UseAdminQueryOptions {
  /** Si es false, la query no se ejecuta (no dispara peticiones). Default: true */
  enabled?: boolean;
}

export function useRoles({ enabled = true }: UseAdminQueryOptions = {}) {
  return useQuery({
    queryKey: ['admin', 'roles'],
    queryFn: async () => {
      const response = await roleService.list();
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Error al listar roles');
      }
      return response.data;
    },
    enabled,
  });
}

export function usePermissions({ enabled = true }: UseAdminQueryOptions = {}) {
  return useQuery({
    queryKey: ['admin', 'permissions'],
    queryFn: async () => {
      const response = await roleService.listPermissions();
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Error al listar permisos');
      }
      return response.data;
    },
    enabled,
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRoleData) => roleService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'roles'] });
    },
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRoleData }) =>
      roleService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'roles'] });
    },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => roleService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'roles'] });
    },
  });
}

export function useAssignRolesToUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, roleIds }: { userId: string; roleIds: string[] }) =>
      roleService.assignRolesToUser(userId, roleIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

export function useRemoveRoleFromUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) =>
      roleService.removeRoleFromUser(userId, roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}
