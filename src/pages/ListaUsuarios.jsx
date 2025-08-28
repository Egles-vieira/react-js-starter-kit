// src/pages/usuarios/ListaUsuarios.js
import React, { useState, useEffect, useRef } from 'react';
import FormularioUsuario from './formularios/FormularioUsuario.jsx';
import FormularioAlterarSenha from './formularios/FormularioAlterarSenha';
import Modal from '../components/Modal';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { FiEdit, FiTrash, FiList, FiKey } from 'react-icons/fi';

const API_URL = process.env.REACT_APP_API_URL || 'https://app.roadweb.com.br';

export default function ListaUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editando, setEditando] = useState(false);
  const [selecionado, setSelecionado] = useState(null);
  const [showPwModal, setShowPwModal] = useState(false);
  const [userIdForPw, setUserIdForPw] = useState(null);

  const todasColunas = [
    { key: 'id', label: 'ID' },
    { key: 'nome', label: 'Nome' },
    { key: 'email', label: 'Email' },
    { key: 'perfil_id', label: 'Perfil ID' },
    { key: 'perfil_nome', label: 'Perfil' },
    { key: 'perfil_descricao', label: 'Descrição Perfil' },
    { key: 'ativo', label: 'Ativo' },
    { key: 'telefone', label: 'Telefone' },
    { key: 'foto_url', label: 'Foto URL' },
    { key: 'token_recuperacao', label: 'Token Recuperação' },
    { key: 'expira_token', label: 'Expira Token' },
    { key: 'ip_ultimo_login', label: 'IP Último Login' },
    { key: 'user_agent_ultimo_login', label: 'User Agent' },
    { key: 'created_by', label: 'Criado Por' },
    { key: 'updated_by', label: 'Atualizado Por' },
    { key: 'created_at', label: 'Criado Em' },
    { key: 'updated_at', label: 'Atualizado Em' }
  ];

  const [colunasSelecionadas, setColunasSelecionadas] = useState(
    todasColunas.map(col => col.key)
  );

  const popoverRef = useRef();
  const token = localStorage.getItem('token');
  const [mostrarPopover, setMostrarPopover] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setMostrarPopover(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const carregar = () => {
    setLoading(true);
    fetch(`${API_URL}/api/usuarios`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((r) => r.json())
      .then((data) => {
        setUsuarios(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        toast.error('Erro ao carregar usuários');
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    carregar();
  }, []);

  const editarUsuario = (u) => {
    setSelecionado(u);
    setEditando(true);
    setMostrarFormulario(true);
  };

  const excluirUsuario = (id) => {
    confirmAlert({
      title: 'Confirmar exclusão',
      message: 'Deseja realmente excluir este usuário?',
      buttons: [
        {
          label: 'Sim',
          onClick: async () => {
            try {
              const resp = await fetch(`${API_URL}/api/usuarios/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
              });
              if (resp.ok) {
                toast.success('Usuário excluído');
                carregar();
              } else {
                toast.error('Erro ao excluir usuário');
              }
            } catch (e) {
              toast.error('Erro ao excluir usuário');
              console.error(e);
            }
          }
        },
        { label: 'Cancelar' }
      ]
    });
  };

  const abreAlterarSenha = (id) => {
    setUserIdForPw(id);
    setShowPwModal(true);
  };

  const toggleColuna = (key) => {
    const nova = colunasSelecionadas.includes(key)
      ? colunasSelecionadas.filter((k) => k !== key)
      : [...colunasSelecionadas, key];
    setColunasSelecionadas(nova);
    localStorage.setItem('colunasSelecionadas', JSON.stringify(nova));
  };

  return (
    <div style={{ margin: '100 auto', maxWidth: 2300, padding: 40 }}>
      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>Usuários</h2>
      <button
        onClick={() => {
          setSelecionado(null);
          setEditando(false);
          setMostrarFormulario(true);
        }}
        style={{
          marginBottom: 12,
          padding: '8px 16px',
          background: '#FF612B',
          color: '#fff',
          border: 'none',
          borderRadius: 4,
          cursor: 'pointer'
        }}
      >
        + Novo Usuário
      </button>

      <Modal open={mostrarFormulario} onClose={() => setMostrarFormulario(false)}>
        <FormularioUsuario
          id={editando && selecionado ? selecionado.id : null}
          onSuccess={() => {
            carregar();
            setMostrarFormulario(false);
            setEditando(false);
          }}
        />
      </Modal>

      <Modal open={showPwModal} onClose={() => setShowPwModal(false)}>
        <FormularioAlterarSenha
          id={userIdForPw}
          onClose={() => setShowPwModal(false)}
        />
      </Modal>

      {loading ? (
        <Loader />
      ) : (
        <div style={{ overflowX: 'auto', maxHeight: '70vh', border: '1px solid #ccc', borderRadius: 8 }}>
          <table style={{ minWidth: 1200, width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f9f9f9', zIndex: 1 }}>
              <tr style={{ borderBottom: '2px solid #FF612B', color: '#333' }}>
                {todasColunas.map((c) => (
                  <th key={c.key} style={{ padding: 12, textAlign: 'left' }}>{c.label}</th>
                ))}
                <th style={{ padding: 12, textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u, i) => (
                <tr
                  key={u.id}
                  style={{
                    backgroundColor: i % 2 === 0 ? '#f9fcff' : '#fff',
                    transition: 'background 0.3s',
                    cursor: 'default'
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#e8f7ff'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = i % 2 === 0 ? '#f9fcff' : '#fff'}
                >
                  {todasColunas.map((c) => (
                    <td key={c.key} style={{ padding: 12 }}>{u[c.key]}</td>
                  ))}
                  <td style={{ padding: 12, textAlign: 'center' }}>
                    <button onClick={() => abreAlterarSenha(u.id)} title="Alterar senha" style={{ marginRight: 6, background: 'none', border: 'none', cursor: 'pointer' }}>
                      <FiKey />
                    </button>
                    <button onClick={() => editarUsuario(u)} title="Editar" style={{ marginRight: 6, background: 'none', border: 'none', cursor: 'pointer' }}>
                      <FiEdit />
                    </button>
                    <button onClick={() => excluirUsuario(u.id)} title="Excluir" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                      <FiTrash />
                    </button>
                  </td>
                </tr>
              ))}
              {usuarios.length === 0 && (
                <tr>
                  <td colSpan={todasColunas.length + 1} style={{ padding: 16, textAlign: 'center', color: '#888' }}>
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
