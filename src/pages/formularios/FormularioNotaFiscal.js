import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';


const API_URL = process.env.REACT_APP_API_URL || 'https://app.roadweb.com.br';
const token = localStorage.getItem('token');

const campos = [
  ['cliente_id', 'Cliente', 'select'],
  ['transportadora_id', 'Transportadora', 'select'],
  ['romaneio_id', 'Romaneio'],
  ['chave_nf', 'Chave NF'],
  ['nro', 'Nro'],
  ['nro_pedido', 'Nro Pedido'],
  ['nome_rep', 'Nome Rep'],
  ['valor', 'Valor'],
  ['peso_real', 'Peso Real'],
  ['qtd_volumes', 'Qtd Volumes'],
  ['previsao_entrega', 'Previsão Entrega', 'date'],
  ['finalizada', 'Finalizada', 'checkbox'],
  ['dias_entrega', 'Dias Entrega'],
  ['dias_atraso', 'Dias Atraso'],
  ['emi_nf', 'Emissão NF', 'readonly'],
];

export default function FormularioNotaFiscal({ editar, notaSelecionada, aoSalvar, aoCancelar }) {
  const [form, setForm] = useState({
    romaneio_id: '', cliente_id: '', embarcador_id: '', transportadora_id: '', chave_cte: '',
    cod_rep: '', nome_rep: '', emi_nf: '', ser_ctrc: '', nro_ctrc: '',
    peso_calculo: '', ordem: 0, observacoes: '', previsao_entrega: '', chave_nf: '', ser: '',
    nro: '', nro_pedido: '', peso_real: '', qtd_volumes: '', mensagem: '', valor: '', finalizada: false,
    dias_entrega: '', dias_atraso: ''
  });

  const [clientes, setClientes] = useState([]);
  const [transportadoras, setTransportadoras] = useState([]);

useEffect(() => {
  if (editar && notaSelecionada) setForm(notaSelecionada);
}, [editar, notaSelecionada]);

useEffect(() => {
  const token = localStorage.getItem('token');

  fetch(`${API_URL}/api/clientes`, { headers: { Authorization: `Bearer ${token}` } })
    .then(r => r.json())
    .then(setClientes)
    .catch(() => toast.error("Erro ao carregar clientes"));

  fetch(`${API_URL}/api/transportadoras`, { headers: { Authorization: `Bearer ${token}` } })
    .then(r => r.json())
    .then(setTransportadoras)
    .catch(() => toast.error("Erro ao carregar transportadoras"));
}, []);

const handleChange = e => {
  const { name, value, type, checked } = e.target;
  setForm(f => ({
    ...f,
    [name]: type === "checkbox" ? checked : value
  }));
};

const handleSubmit = async e => {
  e.preventDefault();
  const url = editar
    ? `${API_URL}/api/notaFiscal/${form.id}`
    : `${API_URL}/api/notaFiscal`;
  const method = editar ? 'PUT' : 'POST';

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(form)
    });

    if (response.ok) {
      toast.success(editar ? 'Nota fiscal atualizada com sucesso!' : 'Nota fiscal criada com sucesso!');
      aoSalvar();
    } else {
      const erro = await response.json();
      toast.error(erro?.message || 'Erro ao salvar nota fiscal!');
    }

  } catch (error) {
    toast.error('Erro ao salvar nota fiscal!');
    console.error(error);
  }
};

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{
        fontSize: 18,
        fontWeight: 600,
        marginBottom: 20,
        color: '#333',
        borderBottom: '1px solid #e0e0e0',
        paddingBottom: 10
      }}>
        {form.id ? 'Editar Nota Fiscal' : 'Nova Nota Fiscal'}
      </h2>
      <form onSubmit={handleSubmit}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 30
        }}>
          {campos.map(([key, label, tipo]) => {
            if (tipo === 'select' && key === 'cliente_id') {
              return (
                <div key={key}>
                  <label style={{ fontSize: 13, fontWeight: 500, color: '#555' }}>{label}</label>
                  <select
                    name={key}
                    value={form[key] || ''}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: 10,
                      fontSize: 14,
                      borderRadius: 6,
                      border: '1px solid #ccc',
                      marginTop: 4
                    }}
                    required
                  >
                    <option value="">Selecione...</option>
                    {clientes.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.nome} ({c.cod_cliente})
                      </option>
                    ))}
                  </select>
                </div>
              );
            }
            if (tipo === 'select' && key === 'transportadora_id') {
              return (
                <div key={key}>
                  <label style={{ fontSize: 13, fontWeight: 500, color: '#555' }}>{label}</label>
                  <select
                    name={key}
                    value={form[key] || ''}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: 10,
                      fontSize: 14,
                      borderRadius: 6,
                      border: '1px solid #ccc',
                      marginTop: 4,
                              border: '1px solid #ccc',
                outline: 'none',
              }}
                onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px #00bfff'}
                onBlur={(e) => e.target.style.boxShadow = '0 0 0 2px transparent'}
                  >
                    <option value="">Selecione...</option>
                    {transportadoras.map(t => (
                      <option key={t.id} value={t.id}>{t.nome}</option>
                    ))}
                  </select>
                </div>
              );
            }
            if (tipo === 'checkbox') {
              return (
                <div key={key}>
                  <label style={{ fontSize: 13, fontWeight: 500, color: '#555' }}>{label}</label><br />
                  <input
                    type="checkbox"
                    name={key}
                    checked={!!form[key]}
                    onChange={handleChange}
                    style={{
                      marginTop: 4,
                      width: 18,
                      height: 18,
                    }}
                  />
                </div>
              );
            }
            if (tipo === 'readonly') {
              return (
                <div key={key}>
                  <label style={{ fontSize: 13, fontWeight: 500, color: '#555' }}>{label}</label>
                  <input
                    type="text"
                    name={key}
                    value={form[key] || ''}
                    readOnly
                    style={{
                      width: '100%',
                      padding: 10,
                      fontSize: 14,
                      borderRadius: 6,
                      border: '1px solid #ccc',
                      marginTop: 4,
                      background: '#eee',
                      color: '#888',
                      cursor: 'not-allowed'
                    }}
                  />
                </div>
              );
            }
            return (
              <div key={key}>
                <label style={{ fontSize: 13, fontWeight: 500, color: '#555' }}>{label}</label>
                <input
                  type={tipo === 'date' ? 'date' : 'text'}
                  name={key}
                  value={form[key] ?? ''}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: 10,
                    fontSize: 14,
                    borderRadius: 6,
                    border: '1px solid #ccc',
                    marginTop: 4
                  }}
                />
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 24, textAlign: 'right' }}>
          <button type="submit" style={{
            backgroundColor: '#FF612B',
            color: '#fff',
            padding: '10px 24px',
            borderRadius: 6,
            border: 'none',
            fontWeight: 'bold',
            fontSize: 14,
            cursor: 'pointer'
          }}>
            {form.id ? 'Atualizar' : 'Cadastrar'}
          </button>
          <button
            type="button"
            onClick={aoCancelar}
            style={{
              marginLeft: 12,
              backgroundColor: '#ccc',
              color: '#333',
              padding: '10px 24px',
              borderRadius: 6,
              border: 'none',
              fontWeight: 'bold',
              fontSize: 14,
              cursor: 'pointer'
            }}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
