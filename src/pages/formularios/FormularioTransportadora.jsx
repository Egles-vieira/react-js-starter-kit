import React, { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_BASE || 'https://app.roadweb.com.br';

const campos = [
  ['cnpj', 'CNPJ'],
  ['nome', 'Nome'],
  ['endereco', 'Endereço'],
  ['municipio', 'Município'],
  ['uf', 'UF'],
  ['integracao_ocorrencia', 'Integração Ocorrência'],
  ['romaneio_auto', 'Romaneio Automático'],
  ['roterizacao_automatica', 'Roteirização Automática']
];

export default function FormularioTransportadora({ editar, selecionado, aoSalvar, aoCancelar }) {
  const [form, setForm] = useState({
    cnpj: '', nome: '', endereco: '', municipio: '', uf: '',
    integracao_ocorrencia: '', romaneio_auto: false, roterizacao_automatica: false
  });

  useEffect(() => {
    if (editar && selecionado) setForm(selecionado);
  }, [editar, selecionado]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const url = editar
      ? `${API_URL}/api/transportadoras/${form.id}`
      : `${API_URL}/api/transportadoras`;
    const method = editar ? 'PUT' : 'POST';

    const resposta = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(form)
    });

    if (resposta.ok) {
      const data = await resposta.json();
      aoSalvar(data);
    } else {
      alert('Erro ao salvar transportadora');
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
        {editar ? 'Editar Transportadora' : 'Nova Transportadora'}
      </h2>
      <form onSubmit={handleSubmit}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 30
        }}>
          {[
            ['cnpj', 'CNPJ'],
            ['nome', 'Nome'],
            ['endereco', 'Endereço'],
            ['municipio', 'Município'],
            ['uf', 'UF'],
            ['integracao_ocorrencia', 'Integração Ocorrência'],
          ].map(([key, label]) => (
            <div key={key}>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#555' }}>{label}</label>
              <input
                type="text"
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
                required={['cnpj', 'nome', 'endereco', 'municipio', 'uf'].includes(key)}
                maxLength={key === 'uf' ? 2 : undefined}
              />
            </div>
          ))}
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: '#555' }}>Romaneio Automático</label>
            <input
              type="checkbox"
              name="romaneio_auto"
              checked={!!form.romaneio_auto}
              onChange={handleChange}
              style={{ marginLeft: 8 }}
            />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: '#555' }}>Roteirização Automática</label>
            <input
              type="checkbox"
              name="roterizacao_automatica"
              checked={!!form.roterizacao_automatica}
              onChange={handleChange}
              style={{ marginLeft: 8 }}
            />
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
            {editar ? 'Atualizar' : 'Cadastrar'}
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
