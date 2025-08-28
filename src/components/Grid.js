import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { FaBatteryFull, FaTachometerAlt, FaHeadphonesAlt, FaRoute, } from 'react-icons/fa';
import { FiList } from 'react-icons/fi';

function formatUTCToBrasilia(isoString) {
  if (!isoString) return '-';
  const date = new Date(isoString);
  return date.toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}


export default function Grid({
  driversHoje,
  selectedId,
  handleRowClick,
  estaOffline,
  riscoPorMotorista,
  handleOpenAudiosModal,
  AUDIO_URL,
  now,
  onRouteRequest
}) {
  // Cabeçalhos da tabela
  const headers = useMemo(() => [
    'Ativo', 'Nome', 'Sobrenome', 'CPF', 'Telefone', 'Base', 'Status', 'Offline', 'Risco', 'Rota',
    'Veículo',  'Lat', 'Lng', ' Bat / Vel', 'Última Atualização'
  ], []);

// filtros de colunas no grid
  const allColumns = [
    { key: 'ativo', label: 'Ativo' },
    { key: 'nome', label: 'Nome' },
    { key: 'sobrenome', label: 'Sobrenome' },
    { key: 'cpf', label: 'CPF' },
    { key: 'telefone', label: 'Telefone' },
    { key: 'unidade', label: 'Base' },
    { key: 'status', label: 'Status' },
    { key: 'offline', label: 'Offline' },
    { key: 'risco', label: 'Risco' },
    { key: 'rota', label: 'Rota' },
    { key: 'veiculo', label: 'Veículo' },
    { key: 'lat', label: 'Lat' },
    { key: 'lng', label: 'Lng' },
    { key: 'velbat', label: 'Vel / Bat' },
    { key: 'atualizacao', label: 'Última Atualização' },
  ];

  const saved = JSON.parse(localStorage.getItem('gridColunasSelecionadas')) 
                || allColumns.map(c => c.key);
  const [colunasSelecionadas, setColunasSelecionadas] = useState(saved);

  const toggleColuna = key => {
    const atual = colunasSelecionadas.includes(key)
      ? colunasSelecionadas.filter(k => k !== key)
      : [...colunasSelecionadas, key];
    setColunasSelecionadas(atual);
    localStorage.setItem('gridColunasSelecionadas', JSON.stringify(atual));
  };

  // Larguras padrão e estado de larguras (persistidas no localStorage)
  const defaultWidths = useMemo(() => [70,70, 70, 100, 100,380, 100, 100, 120, 120, 120, 140, 100, 120, 120], []);
  const [colWidths, setColWidths] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('GridColWidths') || '[]');
      if (Array.isArray(saved) && saved.length === defaultWidths.length) return saved;
    } catch {}
    return defaultWidths;
  });
  
  // 2) ref para fechar/posicionar o popover se quiser
  const [mostrarPopover, setMostrarPopover] = useState(false);
  const popoverRef = useRef(null);

  // Refs para controle de redimensionamento
  const resizingCol = useRef(null);
  const startX = useRef(0);
  const startWidth = useRef(0);

  // Handlers de evento para redimensionar
  const handleMouseMove = useCallback((e) => {
    if (resizingCol.current === null) return;
    const delta = e.clientX - startX.current;
    const idx = resizingCol.current;
    const newWidth = Math.max(30, startWidth.current + delta);
    setColWidths((w) => {
      const next = [...w];
      next[idx] = newWidth;
      return next;
    });
  }, []);

  const handleMouseUp = useCallback(() => {
    if (resizingCol.current !== null) {
      localStorage.setItem('GridColWidths', JSON.stringify(colWidths));
      resizingCol.current = null;
    }
  }, [colWidths]);

  const handleMouseDown = (e, idx) => {
    resizingCol.current = idx;
    startX.current = e.clientX;
    startWidth.current = colWidths[idx];
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // Lógica existente: dedupe, persist filtros, status, rota...
  const [filtroAtivo, setFiltroAtivo] = useState(() => localStorage.getItem('filtroAtivo') || 'todos');
  useEffect(() => { localStorage.setItem('filtroAtivo', filtroAtivo); }, [filtroAtivo]);

  const uniqueDrivers = useMemo(() => {
    const seen = new Set();
    return driversHoje.filter(d => {
      if (seen.has(d.id_motorista)) return false;
      seen.add(d.id_motorista);
      return true;
    });
  }, [driversHoje]);

  const [ativos, setAtivos] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ativos')) || {}; } catch { return {}; }
  });

  const [loadingRoute, setLoadingRoute] = useState(null);

  const handleToggleAtivo = (idMotorista, novoStatus) => {
    const novos = { ...ativos, [idMotorista]: novoStatus };
    setAtivos(novos);
    localStorage.setItem('ativos', JSON.stringify(novos));
  };

  const handleBuscarRota = async (motorista) => {
    if (!onRouteRequest) return;
    setLoadingRoute(motorista.id_motorista);
    try {
      await onRouteRequest(motorista.id_motorista);
      handleRowClick(motorista);
    } catch (error) {
      console.error('Erro ao buscar rota:', error);
      alert('Erro ao carregar rota do motorista');
    } finally {
      setLoadingRoute(null);
    }
  };

  const driversComAtivo = uniqueDrivers.map(r => ({
    ...r,
    ativo: typeof ativos[r.id_motorista] === 'boolean' ? ativos[r.id_motorista] : !!r.ativo
  }));

  const sortedDrivers = [...driversComAtivo].sort((a, b) => {
    const aOff = estaOffline(a.localizacao_timestamp);
    const bOff = estaOffline(b.localizacao_timestamp);
    if (aOff && !bOff) return -1;
    if (!aOff && bOff) return 1;
    if (aOff && bOff) {
      const getMin = ts => Math.floor((now - new Date(ts).getTime()) / 60000);
      return getMin(b.localizacao_timestamp) - getMin(a.localizacao_timestamp);
    }
    return 0;
  });

  const driversFiltrados = sortedDrivers.filter(r => {
    if (filtroAtivo === 'ativos') return r.ativo;
    if (filtroAtivo === 'inativos') return !r.ativo;
    return true;
  });

  return (
    <div style={{ background: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', height: '100%', overflow: 'auto',  }}>
      <div style={{ padding: '10px 15px' }}>
        <label style={{ marginRight: 10 }}>Filtrar motoristas:</label>
        <select value={filtroAtivo} onChange={e => setFiltroAtivo(e.target.value)}
          style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: 14 }}>
          <option value="todos">Todos</option>
          <option value="ativos">Ativos</option>
          <option value="inativos">Inativos</option>
        </select>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, tableLayout: 'fixed' }}>
        <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
          <tr style={{ backgroundColor: '#dbddddff', color: '#1F2D3D', fontWeight: 'bold', textTransform: 'uppercase' }}>
            {/* cabeçalhos visíveis */}
            {allColumns
              .filter(col => colunasSelecionadas.includes(col.key))
              .map((col, i) => (
                <th
                  key={col.key}
                  style={{ padding: '10px 8px', textAlign: 'left', position: 'relative', width: colWidths[i] }}
                >
                  {col.label}
                  <div
                    style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '5px', cursor: 'col-resize', zIndex: 5 }}
                    onMouseDown={e => handleMouseDown(e, i)}
                  />
                </th>
              ))
            }

            {/* botão de colunas */}
            <th style={{ padding: '10px', textAlign: 'center', width: 40 }}>
              <button
                onClick={() => setMostrarPopover(v => !v)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <FiList size={18} />
              </button>
            </th>
          </tr>
      </thead>
        {mostrarPopover && (
        <div
          ref={popoverRef}
          style={{
            position: 'absolute',
            top: 50,    // ajuste conforme seu layout
            right: 20,
            background: '#fff',
            border: '1px solid #ccc',
            padding: 8,
            borderRadius: 6,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            zIndex: 1000
          }}
        >
          {allColumns.map(col => (
            <label key={col.key} style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>
              <input
                type="checkbox"
                checked={colunasSelecionadas.includes(col.key)}
                onChange={() => toggleColuna(col.key)}
                style={{ marginRight: 6 }}
              />
              {col.label}
            </label>
          ))}
        </div>
      )}

       <tbody>
  {driversFiltrados.map((r, i) => {
    const off = estaOffline(r.localizacao_timestamp);
    const isSel = r.id_motorista === selectedId;
    const isLoadingRoute = loadingRoute === r.id_motorista;

    return (
      <tr
        key={r.id_motorista}
        style={{
          backgroundColor: isSel ? '#b2ebf2' : i % 2 === 0 ? '#f9f9f9' : '#ffffff',
          cursor: 'pointer',
          transition: 'background 0.3s'
        }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#e0f7fa'}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = isSel ? '#b2ebf2' : i % 2 === 0 ? '#f9f9f9' : '#ffffff'}
      >
        {allColumns
          .filter(col => colunasSelecionadas.includes(col.key))
          .map((col, j) => {
            // para manter o redimensionamento alinhado
            const origIdx = allColumns.findIndex(c => c.key === col.key);
            const width = colWidths[origIdx];

            let cellContent;
            switch (col.key) {
              case 'ativo':
                cellContent = (
                  <input
                    type="checkbox"
                    checked={!!r.ativo}
                    onChange={e => {
                      e.stopPropagation();
                      handleToggleAtivo(r.id_motorista, e.target.checked);
                    }}
                    style={{ width: 18, height: 18, margin: 0, accentColor: '#FF612B', cursor: 'pointer', transform: 'scale(1.1)' }}
                  />
                );
                break;

              case 'nome':
                cellContent = r.nome;
                break;
              case 'sobrenome':
                cellContent = r.sobrenome;
                break;
              case 'cpf':
                cellContent = r.cpf;
                break;
              case 'telefone':
                cellContent = r.contato;
                break;
                 case 'unidade':
                cellContent = r.unidade;
                break;

              case 'status':
                cellContent = (
                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: '12px',
                      color: '#fff',
                      backgroundColor: off ? '#d32f2f' : '#388e3c',
                      animation: off ? 'pulse-strong-red 1.2s infinite' : undefined
                    }}
                  >
                    {off ? 'Offline' : 'Online'}
                  </span>
                );
                break;

              case 'offline':
                cellContent = off
                  ? (() => {
                      const diff = now - new Date(r.localizacao_timestamp).getTime();
                      const m = Math.floor(diff / 60000);
                      const s = Math.floor((diff % 60000) / 1000);
                      return `${m}m ${s}s`;
                    })()
                  : '—';
                break;

              case 'risco':
                const nivel = riscoPorMotorista[r.id_motorista]?.nivel;
                cellContent = (
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '4px 16px',
                      borderRadius: '12px',
                      textAlign: 'center',
                      fontWeight: 500,
                      color:
                        nivel === 'vermelho'
                          ? '#fff'
                          : nivel === 'amarelo'
                          ? '#000'
                          : '#555',
                      backgroundColor:
                        nivel === 'vermelho'
                          ? '#d32f2f'
                          : nivel === 'amarelo'
                          ? '#ffc107'
                          : '#e0e0e0',
                      animation:
                        nivel === 'vermelho'
                          ? 'pulse-strong-red 1s infinite'
                          : nivel === 'amarelo'
                          ? 'pulse-risk 1.2s infinite'
                          : undefined
                    }}
                  >
                    {nivel === 'vermelho'
                      ? 'Parado >15min'
                      : nivel === 'amarelo'
                      ? 'Parado >10min'
                      : 'Normal'}
                  </span>
                );
                break;

              case 'rota':
                cellContent = (
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      handleBuscarRota(r);
                    }}
                    disabled={isLoadingRoute}
                    style={{
                      backgroundColor: isLoadingRoute ? '#cccccc' : '#FF6B35',
                      color: '#fff',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      cursor: isLoadingRoute ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontWeight: 'bold',
                      justifyContent: 'center'
                    }}
                  >
                    <FaRoute />
                    {isLoadingRoute ? '...' : ''}
                  </button>
                );
                break;

              case 'veiculo':
                cellContent = `${r.placa || '-'} - ${r.modelo || '-'} - ${r.cor || '-'} - ${r.ano || '-'}`;
                break;

              case 'lat':
                cellContent = r.latitude || '-';
                break;
              case 'lng':
                cellContent = r.longitude || '-';
                break;

               case 'velbat':
                cellContent = `${r.velocidade != null ? r.velocidade + ' km/h' : '-'} / ${r.bateria != null ? r.bateria + '%' : '-'}`;
                break;

              case 'atualizacao':
                cellContent = r.localizacao_timestamp
                  ? formatUTCToBrasilia(r.localizacao_timestamp)
                  : '-';
                break;

              default:
                cellContent = '-';
            }

            return (
              <td
                key={col.key}
                onClick={() => handleRowClick(r)}
                style={{ padding: '10px 8px', width }}
              >
                {cellContent}
              </td>
            );
          })}
      </tr>
    );
  })}
</tbody>
      </table>

      {/* Animações inline */}
      <style>
        {`@keyframes pulse-red {0% {background-color:rgb(231,231,231);}50% {background-color: #ff0000;}100% {background-color:rgb(172,172,172);}}@keyframes pulse-strong-red {0% {background-color:#d32f2f;}50% {background-color:#ff0000;}100% {background-color:#d32f2f;}}@keyframes pulse-risk {0%{background-color:#ffc107;}50%{background-color:#ff8f00;}100%{background-color:#ffc107;}}`}
      </style>
    </div>
  );
}
