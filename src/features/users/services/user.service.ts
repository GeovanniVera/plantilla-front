import { client } from '@lib/api/client';
import type { ApiResponse } from '@lib/api/types/api-response';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  roles: string[];
  isVerified: boolean;
  suspended: boolean;
  createdAt: string;
}

export interface PaginatedUsers {
  content: AdminUser[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export const userService = {
  list: (page = 0, size = 10): Promise<ApiResponse<PaginatedUsers>> =>
    client.get<PaginatedUsers>(`/admin/users?page=${page}&size=${size}`),

  get: (id: string): Promise<ApiResponse<AdminUser>> => client.get<AdminUser>(`/admin/users/${id}`),

  suspend: (id: string): Promise<ApiResponse<AdminUser>> =>
    client.post<AdminUser>(`/admin/users/${id}/suspend`),

  reactivate: (id: string): Promise<ApiResponse<AdminUser>> =>
    client.post<AdminUser>(`/admin/users/${id}/reactivate`),
};
