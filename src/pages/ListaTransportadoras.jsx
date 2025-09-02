import React, { useState, useEffect } from 'react';
import FormularioTransportadora from './formularios/FormularioTransportadora';

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
    maxWidth: 900,
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
  }
};

const API_URL = process.env.REACT_APP_API_URL || 'https://app.roadweb.com.br';

export default function ListaTransportadoras() {
  const [transportadoras, setTransportadoras] = useState([]);
  const [editando, setEditando] = useState(false);
  const [selecionado, setSelecionado] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const carregar = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/transportadoras`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Ensure we always set an array
        setTransportadoras(Array.isArray(data) ? data : []);
      } else {
        setError(data.error || 'Erro ao carregar transportadoras');
        setTransportadoras([]);
      }
    } catch (err) {
      console.error('Erro ao carregar transportadoras:', err);
      setError('Erro de conexão com o servidor');
      setTransportadoras([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  const editar = (transportadora) => {
    setSelecionado(transportadora);
    setEditando(true);
    setMostrarFormulario(true);
  };

  const excluir = async (id) => {
    if (window.confirm('Deseja realmente excluir esta transportadora?')) {
      await fetch(`${API_URL}/api/transportadoras/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      carregar();
    }
  };

  return (
    <div style={{ margin: '0 auto', maxWidth: 2200, padding: 20, fontFamily: 'Poppins, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1>Transportadoras</h1>
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
            <FormularioTransportadora
              editar={editando}
              selecionado={selecionado}
              aoSalvar={() => {
                carregar();
                setMostrarFormulario(false);
                setEditando(false);
                setSelecionado(null);
              }}
              aoCancelar={() => setMostrarFormulario(false)}
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

      {error && (
        <div style={{ 
          backgroundColor: '#fee', 
          border: '1px solid #fcc', 
          color: '#c00', 
          padding: 12, 
          borderRadius: 6, 
          marginBottom: 20 
        }}>
          {error}
        </div>
      )}

      {loading && (
        <div style={{ 
          textAlign: 'center', 
          padding: 20, 
          color: '#666' 
        }}>
          Carregando transportadoras...
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
            {["", "ID", "CNPJ", "Nome", "Endereço", "Município", "UF", "Integração Ocorrência", "Romaneio Auto", "Roteirização Automática", "Ações"].map((col, i) => (
              <th key={i} style={{ padding: 12, textAlign: 'left', fontWeight: 600 }}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {transportadoras.map((e, i) => (
            <tr
              key={e.id}
              style={{
                backgroundColor: i % 2 === 0 ? '#f4f8fb' : '#ffffff',
                cursor: 'pointer'
              }}
            >
              <td style={{ padding: 12 }}>
                <input type="checkbox" />
              </td>
              <td style={{ padding: 12 }}>{e.id}</td>
              <td style={{ padding: 12 }}>{e.cnpj}</td>
              <td style={{ padding: 12 }}>{e.nome}</td>
              <td style={{ padding: 12 }}>{e.endereco}</td>
              <td style={{ padding: 12 }}>{e.municipio}</td>
              <td style={{ padding: 12 }}>{e.uf}</td>
              <td style={{ padding: 12 }}>{e.integracao_ocorrencia}</td>
              <td style={{ padding: 12 }}>{e.romaneio_auto ? 'Sim' : 'Não'}</td>
              <td style={{ padding: 12 }}>{e.roterizacao_automatica ? 'Sim' : 'Não'}</td>
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
            </tr>
          ))}
          {!loading && transportadoras.length === 0 && !error && (
            <tr>
              <td colSpan={12} style={{ padding: 16, textAlign: 'center', color: '#888' }}>
                Nenhuma transportadora encontrada.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
