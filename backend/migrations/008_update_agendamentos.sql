-- Adiciona campos faltantes na tabela de agendamentos
ALTER TABLE agendamentos 
ADD COLUMN IF NOT EXISTS nome VARCHAR(255),
ADD COLUMN IF NOT EXISTS transportadora_id INTEGER,
ADD COLUMN IF NOT EXISTS url TEXT,
ADD COLUMN IF NOT EXISTS metodo VARCHAR(10) DEFAULT 'POST',
ADD COLUMN IF NOT EXISTS janela_minutos INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS headers JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS payload JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS metas JSONB DEFAULT '{}';

-- Atualiza registros existentes com valores padrão se necessário
UPDATE agendamentos 
SET nome = COALESCE(nome, 'Agendamento_' || id),
    metodo = COALESCE(metodo, 'POST'),
    janela_minutos = COALESCE(janela_minutos, 5),
    headers = COALESCE(headers, '{}'),
    payload = COALESCE(payload, '{}'),
    metas = COALESCE(metas, '{}')
WHERE nome IS NULL OR metodo IS NULL OR janela_minutos IS NULL;