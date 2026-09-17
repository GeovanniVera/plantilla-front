import { client } from '@lib/api/client';
import type { ApiResponse, User } from '@lib/api/types/api-response';

export interface UpdateProfileData {
  name?: string;
  email?: string;
  photo?: File;
}

export const profileService = {
  /**
   * Actualiza el perfil del usuario autenticado.
   * Acepta multipart: name, email, photo (opcional).
   */
  updateMe: (data: UpdateProfileData): Promise<ApiResponse<User>> => {
    const form = new FormData();
    if (data.name) form.append('name', data.name);
    if (data.email) form.append('email', data.email);
    if (data.photo) form.append('photo', data.photo);

    return client.put<User>('/auth/me', form);
  },
};
