ALTER TABLE notas_fiscais 
ADD COLUMN IF NOT EXISTS status_nf VARCHAR(50) DEFAULT 'pending';

CREATE INDEX IF NOT EXISTS idx_notas_fiscais_status_nf ON notas_fiscais(status_nf);
