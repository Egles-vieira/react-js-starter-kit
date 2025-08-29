const db = require('../config/db');

module.exports = {
  // Listar todos os romaneios
  async findAll() {
    const result = await db.query('SELECT * FROM romaneios ORDER BY id DESC');
    return result.rows;
  },

  // Buscar romaneio por ID
  async findById(id) {
    const result = await db.query('SELECT * FROM romaneios WHERE id = $1', [id]);
    return result.rows[0];
  },

  // Criar novo romaneio
  async create(data) {
    // --- TRATAR CAMPOS JSON ---
    const camposJson = ['rotas', 'markers', 'maplink_info'];
    camposJson.forEach(key => {
      // Se vier string do frontend/Postman, converte pra objeto
      if (typeof data[key] === 'string') {
        try {
          data[key] = JSON.parse(data[key]);
        } catch (e) {
          data[key] = null; // valor inválido vira null
        }
      }
      // Se já vier objeto, mantém
    });

    // Garantir campos numéricos convertidos
    data.capacidade_veiculo = data.capacidade_veiculo ? Number(data.capacidade_veiculo) : null;
    data.peso = data.peso ? Number(data.peso) : null;
    data.cubagem = data.cubagem ? Number(data.cubagem) : null;

    const {
      numero, unidade, placa_cavalo, placa_carreta,
      emissao, motorista_id, capacidade_veiculo, roteirizacao, roteirizacao_id,
      rotas, markers, maplink_info,
      peso, cubagem, doca, roteirizar
    } = data;

    const result = await db.query(
      `INSERT INTO romaneios (
        numero, unidade, placa_cavalo, placa_carreta,
        emissao, motorista_id, capacidade_veiculo, roteirizacao, roteirizacao_id,
        rotas, markers, maplink_info,
        peso, cubagem, doca, roteirizar,
        created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4,
        $5, $6, $7, $8, $9,
        $10, $11, $12,
        $13, $14, $15, $16,
        NOW(), NOW()
      ) RETURNING *`,
      [
        numero, unidade, placa_cavalo, placa_carreta,
        emissao, motorista_id, capacidade_veiculo, roteirizacao, roteirizacao_id,
        rotas, markers, maplink_info,
        peso, cubagem, doca, roteirizar
      ]
    );
    return result.rows[0];
  },

  // Atualizar romaneio existente
  async update(id, data) {
    // --- TRATAR CAMPOS JSON ---
    const camposJson = ['rotas', 'markers', 'maplink_info'];
    camposJson.forEach(key => {
      if (typeof data[key] === 'string') {
        try {
          data[key] = JSON.parse(data[key]);
        } catch (e) {
          data[key] = null;
        }
      }
    });

    // Garantir campos numéricos convertidos
    data.capacidade_veiculo = data.capacidade_veiculo ? Number(data.capacidade_veiculo) : null;
    data.peso = data.peso ? Number(data.peso) : null;
    data.cubagem = data.cubagem ? Number(data.cubagem) : null;

    const {
      numero, unidade, placa_cavalo, placa_carreta,
      emissao, motorista_id, capacidade_veiculo, roteirizacao, roteirizacao_id,
      rotas, markers, maplink_info,
      peso, cubagem, doca, roteirizar
    } = data;

    const result = await db.query(
      `UPDATE romaneios SET
        numero = $1, unidade = $2, placa_cavalo = $3, placa_carreta = $4,
        emissao = $5, motorista_id = $6, capacidade_veiculo = $7,
        roteirizacao = $8, roteirizacao_id = $9,
        rotas = $10, markers = $11, maplink_info = $12,
        peso = $13, cubagem = $14, doca = $15, roteirizar = $16,
        updated_at = NOW()
      WHERE id = $17 RETURNING *`,
      [
        numero, unidade, placa_cavalo, placa_carreta,
        emissao, motorista_id, capacidade_veiculo, roteirizacao, roteirizacao_id,
        rotas, markers, maplink_info,
        peso, cubagem, doca, roteirizar,
        id
      ]
    );
    return result.rows[0];
  },

  // Excluir romaneio
  async delete(id) {
    await db.query('DELETE FROM romaneios WHERE id = $1', [id]);
  }
};
