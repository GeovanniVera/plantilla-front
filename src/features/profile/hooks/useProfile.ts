import { useMutation, useQueryClient } from '@tanstack/react-query';
import { profileService, type UpdateProfileData } from '../services/profile.service';

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileData) => profileService.updateMe(data),
    onSuccess: () => {
      // Refrescar los datos del usuario autenticado
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
}
