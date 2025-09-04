CREATE TABLE IF NOT EXISTS codigo_ocorrencias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo VARCHAR(50) NOT NULL UNIQUE,
  descricao VARCHAR(255) NOT NULL,
  status_normalizado VARCHAR(50) NOT NULL,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_codigo_ocorrencias_codigo ON codigo_ocorrencias(codigo);
CREATE INDEX IF NOT EXISTS idx_codigo_ocorrencias_status ON codigo_ocorrencias(status_normalizado);
