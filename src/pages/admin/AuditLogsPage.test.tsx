import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import '../../lib/i18n/config';
import AuditLogsPage from './AuditLogsPage';
import { server } from '../../test/mocks/server';

// jsdom no implementa matchMedia y ResponsiveTable lo consulta vía useMediaQuery.
if (!window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

interface TestLog {
  id: string;
  action: string;
  actorId?: string;
  entityType?: string;
  entityId?: string;
  ipAddress?: string;
  createdAt: string;
}

type AuditRequest = {
  page: number;
  size: number;
  action?: string;
  actorId?: string;
  entityType?: string;
  entityId?: string;
  sort?: string;
};
let auditRequests: AuditRequest[] = [];

// 25 eventos → size 10 da 3 páginas. El primero es el evento "ancla" con una
// acción mapeada, para verificar la etiqueta neutra del badge.
const anchorLog: TestLog = {
  id: 'log-0',
  action: 'ACCOUNT_SUSPENDED',
  actorId: 'actor-1',
  entityType: 'USER',
  entityId: 'target-1',
  ipAddress: '10.0.0.1',
  createdAt: '2026-09-21T12:00:00Z',
};

const logs: TestLog[] = [
  anchorLog,
  ...Array.from({ length: 24 }, (_, i) => ({
    id: `log-${i + 1}`,
    action: i % 2 === 0 ? 'LOGIN_SUCCEEDED' : 'LOGIN_FAILED',
    actorId: i % 3 === 0 ? 'actor-2' : 'actor-1',
    entityType: 'USER',
    entityId: `target-${i + 2}`,
    ipAddress: '10.0.0.2',
    createdAt: `2026-09-${String((i % 28) + 1).padStart(2, '0')}T12:00:00Z`,
  })),
];

function applyFilters(source: TestLog[], filters: Partial<AuditRequest>): TestLog[] {
  let result = source;
  if (filters.action) result = result.filter((l) => l.action === filters.action);
  if (filters.actorId) result = result.filter((l) => l.actorId === filters.actorId);
  if (filters.entityType) result = result.filter((l) => l.entityType === filters.entityType);
  if (filters.entityId) result = result.filter((l) => l.entityId === filters.entityId);
  return result;
}

function auditResponse(source: TestLog[], page: number, size: number) {
  const start = page * size;
  return {
    success: true,
    message: 'ok',
    data: {
      content: source.slice(start, start + size),
      totalElements: source.length,
      totalPages: Math.max(1, Math.ceil(source.length / size)),
      number: page,
      size,
    },
  };
}

function mockAuditHandler(source: TestLog[]) {
  return http.get('*/admin/audit-logs', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? '0');
    const size = Number(url.searchParams.get('size') ?? '10');
    const parsed: AuditRequest = {
      page,
      size,
      action: url.searchParams.get('action') ?? undefined,
      actorId: url.searchParams.get('actorId') ?? undefined,
      entityType: url.searchParams.get('entityType') ?? undefined,
      entityId: url.searchParams.get('entityId') ?? undefined,
      sort: url.searchParams.get('sort') ?? undefined,
    };
    auditRequests.push(parsed);

    const filtered = applyFilters(source, parsed);
    return HttpResponse.json(auditResponse(filtered, page, size));
  });
}

beforeEach(() => {
  auditRequests = [];
  server.use(mockAuditHandler(logs));
});

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AuditLogsPage />
    </QueryClientProvider>,
  );
}

async function waitForFirstRequest() {
  await waitFor(() => expect(auditRequests.length).toBeGreaterThan(0));
}

describe('AuditLogsPage — paginación y filtros server-side', () => {
  it('la request inicial usa page 0, size 10 y NO envía sort', async () => {
    renderPage();
    await waitForFirstRequest();

    expect(auditRequests[0]).toMatchObject({ page: 0, size: 10 });
    expect(auditRequests[0].sort).toBeUndefined();
  });

  it('cambiar de página pide la página correcta', async () => {
    renderPage();
    await waitForFirstRequest();

    fireEvent.click(await screen.findByRole('button', { name: 'Página 2' }));

    await waitFor(() => {
      expect(auditRequests.some((r) => r.page === 1)).toBe(true);
    });
  });

  it('cambiar el filtro de acción envía action y vuelve a la página 0', async () => {
    renderPage();
    await waitForFirstRequest();

    fireEvent.click(await screen.findByRole('button', { name: 'Página 2' }));
    await waitFor(() => expect(auditRequests.some((r) => r.page === 1)).toBe(true));

    fireEvent.change(screen.getByLabelText('Filtrar por acción'), {
      target: { value: 'LOGIN_SUCCEEDED' },
    });

    await waitFor(() => {
      expect(auditRequests.some((r) => r.action === 'LOGIN_SUCCEEDED' && r.page === 0)).toBe(true);
    });
  });

  it('la búsqueda por actor se debouncea y envía actorId', async () => {
    renderPage();
    await waitForFirstRequest();

    const requestsBefore = auditRequests.length;
    fireEvent.change(screen.getByLabelText('Filtrar por actor'), {
      target: { value: 'actor-2' },
    });

    // Sin esperar el debounce no debe dispararse una request por la tecla.
    expect(auditRequests.length).toBe(requestsBefore);

    await waitFor(() => {
      expect(auditRequests.some((r) => r.actorId === 'actor-2')).toBe(true);
    });
  });

  it('el badge muestra la etiqueta neutra, no el enum crudo, para una acción conocida', async () => {
    renderPage();

    // El wrapper conserva el enum crudo como tooltip (diagnosticable)...
    const badge = await screen.findByTitle('ACCOUNT_SUSPENDED');
    // ...pero el texto visible es la etiqueta neutra del evento.
    expect(badge).toHaveTextContent('Suspensión de cuenta');
    expect(badge).not.toHaveTextContent('ACCOUNT_SUSPENDED');
  });

  it('una acción sin mapeo conserva el código crudo (diagnosticable)', async () => {
    auditRequests = [];
    server.use(
      mockAuditHandler([
        {
          id: 'log-x',
          action: 'SOMETHING_UNMAPPED',
          actorId: 'actor-1',
          createdAt: '2026-09-21T12:00:00Z',
        },
      ]),
    );

    renderPage();

    expect(await screen.findByText('SOMETHING_UNMAPPED')).toBeInTheDocument();
  });
});
