import { describe, expect, it } from 'vitest';
import { fileSchema } from '../src/modules/products/products.service.js';

const baseFile = {
  entidade_tipo: 'cliente',
  entidade_id: '11111111-1111-4111-8111-111111111111',
  tipo_arquivo: 'contrato',
  classificacao_dado: 'contrato',
  storage_path: 'private/contrato.pdf',
  mime_type: 'application/pdf',
  tamanho_bytes: 100,
  publico: false,
  requer_url_assinada: true
};

describe('fileSchema', () => {
  it('accepts PDF, JPG, PNG and WebP', () => {
    for (const nome_original of ['a.pdf', 'a.jpg', 'a.png', 'a.webp']) {
      expect(() => fileSchema.parse({ ...baseFile, nome_original })).not.toThrow();
    }
  });

  it('blocks executable files', () => {
    expect(() => fileSchema.parse({ ...baseFile, nome_original: 'virus.exe' })).toThrow();
  });
});
