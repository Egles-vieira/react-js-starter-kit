CREATE TABLE IF NOT EXISTS ocorrencias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nota_fiscal_id BIGINT NOT NULL REFERENCES notas_fiscais(id) ON DELETE CASCADE,
  transportadora_id BIGINT NOT NULL REFERENCES transportadoras(id),
  codigo_externo VARCHAR(100) NOT NULL,
  codigo_ocorrencia_id UUID REFERENCES codigo_ocorrencias(id),
  status_normalizado VARCHAR(50) DEFAULT 'unknown',
  descricao TEXT,
  data_ocorrencia TIMESTAMPTZ,
  dados_originais JSONB,
  processado_em TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ocorrencias_nota_fiscal ON ocorrencias(nota_fiscal_id);
CREATE INDEX IF NOT EXISTS idx_ocorrencias_transportadora ON ocorrencias(transportadora_id);
CREATE INDEX IF NOT EXISTS idx_ocorrencias_data ON ocorrencias(data_ocorrencia);
CREATE INDEX IF NOT EXISTS idx_ocorrencias_status ON ocorrencias(status_normalizado);
