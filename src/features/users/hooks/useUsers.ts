import { keepPreviousData, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService, type UserListFilters } from '../services/user.service';

export interface UseUsersParams extends UserListFilters {
  page?: number;
  size?: number;
}

/**
 * Listado administrativo de usuarios paginado en servidor.
 *
 * La queryKey incluye cada criterio para cachear por combinación.
 * `keepPreviousData` mantiene la página anterior visible mientras llega la
 * nueva, evitando el parpadeo a vacío al paginar o filtrar.
 */
export function useUsers({
  page = 0,
  size = 10,
  sort,
  direction,
  status,
  search,
}: UseUsersParams = {}) {
  return useQuery({
    queryKey: ['admin', 'users', { page, size, sort, direction, status, search }],
    queryFn: async () => {
      const response = await userService.list(page, size, { sort, direction, status, search });
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Error al listar usuarios');
      }
      return response.data;
    },
    placeholderData: keepPreviousData,
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ['admin', 'users', id],
    queryFn: async () => {
      const response = await userService.get(id);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Error al obtener usuario');
      }
      return response.data;
    },
    enabled: !!id,
  });
}

export function useSuspendUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userService.suspend(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

export function useReactivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userService.reactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}
