import { z } from 'zod';
import { pool, withTransaction } from '../../config/db.js';
import { validateAvailability } from '../availability/availability.service.js';
import { addAuditLog } from '../traceability/audit.service.js';

const rentalItemSchema = z.object({
  produto_id: z.string().uuid().optional().nullable(),
  tipo_item: z.enum(['vestido', 'veu', 'acessorio', 'servico', 'ajuste', 'outro']),
  descricao: z.string().optional().nullable(),
  quantidade: z.number().int().min(1).default(1),
  valor_unitario: z.number().min(0).default(0),
  valor_caucao_item: z.number().min(0).default(0)
});

export const rentalCreateSchema = z.object({
  cliente_id: z.string().uuid(),
  data_evento: z.string().date(),
  data_retirada_prevista: z.string().date().optional().nullable(),
  data_devolucao_prevista: z.string().date().optional().nullable(),
  valor_sinal: z.number().min(0).default(0),
  valor_caucao: z.number().min(0).default(0),
  quantidade_parcelas: z.number().int().min(0).default(1),
  contrato_assinado: z.boolean().default(false),
  contrato_assinado_em: z.string().datetime().optional().nullable(),
  contrato_arquivo_id: z.string().uuid().optional().nullable(),
  observacoes: z.string().optional().nullable(),
  itens: z.array(rentalItemSchema).min(1)
});

export const paymentSchema = z.object({
  conta_receber_id: z.string().uuid(),
  valor_pago: z.number().min(0.01),
  data_pagamento: z.string().datetime().optional(),
  forma_pagamento: z.string().min(2),
  comprovante_arquivo_id: z.string().uuid().optional().nullable(),
  observacoes: z.string().optional().nullable()
});

export const bailSchema = z.object({
  tipo_movimento: z.enum(['recebimento', 'devolucao', 'retencao', 'ajuste']),
  valor: z.number().min(0.01),
  forma_pagamento: z.string().optional().nullable(),
  chave_pix_devolucao: z.string().optional().nullable(),
  motivo: z.string().optional().nullable(),
  observacoes: z.string().optional().nullable()
});

export const contractSchema = z.object({
  contrato_assinado: z.boolean(),
  contrato_assinado_em: z.string().datetime().optional().nullable(),
  contrato_arquivo_id: z.string().uuid().optional().nullable(),
  observacoes: z.string().optional().nullable()
});

export const returnSchema = z.object({
  itens_devolvidos: z.boolean().default(true),
  precisa_lavanderia: z.boolean().default(false),
  possui_problema: z.boolean().default(false),
  observacoes: z.string().optional().nullable()
});

export const swapItemSchema = z.object({
  item_id: z.string().uuid(),
  novo_produto_id: z.string().uuid(),
  motivo: z.string().min(2)
});

async function getRuleBool(client: any, chave: string, fallback: boolean) {
  const result = await client.query('SELECT valor FROM regras_configuraveis WHERE chave = $1', [chave]);
  if (!result.rowCount) return fallback;
  return result.rows[0].valor === 'true';
}

function asStartOfDay(date?: string | null) {
  return date ? `${date}T00:00:00.000-03:00` : null;
}

function asEndOfDay(date?: string | null) {
  return date ? `${date}T23:59:59.000-03:00` : null;
}

export async function listRentals() {
  const result = await pool.query(`
    SELECT vl.*, c.nome AS cliente_nome,
      COALESCE(count(vli.id), 0)::integer AS total_itens
    FROM vendas_locacoes vl
    JOIN clientes c ON c.id = vl.cliente_id
    LEFT JOIN venda_locacao_itens vli ON vli.venda_locacao_id = vl.id AND vli.deleted_at IS NULL
    WHERE vl.deleted_at IS NULL
    GROUP BY vl.id, c.nome
    ORDER BY vl.criado_em DESC
  `);
  return result.rows;
}

export async function getRental(id: string) {
  const [rental, items, receivables, payments, bail, history] = await Promise.all([
    pool.query('SELECT vl.*, c.nome AS cliente_nome FROM vendas_locacoes vl JOIN clientes c ON c.id = vl.cliente_id WHERE vl.id = $1 AND vl.deleted_at IS NULL', [id]),
    pool.query(`
      SELECT i.*, p.nome AS produto_nome, p.codigo_interno, r.inicio_at AS reserva_inicio, r.fim_at AS reserva_fim, r.status AS reserva_status
      FROM venda_locacao_itens i
      LEFT JOIN produtos p ON p.id = i.produto_id
      LEFT JOIN reservas_estoque r ON r.id = i.reserva_estoque_id
      WHERE i.venda_locacao_id = $1 AND i.deleted_at IS NULL
      ORDER BY i.criado_em
    `, [id]),
    pool.query('SELECT * FROM contas_receber WHERE venda_locacao_id = $1 AND deleted_at IS NULL ORDER BY parcela_numero', [id]),
    pool.query('SELECT * FROM pagamentos_recebidos WHERE venda_locacao_id = $1 AND deleted_at IS NULL ORDER BY data_pagamento DESC', [id]),
    pool.query('SELECT * FROM caucao_movimentos WHERE venda_locacao_id = $1 AND deleted_at IS NULL ORDER BY data_movimento DESC', [id]),
    pool.query("SELECT * FROM historico_atendimentos WHERE entidade_tipo = 'locacao' AND entidade_id = $1 ORDER BY criado_em DESC", [id])
  ]);

  return {
    locacao: rental.rows[0],
    itens: items.rows,
    financeiro: receivables.rows,
    pagamentos: payments.rows,
    caucao: bail.rows,
    historico: history.rows
  };
}

export async function createRental(input: z.infer<typeof rentalCreateSchema>, usuarioId: string) {
  const data = rentalCreateSchema.parse(input);

  return withTransaction(async (client) => {
    const valorItens = data.itens.reduce((sum, item) => sum + item.quantidade * item.valor_unitario, 0);
    const valorCaucaoItens = data.itens.reduce((sum, item) => sum + item.valor_caucao_item, 0);
    const valorCaucao = data.valor_caucao || valorCaucaoItens;

    for (const item of data.itens) {
      if (!item.produto_id || item.tipo_item === 'servico' || item.tipo_item === 'ajuste') continue;
      const availability = await validateAvailability({
        inicio_at: asStartOfDay(data.data_retirada_prevista ?? data.data_evento)!,
        fim_at: asEndOfDay(data.data_devolucao_prevista ?? data.data_evento)!,
        produto_ids: [item.produto_id]
      }, client);
      if (!availability.disponivel) return { criado: false, conflitos: availability.conflitos };
    }

    const rental = await client.query<{ id: string }>(
      `
      INSERT INTO vendas_locacoes (
        cliente_id, status, valor_total, valor_sinal, valor_caucao, quantidade_parcelas,
        data_evento, data_retirada_prevista, data_devolucao_prevista, snapshot_regras_json,
        contrato_assinado, contrato_assinado_em, contrato_arquivo_id, observacoes
      )
      VALUES ($1,'fechada',$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      RETURNING id
      `,
      [
        data.cliente_id,
        valorItens,
        data.valor_sinal,
        valorCaucao,
        data.quantidade_parcelas,
        data.data_evento,
        data.data_retirada_prevista ?? null,
        data.data_devolucao_prevista ?? null,
        JSON.stringify({ prompt: '03', criado_em: new Date().toISOString() }),
        data.contrato_assinado,
        data.contrato_assinado_em ?? null,
        data.contrato_arquivo_id ?? null,
        data.observacoes ?? null
      ]
    );

    for (const item of data.itens) {
      const valorTotal = item.quantidade * item.valor_unitario;
      const itemRow = await client.query<{ id: string }>(
        `
        INSERT INTO venda_locacao_itens (
          venda_locacao_id, produto_id, tipo_item, descricao, quantidade, valor_unitario, valor_total, valor_caucao_item
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
        RETURNING id
        `,
        [rental.rows[0].id, item.produto_id ?? null, item.tipo_item, item.descricao ?? null, item.quantidade, item.valor_unitario, valorTotal, item.valor_caucao_item]
      );

      if (item.produto_id && !['servico', 'ajuste'].includes(item.tipo_item)) {
        const reserva = await client.query<{ id: string }>(
          `
          INSERT INTO reservas_estoque (
            produto_id, cliente_id, venda_locacao_id, venda_locacao_item_id, data_evento,
            inicio_at, fim_at, tipo_bloqueio, motivo_bloqueio, status
          )
          VALUES ($1,$2,$3,$4,$5,$6,$7,'locacao','Reserva criada ao fechar locação.','convertida')
          RETURNING id
          `,
          [
            item.produto_id,
            data.cliente_id,
            rental.rows[0].id,
            itemRow.rows[0].id,
            data.data_evento,
            asStartOfDay(data.data_retirada_prevista ?? data.data_evento),
            asEndOfDay(data.data_devolucao_prevista ?? data.data_evento)
          ]
        );
        await client.query('UPDATE venda_locacao_itens SET reserva_estoque_id = $2 WHERE id = $1', [itemRow.rows[0].id, reserva.rows[0].id]);
      }
    }

    await generateReceivables(client, rental.rows[0].id, data.cliente_id, valorItens, data.valor_sinal, data.quantidade_parcelas, data.data_evento, usuarioId);
    await addHistory(client, rental.rows[0].id, usuarioId, 'locacao_fechada', 'Locação criada com itens, reservas e parcelas.');
    await addOutbox(client, 'locacao_fechada', 'locacao', rental.rows[0].id, { valor_total: valorItens });

    return { criado: true, id: rental.rows[0].id, conflitos: [] };
  });
}

async function generateReceivables(client: any, vendaLocacaoId: string, clienteId: string, total: number, sinal: number, parcelas: number, dataEvento: string, usuarioId: string) {
  const sinalComoParcelaZero = await getRuleBool(client, 'locacao_sinal_como_parcela_zero', true);
  let remaining = total;

  if (sinal > 0 && sinalComoParcelaZero) {
    await insertReceivable(client, vendaLocacaoId, clienteId, 'sinal', 0, sinal, new Date().toISOString().slice(0, 10));
    remaining -= sinal;
  }

  const parcelaCount = Math.max(parcelas, 1);
  const parcelaValor = Math.max(remaining, 0) / parcelaCount;
  for (let index = 1; index <= parcelaCount; index++) {
    await insertReceivable(client, vendaLocacaoId, clienteId, 'parcela', index, parcelaValor, dataEvento);
  }

  await client.query(
    `
    INSERT INTO financeiro_movimentos (origem_tipo, origem_id, cliente_id, venda_locacao_id, tipo, natureza, valor, status, observacoes, criado_por_id)
    VALUES ('locacao', $1, $2, $1, 'entrada', 'receita', $3, 'previsto', 'Contas a receber geradas.', $4)
    `,
    [vendaLocacaoId, clienteId, total, usuarioId]
  );
}

async function insertReceivable(client: any, vendaLocacaoId: string, clienteId: string, tipo: string, parcela: number, valor: number, vencimento: string) {
  await client.query(
    `
    INSERT INTO contas_receber (venda_locacao_id, cliente_id, tipo, parcela_numero, valor_original, valor_saldo, vencimento)
    VALUES ($1,$2,$3,$4,$5,$5,$6)
    `,
    [vendaLocacaoId, clienteId, tipo, parcela, valor, vencimento]
  );
}

export async function registerPayment(input: z.infer<typeof paymentSchema>, usuarioId: string) {
  const data = paymentSchema.parse(input);
  return withTransaction(async (client) => {
    const conta = await client.query('SELECT * FROM contas_receber WHERE id = $1 FOR UPDATE', [data.conta_receber_id]);
    if (!conta.rowCount) throw new Error('Conta a receber não encontrada.');
    const row = conta.rows[0];
    const novoPago = Number(row.valor_pago) + data.valor_pago;
    const novoSaldo = Math.max(Number(row.valor_original) - novoPago, 0);
    const status = novoSaldo <= 0 ? 'paga' : 'parcial';

    const payment = await client.query<{ id: string }>(
      `
      INSERT INTO pagamentos_recebidos (
        conta_receber_id, venda_locacao_id, cliente_id, valor_pago, data_pagamento,
        forma_pagamento, comprovante_arquivo_id, observacoes, registrado_por_id
      )
      VALUES ($1,$2,$3,$4,COALESCE($5, now()),$6,$7,$8,$9)
      RETURNING id
      `,
      [data.conta_receber_id, row.venda_locacao_id, row.cliente_id, data.valor_pago, data.data_pagamento ?? null, data.forma_pagamento, data.comprovante_arquivo_id ?? null, data.observacoes ?? null, usuarioId]
    );

    await client.query('UPDATE contas_receber SET valor_pago = $2, valor_saldo = $3, status = $4, atualizado_em = now() WHERE id = $1', [data.conta_receber_id, novoPago, novoSaldo, status]);
    await client.query(
      `
      INSERT INTO financeiro_movimentos (origem_tipo, origem_id, cliente_id, venda_locacao_id, tipo, natureza, valor, forma_pagamento, status, criado_por_id)
      VALUES ('pagamento_recebido', $1, $2, $3, 'entrada', 'receita', $4, $5, 'realizado', $6)
      `,
      [payment.rows[0].id, row.cliente_id, row.venda_locacao_id, data.valor_pago, data.forma_pagamento, usuarioId]
    );
    await addAuditLog(client, {
      usuarioId,
      acao: 'pagamento_registrado',
      entidadeTipo: 'conta_receber',
      entidadeId: data.conta_receber_id,
      antes: { valor_pago: row.valor_pago, valor_saldo: row.valor_saldo },
      depois: { valor_pago: novoPago, valor_saldo: novoSaldo },
      motivo: data.observacoes ?? null
    });

    return { id: payment.rows[0].id, status, saldo: novoSaldo };
  });
}

export async function registerBail(vendaLocacaoId: string, input: z.infer<typeof bailSchema>, usuarioId: string) {
  const data = bailSchema.parse(input);
  return withTransaction(async (client) => {
    const rental = await client.query('SELECT cliente_id FROM vendas_locacoes WHERE id = $1', [vendaLocacaoId]);
    if (!rental.rowCount) throw new Error('Locação não encontrada.');

    const bail = await client.query<{ id: string }>(
      `
      INSERT INTO caucao_movimentos (
        venda_locacao_id, tipo_movimento, valor, forma_pagamento, chave_pix_devolucao,
        responsavel_id, motivo, observacoes
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING id
      `,
      [vendaLocacaoId, data.tipo_movimento, data.valor, data.forma_pagamento ?? null, data.chave_pix_devolucao ?? null, usuarioId, data.motivo ?? null, data.observacoes ?? null]
    );

    const tipo = data.tipo_movimento === 'devolucao' ? 'saida' : data.tipo_movimento === 'retencao' ? 'retencao' : 'entrada';
    const natureza = data.tipo_movimento === 'devolucao' ? 'devolucao_caucao' : 'caucao';
    await client.query(
      `
      INSERT INTO financeiro_movimentos (origem_tipo, origem_id, cliente_id, venda_locacao_id, tipo, natureza, valor, forma_pagamento, status, criado_por_id)
      VALUES ('caucao_movimento', $1, $2, $3, $4, $5, $6, $7, 'realizado', $8)
      `,
      [bail.rows[0].id, rental.rows[0].cliente_id, vendaLocacaoId, tipo, natureza, data.valor, data.forma_pagamento ?? null, usuarioId]
    );
    await addAuditLog(client, {
      usuarioId,
      acao: `caucao_${data.tipo_movimento}`,
      entidadeTipo: 'locacao',
      entidadeId: vendaLocacaoId,
      depois: data,
      motivo: data.motivo ?? null
    });

    return { id: bail.rows[0].id };
  });
}

export async function updateContract(id: string, input: z.infer<typeof contractSchema>, usuarioId: string) {
  const data = contractSchema.parse(input);
  await pool.query(
    `
    UPDATE vendas_locacoes
    SET contrato_assinado = $2, contrato_assinado_em = $3, contrato_arquivo_id = $4,
      observacoes = COALESCE($5, observacoes), atualizado_em = now()
    WHERE id = $1
    `,
    [id, data.contrato_assinado, data.contrato_assinado_em ?? null, data.contrato_arquivo_id ?? null, data.observacoes ?? null]
  );
  await pool.query(
    "INSERT INTO historico_atendimentos (entidade_tipo, entidade_id, usuario_id, tipo, descricao) VALUES ('locacao', $1, $2, 'contrato_atualizado', 'Contrato mínimo atualizado.')",
    [id, usuarioId]
  );
  await addAuditLog(pool, {
    usuarioId,
    acao: data.contrato_assinado ? 'contrato_anexado' : 'contrato_atualizado',
    entidadeTipo: 'locacao',
    entidadeId: id,
    depois: data,
    motivo: data.observacoes ?? null
  });
  if (data.contrato_assinado) {
    await pool.query(
      "INSERT INTO eventos_outbox (evento, entidade_tipo, entidade_id, payload_json, idempotency_key) VALUES ('contrato_anexado', 'locacao', $1, '{}', $2) ON CONFLICT DO NOTHING",
      [id, `contrato_anexado:${id}`]
    );
  }
  return { id };
}

export async function validateDelivery(id: string) {
  const result = await pool.query('SELECT * FROM vendas_locacoes WHERE id = $1', [id]);
  if (!result.rowCount) throw new Error('Locação não encontrada.');
  const rental = result.rows[0];
  const pendencias: string[] = [];

  const bloquearSemContrato = await getRuleBool(pool, 'contrato_bloquear_retirada_sem_assinatura', true);
  const bloquearInadimplente = await getRuleBool(pool, 'financeiro_bloquear_retirada_inadimplente', true);
  const exigirCaucao = await getRuleBool(pool, 'caucao_exigir_recebimento_retirada', false);

  if (bloquearSemContrato && (!rental.contrato_assinado || !rental.contrato_arquivo_id)) pendencias.push('Contrato não anexado.');

  if (bloquearInadimplente) {
    const overdue = await pool.query("SELECT 1 FROM contas_receber WHERE venda_locacao_id = $1 AND status <> 'paga' AND vencimento < current_date AND deleted_at IS NULL LIMIT 1", [id]);
    if (overdue.rowCount) pendencias.push('Parcela vencida.');
  }

  if (exigirCaucao) {
    const bail = await pool.query("SELECT COALESCE(sum(CASE WHEN tipo_movimento = 'recebimento' THEN valor ELSE -valor END), 0) AS saldo FROM caucao_movimentos WHERE venda_locacao_id = $1 AND deleted_at IS NULL", [id]);
    if (Number(bail.rows[0].saldo) <= 0) pendencias.push('Caução não registrada.');
  }

  const liberado = pendencias.length === 0;
  if (!liberado) {
    await pool.query(
      "INSERT INTO eventos_outbox (evento, entidade_tipo, entidade_id, payload_json) VALUES ('retirada_bloqueada', 'locacao', $1, $2)",
      [id, JSON.stringify({ pendencias })]
    );
  }
  return { liberado, pendencias };
}

export async function confirmDelivery(id: string, usuarioId: string) {
  const validation = await validateDelivery(id);
  if (!validation.liberado) return validation;

  await pool.query("UPDATE vendas_locacoes SET status = 'retirada', data_retirada_real = now(), atualizado_em = now() WHERE id = $1", [id]);
  await pool.query("INSERT INTO checklists_retirada_devolucao (venda_locacao_id, tipo, status, confirmado_por_id, confirmado_em) VALUES ($1, 'retirada', 'confirmado', $2, now())", [id, usuarioId]);
  await pool.query("INSERT INTO historico_atendimentos (entidade_tipo, entidade_id, usuario_id, tipo, descricao) VALUES ('locacao', $1, $2, 'retirada_confirmada', 'Entrega do vestido confirmada.')", [id, usuarioId]);
  await pool.query("INSERT INTO eventos_outbox (evento, entidade_tipo, entidade_id) VALUES ('retirada_confirmada', 'locacao', $1)", [id]);
  await pool.query("INSERT INTO eventos_outbox (evento, entidade_tipo, entidade_id) VALUES ('retirada_liberada', 'locacao', $1)", [id]);
  return { liberado: true, pendencias: [] };
}

export async function confirmReturn(id: string, input: z.infer<typeof returnSchema>, usuarioId: string) {
  const data = returnSchema.parse(input);
  const rental = await pool.query('SELECT * FROM vendas_locacoes WHERE id = $1', [id]);
  if (!rental.rowCount) throw new Error('Locação não encontrada.');
  if (rental.rows[0].status !== 'retirada') throw new Error('A locação precisa estar retirada para receber devolução.');

  const expected = rental.rows[0].data_devolucao_prevista ? new Date(rental.rows[0].data_devolucao_prevista) : new Date();
  const now = new Date();
  const atrasoDias = Math.max(Math.ceil((now.getTime() - expected.getTime()) / 86400000), 0);

  await pool.query("UPDATE vendas_locacoes SET status = 'devolvida', data_devolucao_real = now(), atualizado_em = now() WHERE id = $1", [id]);
  await pool.query(
    `
    INSERT INTO checklists_retirada_devolucao (
      venda_locacao_id, tipo, status, itens_json, observacoes, atraso_dias, precisa_lavanderia,
      possui_problema, confirmado_por_id, confirmado_em
    )
    VALUES ($1, 'devolucao', 'confirmado', $2, $3, $4, $5, $6, $7, now())
    `,
    [id, JSON.stringify({ itens_devolvidos: data.itens_devolvidos }), data.observacoes ?? null, atrasoDias, data.precisa_lavanderia, data.possui_problema, usuarioId]
  );
  await pool.query("UPDATE reservas_estoque SET status = 'concluida', atualizado_em = now() WHERE venda_locacao_id = $1 AND deleted_at IS NULL", [id]);
  await pool.query("INSERT INTO historico_atendimentos (entidade_tipo, entidade_id, usuario_id, tipo, descricao) VALUES ('locacao', $1, $2, 'devolucao_confirmada', 'Recebimento do vestido confirmado.')", [id, usuarioId]);
  await pool.query("INSERT INTO eventos_outbox (evento, entidade_tipo, entidade_id) VALUES ('devolucao_confirmada', 'locacao', $1)", [id]);
  return { id, status: 'devolvida', atraso_dias: atrasoDias };
}

export async function swapItem(vendaLocacaoId: string, input: z.infer<typeof swapItemSchema>, usuarioId: string) {
  const data = swapItemSchema.parse(input);
  return withTransaction(async (client) => {
    const item = await client.query('SELECT * FROM venda_locacao_itens WHERE id = $1 AND venda_locacao_id = $2 FOR UPDATE', [data.item_id, vendaLocacaoId]);
    if (!item.rowCount) throw new Error('Item não encontrado.');

    const rental = await client.query('SELECT * FROM vendas_locacoes WHERE id = $1', [vendaLocacaoId]);
    const product = await client.query('SELECT valor_locacao FROM produtos WHERE id = $1', [data.novo_produto_id]);
    const availability = await validateAvailability({
      inicio_at: asStartOfDay(rental.rows[0].data_retirada_prevista ?? rental.rows[0].data_evento)!,
      fim_at: asEndOfDay(rental.rows[0].data_devolucao_prevista ?? rental.rows[0].data_evento)!,
      produto_ids: [data.novo_produto_id]
    }, client);
    if (!availability.disponivel) return { trocado: false, conflitos: availability.conflitos };

    await client.query("UPDATE reservas_estoque SET status = 'cancelada', cancelado_em = now(), cancelado_por_id = $2 WHERE id = $1", [item.rows[0].reserva_estoque_id, usuarioId]);
    const newItem = await client.query<{ id: string }>(
      `
      INSERT INTO venda_locacao_itens (venda_locacao_id, produto_id, tipo_item, quantidade, valor_unitario, valor_total, valor_caucao_item)
      VALUES ($1,$2,$3,1,$4,$4,$5)
      RETURNING id
      `,
      [vendaLocacaoId, data.novo_produto_id, item.rows[0].tipo_item, Number(product.rows[0]?.valor_locacao ?? 0), Number(item.rows[0].valor_caucao_item)]
    );
    const reserva = await client.query<{ id: string }>(
      `
      INSERT INTO reservas_estoque (produto_id, cliente_id, venda_locacao_id, venda_locacao_item_id, data_evento, inicio_at, fim_at, tipo_bloqueio, motivo_bloqueio, status)
      VALUES ($1,$2,$3,$4,$5,$6,$7,'locacao','Reserva criada na troca de item.','convertida')
      RETURNING id
      `,
      [data.novo_produto_id, rental.rows[0].cliente_id, vendaLocacaoId, newItem.rows[0].id, rental.rows[0].data_evento, asStartOfDay(rental.rows[0].data_retirada_prevista ?? rental.rows[0].data_evento), asEndOfDay(rental.rows[0].data_devolucao_prevista ?? rental.rows[0].data_evento)]
    );
    await client.query('UPDATE venda_locacao_itens SET reserva_estoque_id = $2 WHERE id = $1', [newItem.rows[0].id, reserva.rows[0].id]);
    await client.query("UPDATE venda_locacao_itens SET status = 'substituido', substituido_por_item_id = $2, motivo_substituicao = $3, substituido_em = now(), substituido_por_usuario_id = $4 WHERE id = $1", [data.item_id, newItem.rows[0].id, data.motivo, usuarioId]);
    await addHistory(client, vendaLocacaoId, usuarioId, 'item_locacao_substituido', 'Item da locação substituído.');
    await addOutbox(client, 'item_locacao_substituido', 'locacao', vendaLocacaoId, { item_antigo_id: data.item_id, item_novo_id: newItem.rows[0].id });
    await addAuditLog(client, {
      usuarioId,
      acao: 'item_locacao_substituido',
      entidadeTipo: 'locacao',
      entidadeId: vendaLocacaoId,
      antes: item.rows[0],
      depois: { novo_item_id: newItem.rows[0].id, novo_produto_id: data.novo_produto_id },
      motivo: data.motivo
    });
    return { trocado: true, item_id: newItem.rows[0].id, conflitos: [] };
  });
}

export async function listReceivables() {
  const result = await pool.query(`
    SELECT cr.*, c.nome AS cliente_nome
    FROM contas_receber cr
    JOIN clientes c ON c.id = cr.cliente_id
    WHERE cr.deleted_at IS NULL
    ORDER BY cr.status, cr.vencimento
  `);
  return result.rows;
}

async function addHistory(client: any, id: string, usuarioId: string, tipo: string, descricao: string) {
  await client.query("INSERT INTO historico_atendimentos (entidade_tipo, entidade_id, usuario_id, tipo, descricao) VALUES ('locacao', $1, $2, $3, $4)", [id, usuarioId, tipo, descricao]);
}

async function addOutbox(client: any, evento: string, entidadeTipo: string, entidadeId: string, payload: Record<string, unknown>) {
  await client.query('INSERT INTO eventos_outbox (evento, entidade_tipo, entidade_id, payload_json) VALUES ($1,$2,$3,$4)', [evento, entidadeTipo, entidadeId, JSON.stringify(payload)]);
}
