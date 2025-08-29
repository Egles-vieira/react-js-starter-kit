CREATE TABLE IF NOT EXISTS arquivos_processados (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  integracao_id UUID NOT NULL REFERENCES integracoes(id) ON DELETE CASCADE,
  caminho TEXT NOT NULL,
  processado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (integracao_id, caminho)
);

CREATE INDEX IF NOT EXISTS idx_arquivos_integracao_id ON arquivos_processados(integracao_id);
