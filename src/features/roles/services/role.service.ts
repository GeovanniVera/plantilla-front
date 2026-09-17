import { client } from '@lib/api/client';
import type { ApiResponse } from '@lib/api/types/api-response';

export interface Permission {
  id: string;
  name: string;
  description: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
}

export interface CreateRoleData {
  name: string;
  description?: string;
  permissionIds?: string[];
}

export interface UpdateRoleData {
  name?: string;
  description?: string;
  permissionIds?: string[];
}

export const roleService = {
  list: (): Promise<ApiResponse<Role[]>> => client.get<Role[]>('/admin/roles'),

  get: (id: string): Promise<ApiResponse<Role>> => client.get<Role>(`/admin/roles/${id}`),

  create: (data: CreateRoleData): Promise<ApiResponse<Role>> =>
    client.post<Role>('/admin/roles', data),

  update: (id: string, data: UpdateRoleData): Promise<ApiResponse<Role>> =>
    client.put<Role>(`/admin/roles/${id}`, data),

  delete: (id: string): Promise<ApiResponse<void>> => client.delete<void>(`/admin/roles/${id}`),

  listPermissions: (): Promise<ApiResponse<Permission[]>> =>
    client.get<Permission[]>('/admin/permissions'),

  assignRolesToUser: (userId: string, roleIds: string[]): Promise<ApiResponse<unknown>> =>
    client.post<unknown>(`/admin/users/${userId}/roles`, { roleIds }),

  removeRoleFromUser: (userId: string, roleId: string): Promise<ApiResponse<unknown>> =>
    client.delete<unknown>(`/admin/users/${userId}/roles/${roleId}`),
};
