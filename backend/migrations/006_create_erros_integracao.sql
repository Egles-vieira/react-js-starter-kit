CREATE TABLE IF NOT EXISTS erros_integracao (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  integracao_id UUID NOT NULL REFERENCES integracoes(id) ON DELETE CASCADE,
  codigo VARCHAR(50),
  mensagem TEXT NOT NULL,
  detalhe JSONB,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_erros_integracao_integracao_id ON erros_integracao(integracao_id);
