CREATE TABLE IF NOT EXISTS jobs_execucoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agendamento_id UUID NOT NULL REFERENCES agendamentos(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL,
  executado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  log TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jobs_agendamento_id ON jobs_execucoes(agendamento_id);
CREATE INDEX IF NOT EXISTS idx_jobs_executado_em ON jobs_execucoes(executado_em);
