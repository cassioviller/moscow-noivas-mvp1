import { describe, expect, it } from 'vitest';
import { validateAvailability } from '../src/modules/availability/availability.service.js';

const emptyDb = {
  query: async (sql: string) => {
    if (sql.includes('SELECT motivo FROM loja_bloqueios')) return { rowCount: 0, rows: [] };
    if (sql.includes('SELECT nome, capacidade, ativo FROM salas_prova')) return { rowCount: 1, rows: [{ nome: 'Cabine 1', capacidade: 1, ativo: true }] };
    if (sql.includes('count(*)::text AS total')) return { rowCount: 1, rows: [{ total: '0' }] };
    if (sql.includes('SELECT nome, ativo, is_atendente FROM funcionarios')) return { rowCount: 1, rows: [{ nome: 'Maria', ativo: true, is_atendente: true }] };
    if (sql.includes('SELECT id FROM atendente_horarios')) return { rowCount: 1, rows: [{ id: '44444444-4444-4444-8444-444444444444' }] };
    if (sql.includes('SELECT motivo FROM atendente_bloqueios')) return { rowCount: 0, rows: [] };
    if (sql.includes('SELECT nome, status_geral FROM produtos')) return { rowCount: 1, rows: [{ nome: 'Vestido 102', status_geral: 'disponivel' }] };
    if (sql.includes('SELECT id FROM reservas_estoque')) return { rowCount: 0, rows: [] };
    return { rowCount: 0, rows: [] };
  }
} as any;

describe('validateAvailability', () => {
  it('rejects invalid periods', async () => {
    const result = await validateAvailability({
      inicio_at: '2026-06-10T15:00:00.000Z',
      fim_at: '2026-06-10T14:00:00.000Z',
      produto_ids: []
    }, emptyDb);

    expect(result.disponivel).toBe(false);
    expect(result.conflitos[0].campo).toBe('periodo');
  });

  it('returns available when no conflict is found', async () => {
    const result = await validateAvailability({
      inicio_at: '2026-06-10T14:00:00.000Z',
      fim_at: '2026-06-10T15:00:00.000Z',
      sala_prova_id: '11111111-1111-4111-8111-111111111111',
      atendente_id: '22222222-2222-4222-8222-222222222222',
      produto_ids: ['33333333-3333-4333-8333-333333333333']
    }, emptyDb);

    expect(result.disponivel).toBe(true);
    expect(result.conflitos).toEqual([]);
  });
});
