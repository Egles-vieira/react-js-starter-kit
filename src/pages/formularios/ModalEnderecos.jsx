import React, { useEffect, useState } from 'react';

const modalStyle = {
  backdrop: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.4)',
    zIndex: 999,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  container: {
    background: '#fff',
    padding: 24,
    borderRadius: 10,
    width: '90%',
    maxWidth: 1100,
    maxHeight: '95vh',
    overflowY: 'auto',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
  }
};

const API_URL = import.meta.env.VITE_API_BASE || 'https://app.roadweb.com.br';

export default function ModalEnderecos({ cliente, onClose }) {
  const [enderecos, setEnderecos] = useState([]);
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState({
    endereco: '', bairro: '', cep: '', cidade: '', uf: '',
    coordenadas: '', janela_horario: '', doca: '',
    lat: '', lon: '', endereco_completo: '', restricao_logistica_id: '', restrito: false,
    janela1: '', janela2: '', janela3: '', janela4: '', rota: ''
  });

  const token = localStorage.getItem('token');

  function carregar() {
    fetch(`${API_URL}/api/enderecos?cliente_id=${cliente.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => setEnderecos(data))
      .catch(console.error);
  }

  useEffect(() => { carregar(); }, [cliente.id]);

  function limparForm() {
    setForm({
      endereco: '', bairro: '', cep: '', cidade: '', uf: '',
      coordenadas: '', janela_horario: '', doca: '',
      lat: '', lon: '', endereco_completo: '', restricao_logistica_id: '', restrito: false,
      janela1: '', janela2: '', janela3: '', janela4: '', rota: ''
    });
    setEditando(false);
  }

  function preencherForm(endereco) {
    setEditando(endereco.id);
    setForm({
      ...endereco,
      coordenadas: endereco.coordenadas ? JSON.stringify(endereco.coordenadas) : '',
      janela_horario: endereco.janela_horario ? JSON.stringify(endereco.janela_horario) : ''
    });
  }

  async function salvar(e) {
    e.preventDefault();
    const method = editando ? 'PUT' : 'POST';
    const url = editando
      ? `${API_URL}/api/enderecos/${editando}`
      : `${API_URL}/api/enderecos`;

    let payload = { ...form, cliente_id: cliente.id };
    // Converter para tipos corretos
    if (typeof payload.coordenadas === 'string' && payload.coordenadas) {
      try { payload.coordenadas = JSON.parse(payload.coordenadas); } catch { }
    }
    if (typeof payload.janela_horario === 'string' && payload.janela_horario) {
      try { payload.janela_horario = JSON.parse(payload.janela_horario); } catch { }
    }
    payload.lat = payload.lat ? parseFloat(payload.lat) : null;
    payload.lon = payload.lon ? parseFloat(payload.lon) : null;
    payload.restricao_logistica_id = payload.restricao_logistica_id ? parseInt(payload.restricao_logistica_id) : null;

    const resp = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    if (resp.ok) {
      carregar();
      limparForm();
    } else {
      alert('Erro ao salvar endereço');
    }
  }

  async function excluir(id) {
    if (window.confirm('Excluir este endereço?')) {
      await fetch(`${API_URL}/api/enderecos/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      carregar();
    }
  }

  return (
    <div style={modalStyle.backdrop}>
      <div style={modalStyle.container}>
        <h2 style={{
          fontSize: 18,
          fontWeight: 600,
          marginBottom: 20,
          color: '#333',
          borderBottom: '1px solid #e0e0e0',
          paddingBottom: 10
        }}>
          Endereços do Cliente: <span style={{ color: '#FF612B' }}>{cliente.nome}</span>
        </h2>

        {/* FORMULÁRIO */}
        <form onSubmit={salvar}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 30
          }}>
            {[
              ['endereco', 'Endereço'],
              ['bairro', 'Bairro'],
              ['cep', 'CEP'],
              ['cidade', 'Cidade'],
              ['uf', 'UF'],
              ['doca', 'Doca'],
              ['lat', 'Latitude'],
              ['lon', 'Longitude'],
              ['endereco_completo', 'Endereço Completo'],
              ['restricao_logistica_id', 'Restrição Logística ID'],
              ['rota', 'Rota'],
              ['janela1', 'Janela 1'],
              ['janela2', 'Janela 2'],
              ['janela3', 'Janela 3'],
              ['janela4', 'Janela 4'],
              ['coordenadas', 'Coordenadas (JSON)'],
              ['janela_horario', 'Janela Horário (JSON)']
            ].map(([key, label]) => (
              <div key={key}>
                <label style={{ fontSize: 13, fontWeight: 500, color: '#555' }}>{label}</label>
                <input
                  type="text"
                  name={key}
                  value={form[key] ?? ''}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: 10,
                    fontSize: 14,
                    borderRadius: 6,
                    border: '1px solid #ccc',
                    marginTop: 4
                  }}
                  maxLength={key === 'uf' ? 2 : undefined}
                />
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                checked={!!form.restrito}
                onChange={e => setForm(f => ({ ...f, restrito: e.target.checked }))}
              />
              <label style={{ fontSize: 13, color: '#555' }}>Restrito</label>
            </div>
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
              {editando ? 'Atualizar' : 'Cadastrar'}
            </button>
            {editando && (
              <button
                type="button"
                onClick={limparForm}
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
                }}>
                Cancelar
              </button>
            )}
          </div>
        </form>

        {/* GRID DE ENDEREÇOS */}
        <div style={{ marginTop: 32 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead style={{
              position: 'sticky',
              top: 0,
              backgroundColor: '#f9f9f9',
              zIndex: 1,
              boxShadow: '0px 2px 4px rgba(0,0,0,0.05)'
            }}>
              <tr style={{ borderBottom: '2px solid #FF612B', color: '#333' }}>
                <th style={{ padding: 12, textAlign: 'left', fontWeight: 600 }}></th>
                <th style={{ padding: 12, textAlign: 'left', fontWeight: 600 }}>ID</th>
                <th style={{ padding: 12, textAlign: 'left', fontWeight: 600 }}>Endereço</th>
                <th style={{ padding: 12, textAlign: 'left', fontWeight: 600 }}>Bairro</th>
                <th style={{ padding: 12, textAlign: 'left', fontWeight: 600 }}>Cidade</th>
                <th style={{ padding: 12, textAlign: 'left', fontWeight: 600 }}>UF</th>
                <th style={{ padding: 12, textAlign: 'left', fontWeight: 600 }}>CEP</th>
                <th style={{ padding: 12, textAlign: 'left', fontWeight: 600 }}>Latitude</th>
                <th style={{ padding: 12, textAlign: 'left', fontWeight: 600 }}>Longitude</th>
                <th style={{ padding: 12, textAlign: 'left', fontWeight: 600 }}>Rodizio</th>
                <th style={{ padding: 12, textAlign: 'left', fontWeight: 600 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {enderecos.map((e, i) => (
                <tr
                  key={e.id}
                  style={{
                    backgroundColor: i % 2 === 0 ? '#f4f8fb' : '#ffffff',
                    cursor: 'pointer'
                  }}
                >
                  <td style={{ padding: 12 }}><input type="checkbox" /></td>
                  <td style={{ padding: 12 }}>{e.id}</td>
                  <td style={{ padding: 12 }}>{e.endereco}</td>
                  <td style={{ padding: 12 }}>{e.bairro}</td>
                  <td style={{ padding: 12 }}>{e.cidade}</td>
                  <td style={{ padding: 12 }}>{e.uf}</td>
                  <td style={{ padding: 12 }}>{e.cep}</td>
                  <td style={{ padding: 12 }}>{e.lat}</td>
                  <td style={{ padding: 12 }}>{e.lon}</td>
                  <td style={{ padding: 12 }}>{e.restrito ? 'Sim' : 'Não'}</td>
                  <td style={{ padding: 12 }}>
                    <button
                      onClick={() => preencherForm(e)}
                      style={{
                        background: '#FF612B',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 6,
                        padding: '4px 10px',
                        marginRight: 8,
                        cursor: 'pointer'
                      }}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => excluir(e.id)}
                      style={{
                        background: '#d32f2f',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 6,
                        padding: '4px 10px',
                        cursor: 'pointer'
                      }}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
              {enderecos.length === 0 && (
                <tr>
                  <td colSpan={12} style={{ padding: 16, textAlign: 'center', color: '#888' }}>
                    Nenhum endereço encontrado para este cliente.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* BOTÃO FECHAR */}
        <div style={{ textAlign: 'right', marginTop: 18 }}>
          <button
            onClick={onClose}
            style={{
              background: '#ccc',
              color: '#000',
              border: 'none',
              padding: '8px 16px',
              borderRadius: 6,
              marginTop: 10,
              cursor: 'pointer'
            }}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
