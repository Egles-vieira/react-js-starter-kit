import React, { useEffect, useState } from 'react';
import API_URL from '../../services/Config';

const campos = [
  ['documento', 'Documento'],
  ['cod_cliente', 'Código Cliente'],
  ['nome', 'Nome'],
  ['cnpj', 'CNPJ'],
  ['inscricao_estadual', 'Inscrição Estadual'],
  ['endereco', 'Endereço'],
  ['bairro', 'Bairro'],
  ['cidade', 'Cidade'],
  ['uf', 'UF'],
  ['cep', 'CEP'],
  ['contato', 'Contato'],
];

const FormularioCliente = ({ clienteSelecionado, aoSalvar, aoCancelar }) => {
  const [cliente, setCliente] = useState({
    documento: '',
    cod_cliente: '',
    nome: '',
    endereco: '',
    bairro: '',
    cep: '',
    cidade: '',
    uf: '',
    contato: '',
    inscricao_estadual: '',
    cnpj: ''
  });

  useEffect(() => {
    if (clienteSelecionado) {
      setCliente(clienteSelecionado);
    }
  }, [clienteSelecionado]);

  const handleChange = (e) => {
    setCliente({ ...cliente, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const method = cliente.id ? 'PUT' : 'POST';
    const url = cliente.id
      ? `${API_URL}/api/clientes/${cliente.id}`
      : `${API_URL}/api/clientes`;

    const resposta = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(cliente)
    });

    if (resposta.ok) {
      const data = await resposta.json();
      aoSalvar(data);
    } else {
      alert('Erro ao salvar cliente');
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
        {cliente.id ? 'Editar Cliente' : 'Novo Cliente'}
      </h2>
      <form onSubmit={handleSubmit}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 30
        }}>
          {campos.map(([key, label]) => (
            <div key={key}>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#555' }}>{label}</label>
              <input
                type="text"
                name={key}
                value={cliente[key] ?? ''}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: 10,
                  fontSize: 14,
                  borderRadius: 6,
                  border: '1px solid #ccc',
                  marginTop: 4
                }}
                maxLength={key === 'uf' ? 2 : undefined}
                required={['documento', 'cod_cliente', 'nome'].includes(key)}
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
            {cliente.id ? 'Atualizar' : 'Cadastrar'}
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
};

export default FormularioCliente;
