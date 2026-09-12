import { client } from '../client'
import type { ApiResponse } from '../types/api-response'

/**
 * Template for API services.
 * Copy this file and replace with real endpoints.
 */
export const templateService = {
  getAll: <T>(): Promise<ApiResponse<T[]>> => client.get<T[]>('/resource'),
  getById: <T>(id: string): Promise<ApiResponse<T>> => client.get<T>(`/resource/${id}`),
  create: <T>(data: unknown): Promise<ApiResponse<T>> => client.post<T>('/resource', data),
  update: <T>(id: string, data: unknown): Promise<ApiResponse<T>> => client.put<T>(`/resource/${id}`, data),
  delete: <T>(id: string): Promise<ApiResponse<T>> => client.delete<T>(`/resource/${id}`),
}
