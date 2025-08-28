import React, { useState, useEffect } from 'react';
import FormularioEmbarcador from './formularios/FormularioEmbarcador';

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
    maxWidth: 800,
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
  }
};

const API_URL = process.env.REACT_APP_API_URL || 'https://app.roadweb.com.br';

export default function Embarcadores() {
  const [embarcadores, setEmbarcadores] = useState([]);
  const [editando, setEditando] = useState(false);
  const [selecionado, setSelecionado] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const token = localStorage.getItem('token');

  const carregar = () => {
    fetch(`${API_URL}/api/embarcadores`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(r => r.json())
      .then(setEmbarcadores)
      .catch(console.error);
  };

  useEffect(() => {
    carregar();
  }, []);

  const editar = (embarcador) => {
    setSelecionado(embarcador);
    setEditando(true);
    setMostrarFormulario(true);
  };


  const excluir = async (id) => {
    if (window.confirm('Deseja realmente excluir este embarcador?')) {
      await fetch(`${API_URL}/api/embarcadores/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      carregar();
    }
  };


  return (
    <div style={{ margin: '0 auto', maxWidth: 2200, padding: 20, fontFamily: 'Poppins, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 24 }}>
        <button
          onClick={() => {
            setMostrarFormulario(true);
            setEditando(false);
            setSelecionado(null);
          }}
          style={{
            backgroundColor: '#FF612B',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '10px 20px',
            fontSize: 14,
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
          }}
        >
          + Cadastrar
        </button>
      </div>

      {mostrarFormulario && (
        <div style={modalStyle.backdrop}>
          <div style={modalStyle.container}>
            <FormularioEmbarcador
              editar={editando}
              embarcadorSelecionado={selecionado}
              onSalvo={() => {
                carregar();
                setMostrarFormulario(false);
                setEditando(false);
                setSelecionado(null);
              }}
            />
            <div style={{ textAlign: 'right' }}>
              <button
                onClick={() => setMostrarFormulario(false)}
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
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead style={{
          position: 'sticky',
          top: 0,
          backgroundColor: '#f9f9f9',
          zIndex: 1,
          boxShadow: '0px 2px 4px rgba(0,0,0,0.05)'
        }}>
          <tr style={{ borderBottom: '2px solid #FF612B', color: '#333' }}>
            {["", "ID", "Documento", "Nome", "CNPJ", "Inscrição Estadual", "Endereço", "Bairro", "Cidade", "UF", "CEP", "Ações"].map((col, i) => (
              <th key={i} style={{ padding: 12, textAlign: 'left', fontWeight: 600 }}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {embarcadores.map((e, i) => (
            <HoverableRow key={e.id} even={i % 2 === 0}>
              <td style={{ padding: 12 }}>
                <input type="checkbox" />
              </td>
              <td style={{ padding: 12 }}>{e.id}</td>
              <td style={{ padding: 12 }}>{e.documento}</td>
              <td style={{ padding: 12 }}>{e.nome}</td>
              <td style={{ padding: 12 }}>{e.cnpj}</td>
              <td style={{ padding: 12 }}>{e.inscricao_estadual}</td>
              <td style={{ padding: 12 }}>{e.endereco}</td>
              <td style={{ padding: 12 }}>{e.bairro}</td>
              <td style={{ padding: 12 }}>{e.cidade}</td>
              <td style={{ padding: 12 }}>{e.uf}</td>
              <td style={{ padding: 12 }}>{e.cep}</td>
              <td style={{ padding: 12 }}>
                <button
                  onClick={() => editar(e)}
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
            </HoverableRow>
          ))}
          {embarcadores.length === 0 && (
            <tr>
              <td colSpan={12} style={{ padding: 16, textAlign: 'center', color: '#888' }}>
                Nenhum embarcador encontrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// Componente para destacar linhas ao passar o mouse
function HoverableRow({ children, even }) {
  const [hovered, setHovered] = useState(false);
  return (
    <tr
      style={{
        backgroundColor: hovered ? '#e0f2f1' : (even ? '#f4f8fb' : '#fff'),
        transition: 'background 0.15s'
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </tr>
  );
}
