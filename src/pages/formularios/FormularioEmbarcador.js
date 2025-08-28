
import React, { useState, useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'https://app.roadweb.com.br';

export default function FormularioEmbarcador({ editar, embarcadorSelecionado, onSalvo }) {
  const [form, setForm] = useState({
    documento: '',
    nome: '',
    inscricao_estadual: '',
    cnpj: '',
    endereco: '',
    bairro: '',
    cidade: '',
    cep: '',
    uf: ''
  });

  useEffect(() => {
    if (editar && embarcadorSelecionado) {
      setForm(embarcadorSelecionado);
    }
  }, [editar, embarcadorSelecionado]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editar
      ? `${API_URL}/api/embarcadores/${form.id}`
      : `${API_URL}/api/embarcadores`;
    const method = editar ? 'PUT' : 'POST';

    try {
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!editar) setForm({
        documento: '',
        nome: '',
        inscricao_estadual: '',
        cnpj: '',
        endereco: '',
        bairro: '',
        cidade: '',
        cep: '',
        uf: ''
      });
      onSalvo();
    } catch (error) {
      console.error('Erro ao salvar embarcador:', error);
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
        {editar ? 'Editar Embarcador' : 'Novo Embarcador'}
      </h2>
      <form onSubmit={handleSubmit}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 30
        }}>
          {[
            ['documento', 'Documento'],
            ['nome', 'Nome'],
            ['inscricao_estadual', 'Inscrição Estadual'],
            ['cnpj', 'CNPJ'],
            ['endereco', 'Endereço'],
            ['bairro', 'Bairro'],
            ['cidade', 'Cidade'],
            ['uf', 'UF'],
            ['cep', 'CEP']
          ].map(([key, label]) => (
            <div key={key}>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#555' }}>{label}</label>
              <input
                type="text"
                name={key}
                value={form[key]}
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
          ))}
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
        </div>
      </form>
    </div>
  );
}