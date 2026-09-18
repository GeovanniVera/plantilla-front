import { client } from '@lib/api/client';
import type { ApiResponse, User } from '@lib/api/types/api-response';

export interface UpdateProfileData {
  name?: string;
  photo?: File;
}

export const profileService = {
  /**
   * Actualiza el perfil del usuario autenticado.
   * Acepta multipart: name, photo (opcional).
   *
   * El email no se envía: el backend solo admite `name` y `photo` y documenta
   * que el cambio de email NO está habilitado, así que el frontend lo trata
   * como no editable.
   */
  updateMe: (data: UpdateProfileData): Promise<ApiResponse<User>> => {
    const form = new FormData();
    if (data.name) form.append('name', data.name);
    if (data.photo) form.append('photo', data.photo);

    return client.put<User>('/auth/me', form);
  },
};
