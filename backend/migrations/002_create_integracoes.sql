CREATE TABLE IF NOT EXISTS integracoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transportadora_id UUID NOT NULL REFERENCES transportadoras(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_integracoes_transportadora_id ON integracoes(transportadora_id);
