import { client } from '@lib/api/client';
import type { ApiResponse } from '@lib/api/types/api-response';

export interface AuditLog {
  id: string;
  requestId?: string;
  actorId?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface PaginatedAuditLogs {
  content: AuditLog[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface AuditFilters {
  action?: string;
  actorId?: string;
  entityType?: string;
  entityId?: string;
  from?: string;
  to?: string;
}

export const auditService = {
  list: (page = 0, size = 10, filters?: AuditFilters): Promise<ApiResponse<PaginatedAuditLogs>> => {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    if (filters?.action) params.set('action', filters.action);
    if (filters?.actorId) params.set('actorId', filters.actorId);
    if (filters?.entityType) params.set('entityType', filters.entityType);
    if (filters?.entityId) params.set('entityId', filters.entityId);
    if (filters?.from) params.set('from', filters.from);
    if (filters?.to) params.set('to', filters.to);

    const qs = params.toString();
    return client.get<PaginatedAuditLogs>(`/admin/audit-logs${qs ? `?${qs}` : ''}`);
  },
};
