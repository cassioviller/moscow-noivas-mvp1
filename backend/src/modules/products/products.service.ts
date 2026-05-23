import { z } from 'zod';
import { pool } from '../../config/db.js';
import { addAuditLog } from '../traceability/audit.service.js';

export const productSchema = z.object({
  nome: z.string().min(2),
  codigo_interno: z.string().min(1),
  categoria_id: z.string().uuid().optional().nullable(),
  marca: z.string().optional().nullable(),
  modelo: z.string().optional().nullable(),
  tamanho: z.string().optional().nullable(),
  cor: z.string().optional().nullable(),
  valor_venda: z.number().min(0).default(0),
  valor_locacao: z.number().min(0).default(0),
  custo: z.number().min(0).default(0),
  status_geral: z.string().default('disponivel'),
  descricao: z.string().optional().nullable(),
  observacoes: z.string().optional().nullable()
});

export const fileSchema = z.object({
  entidade_tipo: z.string().min(2),
  entidade_id: z.string().uuid(),
  tipo_arquivo: z.string().min(2),
  classificacao_dado: z.string().default('interno'),
  nome_original: z.string().min(1).regex(/\.(pdf|jpg|jpeg|png|webp)$/i, 'Arquivo não permitido. Envie apenas PDF, JPG, PNG ou WebP.'),
  storage_path: z.string().min(1),
  mime_type: z.string().min(1),
  tamanho_bytes: z.number().int().min(0),
  checksum: z.string().optional().nullable(),
  publico: z.boolean().default(false),
  requer_url_assinada: z.boolean().default(true),
  observacoes: z.string().optional().nullable()
});

export async function listProducts() {
  const result = await pool.query(`
    SELECT
      p.*,
      c.nome AS categoria_nome,
      pf.arquivo_id AS foto_principal_arquivo_id,
      a.storage_path AS foto_principal_url
    FROM produtos p
    LEFT JOIN categorias_produto c ON c.id = p.categoria_id
    LEFT JOIN produto_fotos pf ON pf.produto_id = p.id AND pf.is_principal = true
    LEFT JOIN arquivos a ON a.id = pf.arquivo_id
    WHERE p.deleted_at IS NULL
    ORDER BY p.nome
  `);
  return result.rows;
}

export async function getProduct(id: string) {
  const [product, photos, reservations, agenda] = await Promise.all([
    pool.query('SELECT * FROM produtos WHERE id = $1 AND deleted_at IS NULL', [id]),
    pool.query(`
      SELECT pf.*, a.nome_original, a.storage_path
      FROM produto_fotos pf
      JOIN arquivos a ON a.id = pf.arquivo_id
      WHERE pf.produto_id = $1
      ORDER BY pf.is_principal DESC, pf.ordem
    `, [id]),
    pool.query('SELECT * FROM reservas_estoque WHERE produto_id = $1 AND deleted_at IS NULL ORDER BY inicio_at DESC', [id]),
    pool.query(`
      SELECT a.* FROM agendamentos a
      JOIN agendamento_produtos ap ON ap.agendamento_id = a.id
      WHERE ap.produto_id = $1 AND a.deleted_at IS NULL
      ORDER BY a.inicio_at DESC
    `, [id])
  ]);

  return { produto: product.rows[0], fotos: photos.rows, reservas: reservations.rows, agenda: agenda.rows };
}

export async function createProduct(input: z.infer<typeof productSchema>) {
  const data = productSchema.parse(input);
  const result = await pool.query(
    `
    INSERT INTO produtos (
      nome, codigo_interno, categoria_id, marca, modelo, tamanho, cor,
      valor_venda, valor_locacao, custo, status_geral, descricao, observacoes
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
    RETURNING *
    `,
    [
      data.nome,
      data.codigo_interno,
      data.categoria_id ?? null,
      data.marca ?? null,
      data.modelo ?? null,
      data.tamanho ?? null,
      data.cor ?? null,
      data.valor_venda,
      data.valor_locacao,
      data.custo,
      data.status_geral,
      data.descricao ?? null,
      data.observacoes ?? null
    ]
  );
  return result.rows[0];
}

export async function listCategories() {
  const result = await pool.query('SELECT * FROM categorias_produto WHERE ativo = true ORDER BY nome');
  return result.rows;
}

export async function createFile(input: z.infer<typeof fileSchema>, usuarioId: string) {
  const data = fileSchema.parse(input);
  const result = await pool.query(
    `
    INSERT INTO arquivos (
      entidade_tipo, entidade_id, tipo_arquivo, classificacao_dado, nome_original,
      storage_path, mime_type, tamanho_bytes, checksum, uploaded_by_id, publico,
      requer_url_assinada, observacoes
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
    RETURNING *
    `,
    [
      data.entidade_tipo,
      data.entidade_id,
      data.tipo_arquivo,
      data.classificacao_dado,
      data.nome_original,
      data.storage_path,
      data.mime_type,
      data.tamanho_bytes,
      data.checksum ?? null,
      usuarioId,
      data.publico,
      data.requer_url_assinada,
      data.observacoes ?? null
    ]
  );
  return result.rows[0];
}

export async function addProductPhoto(productId: string, arquivoId: string, isPrincipal: boolean) {
  if (isPrincipal) {
    await pool.query('UPDATE produto_fotos SET is_principal = false WHERE produto_id = $1', [productId]);
  }

  const result = await pool.query(
    `
    INSERT INTO produto_fotos (produto_id, arquivo_id, is_principal)
    VALUES ($1, $2, $3)
    RETURNING *
    `,
    [productId, arquivoId, isPrincipal]
  );
  return result.rows[0];
}

export async function logFileAccess(arquivoId: string, usuarioId: string, acao: string, ip?: string, userAgent?: string) {
  await pool.query(
    `
    INSERT INTO arquivo_acessos_log (arquivo_id, usuario_id, acao, ip, user_agent)
    VALUES ($1,$2,$3,$4,$5)
    `,
    [arquivoId, usuarioId, acao, ip ?? null, userAgent ?? null]
  );
  await addAuditLog(pool, {
    usuarioId,
    acao: `arquivo_${acao}`,
    entidadeTipo: 'arquivo',
    entidadeId: arquivoId,
    motivo: 'Acesso a arquivo registrado.',
    ip,
    userAgent
  });
}
