import React, { useState, useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'https://app.roadweb.com.br';

export default function FormularioMotorista({ editar, motoristaSelecionado, onSalvo }) {
  const [form, setForm] = useState({
    nome: '',
    sobrenome: '',
    cpf: '',
    contato: '',
    email: '',
    foto_perfil: '',
    pais: '',
    estado: '',
    cidade: '',
    bairro: '',
    rua: '',
    numero: '',
    cep: '',
    unidade: '',
    send_mensagem: true,
    legislacao_id: ''
  });

  useEffect(() => {
    if (editar && motoristaSelecionado) {
      setForm(motoristaSelecionado);
    }
  }, [editar, motoristaSelecionado]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editar
      ? `${API_URL}/api/motoristas/${form.id}`
      : `${API_URL}/api/motoristas`;
    const method = editar ? 'PUT' : 'POST';

    try {
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!editar) setForm({
        nome: '',
        sobrenome: '',
        cpf: '',
        contato: '',
        email: '',
        foto_perfil: '',
        pais: '',
        estado: '',
        cidade: '',
        bairro: '',
        rua: '',
        numero: '',
        cep: '',
        unidade: '',
        send_mensagem: true,
        legislacao_id: ''
      });
      onSalvo();
    } catch (error) {
      console.error('Erro ao salvar motorista:', error);
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
        {editar ? 'Editar Motorista' : 'Novo Motorista'}
      </h2>
      <form onSubmit={handleSubmit}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 30
        }}>
          {[
            ['nome', 'Nome*'],
            ['sobrenome', 'Sobrenome'],
            ['cpf', 'CPF*'],
            ['contato', 'Contato'],
            ['email', 'E-mail'],
            ['foto_perfil', 'Foto de Perfil (URL)'],
            ['pais', 'País'],
            ['estado', 'Estado'],
            ['cidade', 'Cidade'],
            ['bairro', 'Bairro'],
            ['rua', 'Rua'],
            ['numero', 'Número'],
            ['cep', 'CEP'],
            ['unidade', 'Unidade'],
            ['legislacao_id', 'Legislação ID'],
          ].map(([key, label]) => (
            <div key={key}>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#555' }}>{label}</label>
              <input
                type="text"
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
                required={['nome', 'cpf'].includes(key)}
              />
            </div>
          ))}
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: '#555' }}>Receber Mensagem</label><br />
            <input
              type="checkbox"
              name="send_mensagem"
              checked={!!form.send_mensagem}
              onChange={handleChange}
              style={{ marginTop: 8 }}
            /> Sim
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
        </div>
      </form>
    </div>
  );
}
