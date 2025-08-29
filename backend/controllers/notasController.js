const db = require('../config/db');
const Notas = require('../models/notasModel');

async function buscarOuCriarCliente(cliente) {
  const {
    documento, cod_cliente, nome,
    endereco, bairro, cep, cidade, uf, contato
  } = cliente;

  let result = await db.query('SELECT id FROM clientes WHERE documento = $1', [documento]);
  if (result.rowCount > 0) {
    const id = result.rows[0].id;
    await db.query(
      `UPDATE clientes SET
        cod_cliente = $1, nome = $2,
        endereco = $3, bairro = $4, cep = $5,
        cidade = $6, uf = $7, contato = $8,
        updated_at = NOW()
      WHERE id = $9`,
      [cod_cliente, nome, endereco, bairro, cep, cidade, uf, contato, id]
    );
    return { id };
  }

  result = await db.query(
    `INSERT INTO clientes (
      documento, cod_cliente, nome,
      endereco, bairro, cep, cidade, uf, contato,
      created_at, updated_at
    ) VALUES (
      $1, $2, $3,
      $4, $5, $6, $7, $8, $9,
      NOW(), NOW()
    ) RETURNING id`,
    [documento, cod_cliente, nome, endereco, bairro, cep, cidade, uf, contato]
  );

  return result.rows[0];
}

async function buscarOuCriarEndereco(cliente_id, entrega) {
  const { endereco, cep } = entrega;
  let result = await db.query(
    'SELECT id FROM endereco_entrega WHERE cliente_id = $1 AND endereco = $2 AND cep = $3',
    [cliente_id, endereco, cep]
  );
  if (result.rowCount > 0) return result.rows[0];

  const endereco_completo = montarEnderecoCompleto(entrega);

  result = await db.query(
    'INSERT INTO endereco_entrega (cliente_id, endereco, bairro, cep, cidade, uf, doca, rota, endereco_completo, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()) RETURNING id',
    [cliente_id, entrega.endereco, entrega.bairro, cep, entrega.cidade, entrega.uf, entrega.doca, entrega.rota, endereco_completo]
  );
  return result.rows[0];
}

function montarEnderecoCompleto(entrega) {
  let partes = [
    entrega.endereco || '',
    entrega.bairro ? `- ${entrega.bairro}` : '',
    entrega.cidade ? `, ${entrega.cidade}` : '',
    entrega.uf ? `/${entrega.uf}` : '',
    entrega.cep ? `, CEP: ${entrega.cep}` : ''
  ];
  return partes.filter(Boolean).join(' ');
}

async function buscarOuCriarTransportadora(transp) {
  const { cnpj, nome, endereco, municipio, uf } = transp;
  let result = await db.query('SELECT id FROM transportadoras WHERE cnpj = $1', [cnpj]);
  if (result.rowCount > 0) return result.rows[0];

  result = await db.query(
    'INSERT INTO transportadoras (cnpj, nome, endereco, municipio, uf, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING id',
    [cnpj, nome, endereco, municipio, uf]
  );
  return result.rows[0];
}

async function buscarOuCriarEmbarcador(emb) {
  const { documento, nome } = emb;
  let result = await db.query('SELECT id FROM embarcadores WHERE documento = $1', [documento]);
  if (result.rowCount > 0) {
    const id = result.rows[0].id;
    await db.query(
      'UPDATE embarcadores SET nome = $1, updated_at = NOW() WHERE id = $2',
      [nome, id]
    );
    return { id };
  }

  result = await db.query(
    'INSERT INTO embarcadores (documento, nome, created_at, updated_at) VALUES ($1, $2, NOW(), NOW()) RETURNING id',
    [documento, nome]
  );
  return result.rows[0];
}

exports.importar = async (req, res) => {
  try {
    const { notfis } = req.body;
    if (!Array.isArray(notfis)) return res.status(400).json({ error: 'Formato inválido' });

    for (const nota of notfis) {
      const cliente = await buscarOuCriarCliente(nota.recebedor[0]);
      const endereco = await buscarOuCriarEndereco(cliente.id, nota.endereco_entrega[0]);
      const transportadora = await buscarOuCriarTransportadora(nota.transportadora[0]);
      const embarcador = await buscarOuCriarEmbarcador(nota.remetente[0]);

      const jaExiste = await Notas.findByChave(nota.chave_nf);
      if (!jaExiste) {
        await Notas.create({
          ...nota,
          cliente_id: cliente.id,
          endereco_entrega_id: endereco.id,
          transportadora_id: transportadora.id,
          embarcador_id: embarcador.id
        });
      }
    }

    res.json({ message: 'Importação concluída com sucesso.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao importar notas.' });
  }
};