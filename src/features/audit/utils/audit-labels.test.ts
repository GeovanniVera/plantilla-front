import { describe, it, expect } from 'vitest';
import i18n from '../../../lib/i18n/config';
import { getActionFilterOptions, getActionLabel, getActionTitle } from './audit-labels';
import type { AuditLog } from '../services/audit.service';

const t = i18n.t;

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

describe('getActionTitle — título según la relación actor/entidad', () => {
  it('REGRESIÓN: ACCOUNT_SUSPENDED con actor ≠ entidad usa el wording del actor', () => {
    const log = makeLog({ action: 'ACCOUNT_SUSPENDED', actorId: ACTOR, entityId: TARGET });

    expect(getActionTitle(log, t)).toBe('Suspendiste una cuenta');
    expect(getActionTitle(log, t)).not.toBe('Tu cuenta fue suspendida');
  });

  it('ACCOUNT_SUSPENDED con actor === entidad usa el wording propio', () => {
    const log = makeLog({ action: 'ACCOUNT_SUSPENDED', actorId: ACTOR, entityId: ACTOR });

    expect(getActionTitle(log, t)).toBe('Tu cuenta fue suspendida');
  });

  it('ACCOUNT_REACTIVATED con actor ≠ entidad usa el wording del actor', () => {
    const log = makeLog({ action: 'ACCOUNT_REACTIVATED', actorId: ACTOR, entityId: TARGET });

    expect(getActionTitle(log, t)).toBe('Reactivaste una cuenta');
    expect(getActionTitle(log, t)).not.toBe('Tu cuenta fue reactivada');
  });

  it('ACCOUNT_REACTIVATED con actor === entidad usa el wording propio', () => {
    const log = makeLog({ action: 'ACCOUNT_REACTIVATED', actorId: ACTOR, entityId: ACTOR });

    expect(getActionTitle(log, t)).toBe('Tu cuenta fue reactivada');
  });

  it('ROLE_CHANGED con actor ≠ entidad usa el wording del actor', () => {
    const log = makeLog({ action: 'ROLE_CHANGED', actorId: ACTOR, entityId: TARGET });

    expect(getActionTitle(log, t)).toBe('Modificaste los roles de una cuenta');
    expect(getActionTitle(log, t)).not.toBe('Se modificaron tus roles');
  });

  it('ROLE_CHANGED con actor === entidad usa el wording propio', () => {
    const log = makeLog({ action: 'ROLE_CHANGED', actorId: ACTOR, entityId: ACTOR });

    expect(getActionTitle(log, t)).toBe('Se modificaron tus roles');
  });

  it('LOGIN_FAILED con actorId y entityId null (email desconocido) no lanza y usa el wording neutro', () => {
    const log = {
      ...makeLog({ action: 'LOGIN_FAILED' }),
      actorId: null,
      entityId: null,
    } as unknown as AuditLog;

    expect(() => getActionTitle(log, t)).not.toThrow();
    expect(getActionTitle(log, t)).toBe('Intento de inicio de sesión fallido');
  });

  it('LOGIN_FAILED con ids ausentes (undefined) también usa el wording neutro', () => {
    const log = makeLog({ action: 'LOGIN_FAILED', actorId: undefined, entityId: undefined });

    expect(getActionTitle(log, t)).toBe('Intento de inicio de sesión fallido');
  });

  it('una acción relacional sin entityId cae al wording propio (id ausente, no "otro")', () => {
    const log = makeLog({ action: 'ACCOUNT_SUSPENDED', actorId: ACTOR, entityId: undefined });

    expect(getActionTitle(log, t)).toBe('Tu cuenta fue suspendida');
  });

  it('acción desconocida devuelve el label genérico', () => {
    const log = makeLog({ action: 'SOMETHING_UNMAPPED', actorId: ACTOR, entityId: TARGET });

    expect(getActionTitle(log, t)).toBe('Evento de seguridad');
    expect(getActionLabel('SOMETHING_UNMAPPED').titleKey).toBe('audit.actions.unknown');
  });
});

describe('getActionFilterOptions — etiquetas neutras separadas de los títulos', () => {
  it('ACCOUNT_SUSPENDED expone una clave de filtro neutra, distinta del título del actor', () => {
    const suspended = getActionFilterOptions().find(
      (option) => option.value === 'ACCOUNT_SUSPENDED',
    );

    expect(suspended).toBeDefined();
    expect(t(suspended!.filterKey)).toBe('Suspensión de cuenta');
    expect(t(suspended!.filterKey)).not.toBe(t('audit.actions.ACCOUNT_SUSPENDED.title'));
    expect(t(suspended!.filterKey)).not.toBe(t('audit.actions.ACCOUNT_SUSPENDED.titleOther'));
  });

  it('todas las opciones son claves de filtro neutras (nunca títulos en perspectiva del actor)', () => {
    for (const option of getActionFilterOptions()) {
      expect(option.filterKey).toBe(`audit.actions.${option.value}.filter`);
      expect(t(option.filterKey).length).toBeGreaterThan(0);
    }
  });

  it('cada acción mapeada tiene las claves title y filter resueltas', () => {
    for (const option of getActionFilterOptions()) {
      const label = getActionLabel(option.value);
      expect(t(label.titleKey)).not.toBe('');
      expect(t(label.filterKey)).not.toBe('');
    }
  });
});
