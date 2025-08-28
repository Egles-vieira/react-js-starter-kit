import React, { useState, useEffect } from 'react';
import FormularioCliente from './formularios/FormularioCliente';
import ModalEnderecos from './formularios/ModalEnderecos';
import Modal from '../components/Modal';
import Loader from '../components/Loader'; // Importa o Loader

const API_URL = process.env.REACT_APP_API_URL || 'https://app.roadweb.com.br';

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [editando, setEditando] = useState(false);
  const [selecionado, setSelecionado] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarEnderecos, setMostrarEnderecos] = useState(false);
  const [clienteEnderecos, setClienteEnderecos] = useState(null);
  const [loading, setLoading] = useState(true);

  const carregar = () => {
    setLoading(true);
    fetch(`${API_URL}/api/clientes`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(r => r.json())
    .then(data => {
  setClientes(data);
  setTimeout(() => setLoading(false), 2000); // força 1 segundo de loader
})
      .catch(e => {
        setLoading(false);
        console.error(e);
      });
  };

  useEffect(() => {
    carregar();
    // eslint-disable-next-line
  }, []);

  const editar = (cliente) => {
    setSelecionado(cliente);
    setEditando(true);
    setMostrarFormulario(true);
  };

  const token = localStorage.getItem('token');
  const excluir = async (id) => {
    if (window.confirm('Deseja realmente excluir este cliente?')) {
      await fetch(`${API_URL}/api/clientes/${id}`, {
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1>Clientes</h1>
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

      {/* MODAL FORM CLIENTE */}
      <Modal open={mostrarFormulario} onClose={() => setMostrarFormulario(false)}>
        <FormularioCliente
          editar={editando}
          clienteSelecionado={selecionado}
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
      </Modal>

      {loading ? (
        <Loader />
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead style={{
            position: 'sticky',
            top: 0,
            backgroundColor: '#f9f9f9',
            zIndex: 1,
            boxShadow: '0px 2px 4px rgba(0,0,0,0.05)'
          }}>
            <tr style={{ borderBottom: '2px solid #FF612B', color: '#333' }}>
              {["", "ID", "Documento", "Código", "Nome", "CNPJ", "Inscrição Estadual", "Endereço", "Bairro", "Cidade", "UF", "CEP", "Contato", "Ações"].map((col, i) => (
                <th key={i} style={{ padding: 12, textAlign: 'left', fontWeight: 600 }}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {clientes.map((e, i) => (
              <tr
                key={e.id}
                style={{
                  backgroundColor: i % 2 === 0 ? '#f4f8fb' : '#ffffff',
                  cursor: 'pointer'
                }}
                onMouseEnter={el => el.currentTarget.style.backgroundColor = '#e0f2f1'}
                onMouseLeave={el => el.currentTarget.style.backgroundColor = i % 2 === 0 ? '#f4f8fb' : '#ffffff'}
              >
                <td style={{ padding: 12 }}>
                  <input type="checkbox" />
                </td>
                <td style={{ padding: 12 }}>{e.id}</td>
                <td style={{ padding: 12 }}>{e.documento}</td>
                <td style={{ padding: 12 }}>{e.cod_cliente}</td>
                <td style={{ padding: 12 }}>{e.nome}</td>
                <td style={{ padding: 12 }}>{e.cnpj}</td>
                <td style={{ padding: 12 }}>{e.inscricao_estadual}</td>
                <td style={{ padding: 12 }}>{e.endereco}</td>
                <td style={{ padding: 12 }}>{e.bairro}</td>
                <td style={{ padding: 12 }}>{e.cidade}</td>
                <td style={{ padding: 12 }}>{e.uf}</td>
                <td style={{ padding: 12 }}>{e.cep}</td>
                <td style={{ padding: 12 }}>{e.contato}</td>
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
                  <button
                    onClick={() => {
                      setClienteEnderecos(e);
                      setMostrarEnderecos(true);
                    }}
                    style={{
                      background: '#4682B4',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 6,
                      padding: '4px 10px',
                      marginRight: 8,
                      cursor: 'pointer'
                    }}
                  >
                    Endereços
                  </button>
                </td>
              </tr>
            ))}
            {clientes.length === 0 && (
              <tr>
                <td colSpan={14} style={{ padding: 16, textAlign: 'center', color: '#888' }}>
                  Nenhum cliente encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {/* Outras modais, exemplo Endereços */}
      {mostrarEnderecos && clienteEnderecos && (
        <ModalEnderecos
          cliente={clienteEnderecos}
          onClose={() => setMostrarEnderecos(false)}
        />
      )}
    </div>
  );
}
