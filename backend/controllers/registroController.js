// controllers/registroController.js
const db = require('../config/db');

/* ----------------------------- utilitários ----------------------------- */
function toStr(v) {
  return String(v ?? '').trim();
}
function toIntOrNull(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = parseInt(String(v), 10);
  return Number.isNaN(n) ? null : n;
}
function toBool(v) {
  return Boolean(v);
}

/* =========================================================================
 * POST /api/registro
 * Cria motorista + veículo em transação.
 * Body: { ...camposMotorista, veiculo: { placa, modelo, cor, ano } }
 * ========================================================================= */
exports.storeMotoristaVeiculo = async (req, res) => {
  const client = await db.connect();
  const { veiculo: veiculoData = {}, ...motoristaData } = req.body || {};

  try {
    await client.query('BEGIN');

    // ---- Sanitização do motorista ----
    const nome        = toStr(motoristaData.nome);
    const sobrenome   = toStr(motoristaData.sobrenome);
    const cpf         = toStr(motoristaData.cpf);
    const contato     = toIntOrNull(
      (motoristaData.contato != null)
        ? String(motoristaData.contato).replace(/\D/g, '')
        : null
    );
    const email       = toStr(motoristaData.email);
    const foto_perfil = toStr(motoristaData.foto_perfil);
    const pais        = toStr(motoristaData.pais);
    const estado      = toStr(motoristaData.estado);
    const cidade      = toStr(motoristaData.cidade);
    const bairro      = toStr(motoristaData.bairro);
    const rua         = toStr(motoristaData.rua);
    const numero      = toIntOrNull(motoristaData.numero);
    const cep         = toStr(motoristaData.cep);
    const unidade     = toStr(motoristaData.unidade);
    const send_mensagem = toBool(motoristaData.send_mensagem);
    const legislacao_id = toIntOrNull(motoristaData.legislacao_id);
    const app_liberado  = toBool(motoristaData.app_liberado);
    const status        = (motoristaData.status === undefined ? true : motoristaData.status);

    // ---- Valida mínimos (motorista + veículo) ----
    if (!nome || !cpf) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Nome e CPF são obrigatórios.' });
    }

    // Sanitização do veículo
    const placa  = toStr(veiculoData.placa);
    const modelo = toStr(veiculoData.modelo);
    const cor    = toStr(veiculoData.cor);
    const anoStr = (veiculoData.ano !== undefined && veiculoData.ano !== null) ? String(veiculoData.ano) : '';
    const ano    = anoStr ? toIntOrNull(anoStr) : null;

    if (!placa || !modelo || !cor || !ano) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Placa, modelo, cor e ano do veículo são obrigatórios.' });
    }

    // ---- INSERT motorista ----
    const { rows: [motorista] } = await client.query(`
      INSERT INTO public.motoristas (
        nome, sobrenome, cpf, contato, email, foto_perfil,
        pais, estado, cidade, bairro, rua, numero, cep, unidade,
        send_mensagem, legislacao_id, app_liberado, status,
        created_at, updated_at
      ) VALUES (
        $1,$2,$3,$4,$5,$6,
        $7,$8,$9,$10,$11,$12,$13,$14,
        $15,$16,$17,$18,
        NOW(), NOW()
      )
      RETURNING *;
    `, [
      nome, sobrenome, cpf, contato, email, foto_perfil,
      pais, estado, cidade, bairro, rua, numero, cep, unidade,
      send_mensagem, legislacao_id, app_liberado, status
    ]);

    // ---- INSERT veículo ----
    const { rows: [veiculo] } = await client.query(`
      INSERT INTO public.veiculos (
        id_motorista, placa, modelo, cor, ano, created_at
      )
      VALUES ($1,$2,$3,$4,$5,NOW())
      RETURNING *;
    `, [motorista.id_motorista, placa, modelo, cor, ano]);

    await client.query('COMMIT');
    return res.status(201).json({ motorista, veiculo });

  } catch (err) {
    await client.query('ROLLBACK');

    // Tratamento de duplicidade de CPF (ajuste o nome da constraint se necessário)
    if (err.code === '23505' && String(err.constraint || '').toLowerCase().includes('cpf')) {
      return res.status(409).json({
        error:   'CPF já cadastrado.',
        message: `O CPF ${toStr(req.body?.cpf)} já está em uso.`
      });
    }

    console.error('POST /api/registro erro:', err);
    return res.status(500).json({ error: 'Erro ao cadastrar motorista e veículo.', message: err.message });
  } finally {
    client.release();
  }
};


/* =========================================================================
 * PUT /api/registro/:id_motorista
 * Atualiza motorista e veículo em transação.
 * - Se não vier id_veiculo, tenta o veículo mais recente; se não houver, insere novo.
 * ========================================================================= */
exports.updateMotoristaVeiculo = async (req, res) => {
  const client = await db.connect();
  const id_motorista = toIntOrNull(req.params.id_motorista);

  if (!id_motorista) {
    return res.status(400).json({ error: 'id_motorista inválido.' });
  }

  const { veiculo: veiculoData = {}, ...motoristaData } = req.body || {};

  try {
    await client.query('BEGIN');

    // ---- Sanitização do motorista ----
    const nome        = toStr(motoristaData.nome);
    const sobrenome   = toStr(motoristaData.sobrenome);
    const cpf         = toStr(motoristaData.cpf);
    const contato     = toIntOrNull(
      (motoristaData.contato != null)
        ? String(motoristaData.contato).replace(/\D/g, '')
        : null
    );
    const email       = toStr(motoristaData.email);
    const foto_perfil = toStr(motoristaData.foto_perfil);
    const pais        = toStr(motoristaData.pais);
    const estado      = toStr(motoristaData.estado);
    const cidade      = toStr(motoristaData.cidade);
    const bairro      = toStr(motoristaData.bairro);
    const rua         = toStr(motoristaData.rua);
    const numero      = toIntOrNull(motoristaData.numero);
    const cep         = toStr(motoristaData.cep);
    const unidade     = toStr(motoristaData.unidade);
    const send_mensagem = toBool(motoristaData.send_mensagem);
    const legislacao_id = toIntOrNull(motoristaData.legislacao_id);
    const app_liberado  = toBool(motoristaData.app_liberado);
    const status        = (motoristaData.status === undefined ? true : motoristaData.status);

    // ---- UPDATE motorista ----
    const { rows: [motorista] } = await client.query(`
      UPDATE public.motoristas SET
        nome=$1, sobrenome=$2, cpf=$3, contato=$4, email=$5, foto_perfil=$6,
        pais=$7, estado=$8, cidade=$9, bairro=$10, rua=$11, numero=$12, cep=$13, unidade=$14,
        send_mensagem=$15, legislacao_id=$16, app_liberado=$17, status=$18,
        updated_at=NOW()
      WHERE id_motorista=$19
      RETURNING *;
    `, [
      nome, sobrenome, cpf, contato, email, foto_perfil,
      pais, estado, cidade, bairro, rua, numero, cep, unidade,
      send_mensagem, legislacao_id, app_liberado, status,
      id_motorista
    ]);

    // ---- Sanitização do veículo ----
    const id_veiculo = toIntOrNull(veiculoData?.id_veiculo);
    const placa      = toStr(veiculoData?.placa);
    const modelo     = toStr(veiculoData?.modelo);
    const cor        = toStr(veiculoData?.cor);
    const anoStr     = (veiculoData?.ano !== undefined && veiculoData?.ano !== null) ? String(veiculoData.ano) : '';
    const ano        = anoStr ? toIntOrNull(anoStr) : null;

    // Descobrir o veículo alvo caso id_veiculo não tenha vindo
    let alvoIdVeiculo = id_veiculo;
    if (!alvoIdVeiculo) {
      const { rows } = await client.query(`
        SELECT id_veiculo
        FROM public.veiculos
        WHERE id_motorista = $1
        ORDER BY COALESCE(created_at, 'epoch'::timestamp) DESC, id_veiculo DESC
        LIMIT 1;
      `, [id_motorista]);
      if (rows.length) alvoIdVeiculo = rows[0].id_veiculo;
    }

    let veiculo = null;

    if (alvoIdVeiculo) {
      // UPDATE veículo existente
      const { rows } = await client.query(`
        UPDATE public.veiculos SET
          placa=$1, modelo=$2, cor=$3, ano=$4
        WHERE id_veiculo=$5 AND id_motorista=$6
        RETURNING *;
      `, [placa, modelo, cor, ano, alvoIdVeiculo, id_motorista]);
      veiculo = rows[0] || null;
    } else if (placa || modelo || cor || ano) {
      // Se não há veículo ainda e veio algum dado, cria um novo
      const { rows } = await client.query(`
        INSERT INTO public.veiculos (id_motorista, placa, modelo, cor, ano, created_at)
        VALUES ($1,$2,$3,$4,$5,NOW())
        RETURNING *;
      `, [id_motorista, placa, modelo, cor, ano]);
      veiculo = rows[0];
    }

    await client.query('COMMIT');
    return res.json({ motorista, veiculo });

  } catch (err) {
    await client.query('ROLLBACK');

    if (err.code === '23505' && String(err.constraint || '').toLowerCase().includes('cpf')) {
      return res.status(409).json({
        error:   'CPF já cadastrado.',
        message: `O CPF ${toStr(req.body?.cpf)} já está em uso.`
      });
    }

    console.error('PUT /api/registro/:id_motorista erro:', err);
    return res.status(500).json({ error: 'Erro ao atualizar motorista e veículo.', message: err.message });
  } finally {
    client.release();
  }
};
