import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '../../../lib/i18n/config';
import AuditActivityItem from './AuditActivityItem';
import type { AuditLog } from '../services/audit.service';

const ACTOR = 'b856c14d-0000-4000-8000-000000000001';
const TARGET = 'test-unverified-01';

function makeLog(overrides: Partial<AuditLog> = {}): AuditLog {
  return {
    id: 'log-1',
    action: 'ACCOUNT_SUSPENDED',
    createdAt: '2026-09-21T12:00:00Z',
    ...overrides,
  };
}

describe('AuditActivityItem — título según la relación actor/entidad', () => {
  it('REGRESIÓN: muestra el wording del actor cuando suspendió a otra cuenta', () => {
    render(<AuditActivityItem log={makeLog({ actorId: ACTOR, entityId: TARGET })} />);

    expect(screen.getByText('Suspendiste una cuenta')).toBeInTheDocument();
    expect(screen.queryByText('Tu cuenta fue suspendida')).not.toBeInTheDocument();
  });

  it('muestra el wording propio cuando el actor es la entidad afectada', () => {
    render(<AuditActivityItem log={makeLog({ actorId: ACTOR, entityId: ACTOR })} />);

    expect(screen.getByText('Tu cuenta fue suspendida')).toBeInTheDocument();
    expect(screen.queryByText('Suspendiste una cuenta')).not.toBeInTheDocument();
  });
});
