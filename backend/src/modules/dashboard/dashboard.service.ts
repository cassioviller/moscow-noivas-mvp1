import { pool } from '../../config/db.js';

export async function getDashboard() {
  const [
    agendaHoje,
    tarefasAtrasadas,
    leadsNovos,
    provasProximas,
    parcelasVencidas,
    caucaoAberta,
    retiradasProximas,
    devolucoesProximas,
    locacoesMes,
    conflitosEvitados,
    agendaLista,
    tarefasLista,
    leadsLista,
    financeiroLista,
    retiradasLista,
    locacoesLista
  ] = await Promise.all([
    pool.query("SELECT count(*)::integer AS total FROM agendamentos WHERE deleted_at IS NULL AND cancelado_em IS NULL AND inicio_at::date = current_date"),
    pool.query("SELECT count(*)::integer AS total FROM tarefas WHERE deleted_at IS NULL AND status <> 'concluida' AND data_limite < now()"),
    pool.query("SELECT count(*)::integer AS total FROM leads WHERE deleted_at IS NULL AND status = 'novo'"),
    pool.query("SELECT count(*)::integer AS total FROM agendamentos WHERE deleted_at IS NULL AND cancelado_em IS NULL AND inicio_at BETWEEN now() AND now() + interval '7 days'"),
    pool.query("SELECT count(*)::integer AS total FROM contas_receber WHERE deleted_at IS NULL AND status <> 'paga' AND vencimento < current_date"),
    pool.query(`
      SELECT count(*)::integer AS total
      FROM vendas_locacoes vl
      WHERE vl.deleted_at IS NULL AND vl.valor_caucao > 0
        AND COALESCE((SELECT sum(CASE WHEN cm.tipo_movimento='recebimento' THEN cm.valor ELSE -cm.valor END) FROM caucao_movimentos cm WHERE cm.venda_locacao_id = vl.id AND cm.deleted_at IS NULL), 0) < vl.valor_caucao
    `),
    pool.query("SELECT count(*)::integer AS total FROM vendas_locacoes WHERE deleted_at IS NULL AND data_retirada_prevista BETWEEN current_date AND current_date + 7"),
    pool.query("SELECT count(*)::integer AS total FROM vendas_locacoes WHERE deleted_at IS NULL AND data_devolucao_prevista BETWEEN current_date AND current_date + 7"),
    pool.query("SELECT count(*)::integer AS total FROM vendas_locacoes WHERE deleted_at IS NULL AND date_trunc('month', criado_em) = date_trunc('month', now())"),
    pool.query("SELECT count(*)::integer AS total FROM conflitos_log WHERE criado_em >= now() - interval '30 days'"),
    pool.query(`
      SELECT a.id, a.inicio_at, a.fim_at, a.tipo, a.status,
        COALESCE(c.nome, l.nome) AS pessoa_nome,
        f.nome AS atendente_nome,
        s.nome AS sala_nome,
        p.nome AS vestido_nome
      FROM agendamentos a
      LEFT JOIN clientes c ON c.id = a.cliente_id
      LEFT JOIN leads l ON l.id = a.lead_id
      LEFT JOIN funcionarios f ON f.id = a.atendente_id
      LEFT JOIN salas_prova s ON s.id = a.sala_prova_id
      LEFT JOIN produtos p ON p.id = a.produto_id
      WHERE a.deleted_at IS NULL AND a.cancelado_em IS NULL AND a.inicio_at::date = current_date
      ORDER BY a.inicio_at
      LIMIT 8
    `),
    pool.query(`
      SELECT t.id, t.titulo, t.prioridade, t.data_limite, COALESCE(l.nome, c.nome) AS pessoa_nome
      FROM tarefas t
      LEFT JOIN leads l ON l.id = t.lead_id
      LEFT JOIN clientes c ON c.id = t.cliente_id
      WHERE t.deleted_at IS NULL AND t.status <> 'concluida'
      ORDER BY CASE WHEN t.data_limite < now() THEN 0 ELSE 1 END, t.data_limite NULLS LAST
      LIMIT 8
    `),
    pool.query(`
      SELECT id, nome, telefone, status, data_evento, interesse, origem
      FROM leads
      WHERE deleted_at IS NULL AND status IN ('novo', 'sem_retorno', 'prova_marcada')
      ORDER BY criado_em DESC
      LIMIT 8
    `),
    pool.query(`
      SELECT cr.id, cr.tipo, cr.parcela_numero, cr.valor_saldo, cr.vencimento, cr.status, c.nome AS cliente_nome
      FROM contas_receber cr
      JOIN clientes c ON c.id = cr.cliente_id
      WHERE cr.deleted_at IS NULL AND cr.status <> 'paga'
      ORDER BY cr.vencimento
      LIMIT 8
    `),
    pool.query(`
      SELECT vl.id, c.nome AS cliente_nome, vl.status, vl.data_retirada_prevista, vl.data_devolucao_prevista, vl.valor_total
      FROM vendas_locacoes vl
      JOIN clientes c ON c.id = vl.cliente_id
      WHERE vl.deleted_at IS NULL
        AND (vl.data_retirada_prevista BETWEEN current_date AND current_date + 7
          OR vl.data_devolucao_prevista BETWEEN current_date AND current_date + 7)
      ORDER BY COALESCE(vl.data_retirada_prevista, vl.data_devolucao_prevista)
      LIMIT 8
    `),
    pool.query(`
      SELECT vl.id, c.nome AS cliente_nome, vl.status, vl.data_evento, vl.valor_total, vl.valor_caucao
      FROM vendas_locacoes vl
      JOIN clientes c ON c.id = vl.cliente_id
      WHERE vl.deleted_at IS NULL
      ORDER BY vl.criado_em DESC
      LIMIT 6
    `)
  ]);

  return {
    vendedora: {
      agenda_hoje: agendaHoje.rows[0].total,
      tarefas_atrasadas: tarefasAtrasadas.rows[0].total,
      leads_sem_retorno: leadsNovos.rows[0].total,
      proximas_provas: provasProximas.rows[0].total
    },
    financeiro: {
      parcelas_vencidas: parcelasVencidas.rows[0].total,
      caucoes_em_aberto: caucaoAberta.rows[0].total,
      retiradas_proximas: retiradasProximas.rows[0].total,
      devolucoes_proximas: devolucoesProximas.rows[0].total
    },
    gerente: {
      leads_novos: leadsNovos.rows[0].total,
      agendamentos_hoje: agendaHoje.rows[0].total,
      locacoes_mes: locacoesMes.rows[0].total,
      pendencias_criticas: parcelasVencidas.rows[0].total + tarefasAtrasadas.rows[0].total,
      conflitos_evitados: conflitosEvitados.rows[0].total
    },
    listas: {
      agenda_hoje: agendaLista.rows,
      tarefas: tarefasLista.rows,
      noivas: leadsLista.rows,
      financeiro: financeiroLista.rows,
      proximas_entregas: retiradasLista.rows,
      locacoes: locacoesLista.rows
    }
  };
}
