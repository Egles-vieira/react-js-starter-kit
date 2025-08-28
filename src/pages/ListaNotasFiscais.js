
import React, { useState, useEffect, useRef } from 'react';
import FormularioNotaFiscal from './formularios/FormularioNotaFiscal';
import Modal from '../components/Modal';
import Loader from '../components/Loader';
import FiltroNotas from '../components/FiltroNotas';
import { toast } from 'react-toastify';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { FiEdit, FiTrash, FiMoreVertical, FiList } from 'react-icons/fi';

const API_URL = process.env.REACT_APP_API_URL || 'https://app.roadweb.com.br';

export default function ListaNotasFiscais() {
  const [notas, setNotas] = useState([]);
  const [notasOriginais, setNotasOriginais] = useState([]);
  const [editando, setEditando] = useState(false);
  const [selecionado, setSelecionado] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mostrarPopover, setMostrarPopover] = useState(false);

  const todasColunas = [
    { key: "id", label: "ID" },
    { key: "cliente_nome", label: "Cliente" },
    { key: "cliente_cod_cliente", label: "Cód. Cliente" },
    { key: "romaneio_id", label: "Romaneio" },
    { key: "chave_nf", label: "Chave NF" },
    { key: "nro", label: "Nro" },
    { key: "nro_pedido", label: "Nro Pedido" },
    { key: "nome_rep", label: "Nome Rep" },
    { key: "transportadora_nome", label: "Transportadora" },
    { key: "valor", label: "Valor" },
    { key: "peso_real", label: "Peso" },
    { key: "qtd_volumes", label: "Qtd Volumes" },
    { key: "previsao_entrega", label: "Previsão Entrega" },
    { key: "finalizada", label: "Finalizada" },
    { key: "emi_nf", label: "Emissão nota" },
    { key: "endereco_entrega_completo", label: "Endereço entrega" },
    { key: "dias_entrega", label: "Dias Entrega" },
    { key: "dias_atraso", label: "Dias Atraso" },
  ];

  const colunasSalvas = JSON.parse(localStorage.getItem('colunasSelecionadas')) || todasColunas.map(c => c.key);
  const [colunasSelecionadas, setColunasSelecionadas] = useState(colunasSalvas);
  const popoverRef = useRef();
  const token = localStorage.getItem('token');

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
    fetch(`${API_URL}/api/notaFiscal`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        const lista = Array.isArray(data) ? data : [];
        setNotas(lista);
        setNotasOriginais(lista);
        setTimeout(() => setLoading(false), 900);
        if (!Array.isArray(data) && data && data.error) {
          toast.error(data.error);
        }
      })
      .catch(err => {
        setNotas([]);
        setLoading(false);
        toast.error("Erro ao carregar notas fiscais");
        console.error(err);
      });
  };

  useEffect(() => { carregar(); }, []);

  const editar = (nota) => {
    setSelecionado(nota);
    setEditando(true);
    setMostrarFormulario(true);
  };

  const excluir = async (id) => {
    confirmAlert({
      title: 'Confirmar exclusão',
      message: 'Deseja realmente excluir esta nota fiscal?',
      buttons: [
        {
          label: 'Sim',
          onClick: async () => {
            try {
              const response = await fetch(`${API_URL}/api/notaFiscal/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
              });
              if (response.ok) {
                toast.success('Nota fiscal excluída com sucesso!');
                carregar();
              } else {
                toast.error('Erro ao excluir nota fiscal');
              }
            } catch (error) {
              toast.error('Erro ao excluir nota fiscal');
              console.error(error);
            }
          }
        },
        { label: 'Cancelar', onClick: () => {} }
      ]
    });
  };

  const toggleColuna = (key) => {
    const atualizadas = colunasSelecionadas.includes(key)
      ? colunasSelecionadas.filter(k => k !== key)
      : [...colunasSelecionadas, key];
    setColunasSelecionadas(atualizadas);
    localStorage.setItem('colunasSelecionadas', JSON.stringify(atualizadas));
  };

  return (
    <div style={{ margin: '100 auto', maxWidth: 2300, padding: 40 }}>
      <FiltroNotas onFiltrar={(filtros) => {
        const filtradas = notasOriginais.filter(n =>
          (!filtros.chave_nf || n.chave_nf?.includes(filtros.chave_nf)) &&
          (!filtros.nro_pedido || String(n.nro_pedido).includes(filtros.nro_pedido))
        );
        setNotas(filtradas);
      }} />

      <Modal open={mostrarFormulario} onClose={() => setMostrarFormulario(false)}>
        <FormularioNotaFiscal
          editar={editando}
          notaSelecionada={selecionado}
          aoSalvar={() => {
            carregar();
            setMostrarFormulario(false);
            setEditando(false);
            setSelecionado(null);
          }}
          aoCancelar={() => setMostrarFormulario(false)}
        />
      </Modal>

      {loading ? <Loader /> : (
        <div style={{ overflowX: 'auto', maxHeight: '70vh', border: '1px solid #ccc', borderRadius: 8 }}>
          {mostrarPopover && (
            <div ref={popoverRef} style={{
              position: 'absolute', top: 0, right: 10, background: '#fff', border: '1px solid #ccc',
              borderRadius: 6, padding: 10, maxHeight: 250, width: 220, overflowY: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 9999
            }}>
              {todasColunas.map(col => (
                <div key={col.key} style={{ marginBottom: 6 }}>
                  <label style={{ cursor: 'pointer' }}>
                    <input type="checkbox" checked={colunasSelecionadas.includes(col.key)} onChange={() => toggleColuna(col.key)} style={{ marginRight: 8 }} />
                    {col.label}
                  </label>
                </div>
              ))}
            </div>
          )}
          <table style={{ minWidth: 1200, width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f9f9f9', zIndex: 1 }}>
              <tr style={{ borderBottom: '2px solid #FF612B', color: '#333' }}>
                {todasColunas.filter(c => colunasSelecionadas.includes(c.key)).map(col => (
                  <th key={col.key} style={{ padding: 12, textAlign: 'left' }}>{col.label}</th>
                ))}
                <th style={{ padding: 12, textAlign: 'center' }}>
                  <button onClick={() => setMostrarPopover(!mostrarPopover)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                    <FiList size={18} />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {notas.map((n, i) => (
                <tr key={n.id} style={{
                  backgroundColor: i % 2 === 0 ? '#f9fcff' : '#fff',
                  transition: 'background 0.3s',
                  cursor: 'default'
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#e8f7ff'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = i % 2 === 0 ? '#f9fcff' : '#fff'}>
                  {todasColunas.filter(c => colunasSelecionadas.includes(c.key)).map(col => (
                    <td key={col.key} style={{ padding: 12 }}>{n[col.key]}</td>
                  ))}
                  <td style={{ padding: 12, textAlign: 'center' }}>
                    <button onClick={() => editar(n)} title="Editar" style={{ marginRight: 6, background: 'none', border: 'none', cursor: 'pointer' }}>
                      <FiEdit />
                    </button>
                    <button onClick={() => excluir(n.id)} title="Excluir" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                      <FiTrash />
                    </button>
                  </td>
                </tr>
              ))}
              {notas.length === 0 && (
                <tr>
                  <td colSpan={colunasSelecionadas.length + 1} style={{ padding: 16, textAlign: 'center', color: '#888' }}>
                    Nenhuma nota fiscal encontrada.
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