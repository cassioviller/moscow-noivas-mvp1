import { pool, withTransaction } from '../../config/db.js';

export async function listOutbox() {
  const result = await pool.query('SELECT * FROM eventos_outbox ORDER BY criado_em DESC LIMIT 300');
  return result.rows;
}

export async function processOutboxBatch(limit = 25) {
  return withTransaction(async (client) => {
    const events = await client.query(
      `
      SELECT * FROM eventos_outbox
      WHERE status IN ('pendente', 'falhou')
        AND (proxima_tentativa_em IS NULL OR proxima_tentativa_em <= now())
      ORDER BY criado_em
      LIMIT $1
      FOR UPDATE SKIP LOCKED
      `,
      [limit]
    );

    for (const event of events.rows) {
      await client.query("UPDATE eventos_outbox SET status = 'processando', locked_at = now(), tentativas = tentativas + 1 WHERE id = $1", [event.id]);
      await client.query(
        `
        INSERT INTO webhooks_logs (evento_outbox_id, status, request_payload_json, tentativa, processado_em)
        VALUES ($1, 'mvp1_sem_envio', $2, $3, now())
        `,
        [event.id, event.payload_json, event.tentativas + 1]
      );
      await client.query("UPDATE eventos_outbox SET status = 'processado', processado_em = now() WHERE id = $1", [event.id]);
    }

    return { processados: events.rowCount };
  });
}
