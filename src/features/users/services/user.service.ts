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

/** Tri-estado que el frontend deriva por fila (ver UserStatusBadge). */
export type UserStatusFilter = 'SUSPENDED' | 'ACTIVE' | 'UNVERIFIED';

/** Campos por los que el backend permite ordenar (allowlist). */
export type UserSortField = 'name' | 'email' | 'createdAt';

export type SortDirection = 'asc' | 'desc';

export interface UserListFilters {
  status?: UserStatusFilter;
  /** Búsqueda parcial case-insensitive por email o nombre. */
  search?: string;
  sort?: UserSortField;
  direction?: SortDirection;
}

export interface PaginatedUsers {
  content: AdminUser[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export const userService = {
  list: (page = 0, size = 10, filters?: UserListFilters): Promise<ApiResponse<PaginatedUsers>> => {
    const params = new URLSearchParams({ page: String(page), size: String(size) });

    // Spring espera `sort=field,dir`; sin `sort` el backend aplica createdAt,desc.
    if (filters?.sort) {
      params.set('sort', `${filters.sort},${filters.direction ?? 'asc'}`);
    }
    if (filters?.status) {
      params.set('status', filters.status);
    }
    const search = filters?.search?.trim();
    if (search) {
      params.set('search', search);
    }

    return client.get<PaginatedUsers>(`/admin/users?${params.toString()}`);
  },

  get: (id: string): Promise<ApiResponse<AdminUser>> => client.get<AdminUser>(`/admin/users/${id}`),

  suspend: (id: string): Promise<ApiResponse<AdminUser>> =>
    client.post<AdminUser>(`/admin/users/${id}/suspend`),

  reactivate: (id: string): Promise<ApiResponse<AdminUser>> =>
    client.post<AdminUser>(`/admin/users/${id}/reactivate`),
};
