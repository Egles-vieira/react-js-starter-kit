CREATE TABLE IF NOT EXISTS transportadora_codigo_ocorrencia (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transportadora_id BIGINT NOT NULL REFERENCES transportadoras(id) ON DELETE CASCADE,
  codigo_externo VARCHAR(100) NOT NULL,
  codigo_ocorrencia_id UUID NOT NULL REFERENCES codigo_ocorrencias(id) ON DELETE CASCADE,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(transportadora_id, codigo_externo)
);

CREATE INDEX IF NOT EXISTS idx_transportadora_codigo_transportadora ON transportadora_codigo_ocorrencia(transportadora_id);
CREATE INDEX IF NOT EXISTS idx_transportadora_codigo_externo ON transportadora_codigo_ocorrencia(codigo_externo);
