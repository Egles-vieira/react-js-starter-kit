import React, { useState } from 'react';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_BASE || 'https://app.roadweb.com.br';

export default function FormularioAlterarSenha({ id, onClose }) {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const token = localStorage.getItem('token');

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      toast.error('A nova senha e a confirmação não coincidem.');
      return;
    }

    try {
      const resp = await fetch(
        `${API_URL}/api/usuarios/${id}/change-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            currentPassword: form.currentPassword,
            newPassword: form.newPassword
          })
        }
      );
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Erro');
      toast.success(data.message);
      onClose();
    } catch (err) {
      toast.error(err.message || 'Falha ao alterar senha.');
    }
  };

  return (
    <div style={{ padding: 24, minWidth: 300 }}>
      <h3 style={{ marginBottom: 16 }}>
        Alterar senha do usuário #{id}
      </h3>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
        <div>
          <label>Senha atual</label>
          <input
            type="password"
            name="currentPassword"
            value={form.currentPassword}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
          />
        </div>
        <div>
          <label>Nova senha</label>
          <input
            type="password"
            name="newPassword"
            value={form.newPassword}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
          />
        </div>
        <div>
          <label>Confirmar nova senha</label>
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
          />
        </div>
        <div style={{ textAlign: 'right', marginTop: 8 }}>
          <button
            type="submit"
            style={{
              background: '#FF612B',
              color: '#fff',
              padding: '8px 16px',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer'
            }}
          >
            Salvar
          </button>
        </div>
      </form>
    </div>
  );
}
