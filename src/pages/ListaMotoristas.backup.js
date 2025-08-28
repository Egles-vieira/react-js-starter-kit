import React, { useState, useEffect, useRef } from 'react';
import FormularioMotorista from './formularios/FormularioMotorista';
import Modal from '../components/Modal';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { FiEdit, FiTrash, FiList } from 'react-icons/fi';
import FiltroMotoristas from './../components/FiltroMotoristas';

const API_URL = process.env.REACT_APP_API_URL || 'https://app.roadweb.com.br';

export default function ListaMotoristas() {
  const [motoristas, setMotoristas] = useState([]);
  const [motoristasOriginais, setMotoristasOriginais] = useState([]);
  const [editando, setEditando] = useState(false);
  const [selecionado, setSelecionado] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mostrarPopover, setMostrarPopover] = useState(false);

  const todasColunas = [
    { key: "id_motorista", label: "ID" },
    { key: "nome", label: "Nome" },
    { key: "sobrenome", label: "Sobrenome" },
    { key: "cpf", label: "CPF" },
    { key: "contato", label: "Contato" },
    { key: "email", label: "Email" },
    { key: "pais", label: "País" },
    { key: "estado", label: "Estado" },
    { key: "cidade", label: "Cidade" },
    { key: "bairro", label: "Bairro" },
    { key: "rua", label: "Rua" },
    { key: "numero", label: "Número" },
    { key: "cep", label: "CEP" },
    { key: "unidade", label: "Base" },
    { key: "ultima_atualizacao", label: "Última Atualização" },
    { key: "send_mensagem", label: "Recebe Mensagem?" },
    { key: "placa",      label: "Placa" },
    { key: "modelo",     label: "Modelo" },
    { key: "marca",      label: "Marca" },
    { key: "ano",        label: "Ano" },
    { key: "cor",        label: "Cor" },
    { key: "renavam",    label: "Renavam" },
    { key: "capacidade", label: "Capacidade" },
    { key: "tipo",       label: "Tipo" },
    { key: "observacoes",label: "Observações" }
  ];

  const colunasSalvas = JSON.parse(localStorage.getItem('colunasSelecionadasMotoristas')) || todasColunas.map(c => c.key);
  const [colunasSelecionadas, setColunasSelecionadas] = useState(colunasSalvas);
  const popoverRef = useRef();
  const token = localStorage.getItem('token');


  // util p/ formatar data/horário
  const formatarData = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    // garante exibição no fuso de SP
    return d.toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false
    });
  };

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
    fetch(`${API_URL}/api/motoristas`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        const lista = Array.isArray(data) ? data : [];
        setMotoristas(lista);
        setMotoristasOriginais(lista);
        setTimeout(() => setLoading(false), 900);
        if (!Array.isArray(data) && data && data.error) {
          toast.error(data.error);
        }
      })
      .catch(err => {
        setMotoristas([]);
        setLoading(false);
        toast.error("Erro ao carregar motoristas");
        console.error(err);
      });
  };

  useEffect(() => { carregar(); }, []);

  const editar = (motorista) => {
    setSelecionado(motorista);
    setEditando(true);
    setMostrarFormulario(true);
  };

  const excluir = async (id_motorista) => {
    confirmAlert({
      title: 'Confirmar exclusão',
      message: 'Deseja realmente excluir este motorista?',
      buttons: [
        {
          label: 'Sim',
          onClick: async () => {
            try {
              const response = await fetch(`${API_URL}/api/motoristas/${id_motorista}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
              });
              if (response.ok) {
                toast.success('Motorista excluído com sucesso!');
                carregar();
              } else {
                toast.error('Erro ao excluir motorista');
              }
            } catch (error) {
              toast.error('Erro ao excluir motorista');
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
    localStorage.setItem('colunasSelecionadasMotoristas', JSON.stringify(atualizadas));
  };

  return (
    
    <div style={{ margin: '0 auto', maxWidth: 2000, padding: 40 }}>
      <FiltroMotoristas
  onFiltrar={filtros => {
    const filtradas = motoristasOriginais.filter(m =>
      (!filtros.nome || m.nome?.toLowerCase().includes(filtros.nome.toLowerCase())) &&
      (!filtros.cpf || m.cpf?.includes(filtros.cpf)) &&
      (!filtros.unidade || m.unidade?.toLowerCase().includes(filtros.unidade.toLowerCase()))
    );
    setMotoristas(filtradas);
  }}
  onNovo={() => {
    setMostrarFormulario(true);
    setEditando(false);
    setSelecionado(null);
  }}
/>
      <Modal open={mostrarFormulario} onClose={() => setMostrarFormulario(false)}>
        <FormularioMotorista
          editar={editando}
          motoristaSelecionado={selecionado}
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
              {motoristas.map((m, i) => (
                <tr key={m.id_motorista} style={{
                  backgroundColor: i % 2 === 0 ? '#f9fcff' : '#fff',
                  transition: 'background 0.3s',
                  cursor: 'default'
                }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#e8f7ff'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = i % 2 === 0 ? '#f9fcff' : '#fff'}>
                  {todasColunas.filter(c => colunasSelecionadas.includes(c.key)).map(col => (
                    <td key={col.key} style={{ padding: 12 }}>
                    {(() => {
  // colunas que vêm de veiculo
  const veicCols = ['placa','modelo','marca','ano','cor','renavam','capacidade','tipo','observacoes'];
  if (col.key === 'send_mensagem') {
    return m.send_mensagem ? 'Sim' : 'Não';
      } else if (col.key === 'ultima_atualizacao') {
    return formatarData(m.ultima_atualizacao);
  } else if (veicCols.includes(col.key)) {
    return m.veiculo?.[col.key] ?? '';
  } else {
    return m[col.key] ?? '';
  }
})()}
                    </td>
                  ))}
                  <td style={{ padding: 12, textAlign: 'center' }}>
                    <button onClick={() => editar(m)} title="Editar" style={{ marginRight: 6, background: 'none', border: 'none', cursor: 'pointer' }}>
                      <FiEdit />
                    </button>
                    <button onClick={() => excluir(m.id_motorista)} title="Excluir" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                      <FiTrash />
                    </button>
                  </td>
                </tr>
              ))}
              {motoristas.length === 0 && (
                <tr>
                  <td colSpan={colunasSelecionadas.length + 1} style={{ padding: 16, textAlign: 'center', color: '#888' }}>
                    Nenhum motorista encontrado.
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
