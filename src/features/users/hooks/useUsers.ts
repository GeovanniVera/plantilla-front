import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/user.service';

export function useUsers(page = 0, size = 10) {
  return useQuery({
    queryKey: ['admin', 'users', page, size],
    queryFn: async () => {
      const response = await userService.list(page, size);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Error al listar usuarios');
      }
      return response.data;
    },
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
