CREATE TABLE IF NOT EXISTS webhooks_eventos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  integracao_id UUID NOT NULL REFERENCES integracoes(id) ON DELETE CASCADE,
  evento VARCHAR(100) NOT NULL,
  payload JSONB,
  recebido_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processado BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhooks_integracao_id ON webhooks_eventos(integracao_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_processado ON webhooks_eventos(processado);
