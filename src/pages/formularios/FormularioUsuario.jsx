
// src/pages/usuarios/formularios/FormularioUsuario.js
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const API_URL = process.env.REACT_APP_API_URL || 'https://app.roadweb.com.br';

export default function FormularioUsuario({ id, onSuccess }) {
  const [form, setForm] = useState({
    nome: '',
    email: '',
    senha: '',
    perfil_id: '',
    ativo: true,
    telefone: '',
    foto_url: ''
  });

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (id) {
      fetch(`${API_URL}/api/usuarios/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(r => r.json())
        .then(data => setForm({
          nome: data.nome || '',
          email: data.email || '',
          senha: '',
          perfil_id: data.perfil_id || '',
          ativo: data.ativo ?? true,
          telefone: data.telefone || '',
          foto_url: data.foto_url || ''
        }))
        .catch(() => toast.error('Erro ao carregar usuário'));
    }
  }, [id, token]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const url = id
      ? `${API_URL}/api/usuarios/${id}`
      : `${API_URL}/api/usuarios`;
    const method = id ? 'PUT' : 'POST';

    const payload = {
      ...form,
      perfil_id: parseInt(form.perfil_id, 10)
    };

    if (id && !payload.senha) {
      delete payload.senha;
    }

    try {
      const resp = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (!resp.ok) throw new Error();
      toast.success(id ? 'Usuário atualizado!' : 'Usuário criado!');
      onSuccess();
    } catch {
      toast.error('Erro ao salvar usuário');
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
        {id ? 'Editar Usuário' : 'Novo Usuário'}
      </h2>
      <form onSubmit={handleSubmit}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 30
        }}>
          <div>
            <label>Nome</label>
            <input
              name="nome"
              value={form.nome}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc' }}
            />
          </div>
          <div>
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc' }}
            />
          </div>
          <div>
            <label>Senha {id && '(deixe em branco para não alterar)'}</label>
            <input
              type="password"
              name="senha"
              value={form.senha}
              onChange={handleChange}
              required={!id}
              style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc' }}
            />
          </div>
          <div>
            <label>Perfil (ID)</label>
            <input
              type="number"
              name="perfil_id"
              value={form.perfil_id}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc' }}
            />
          </div>
          <div>
            <label>Telefone</label>
            <input
              name="telefone"
              value={form.telefone}
              onChange={handleChange}
              style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc' }}
            />
          </div>
          <div>
            <label>URL da Foto</label>
            <input
              name="foto_url"
              value={form.foto_url}
              onChange={handleChange}
              style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 6 }}>
              <input
                type="checkbox"
                name="ativo"
                checked={form.ativo}
                onChange={handleChange}
                style={{ marginRight: 8 }}
              />
              Usuário ativo
            </label>
          </div>
        </div>
        <div style={{ marginTop: 24, textAlign: 'right' }}>
          <button
            type="submit"
            style={{
              backgroundColor: '#FF612B',
              color: '#fff',
              padding: '10px 24px',
              borderRadius: 6,
              border: 'none',
              fontWeight: 'bold',
              fontSize: 14,
              cursor: 'pointer'
            }}
          >
            {id ? 'Atualizar' : 'Cadastrar'}
          </button>
        </div>
      </form>
    </div>
  );
}