import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { FaBatteryFull, FaTachometerAlt, FaHeadphonesAlt, FaRoute } from 'react-icons/fa';
import { FiList, FiFilter } from 'react-icons/fi';

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
    'Veículo', 'Lat', 'Lng', 'Bat / Vel', 'Última Atualização'
  ], []);

  // Filtros de colunas no grid
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
  const defaultWidths = useMemo(() => [70, 70, 70, 100, 100, 380, 100, 100, 120, 120, 120, 140, 100, 120, 120], []);
  const [colWidths, setColWidths] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('GridColWidths') || '[]');
      if (Array.isArray(saved) && saved.length === defaultWidths.length) return saved;
    } catch {}
    return defaultWidths;
  });
  
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
    <div className="table-container h-full overflow-auto">
      {/* Filtros */}
      <div className="flex items-center gap-4 p-4 bg-muted border-b">
        <div className="flex items-center gap-2">
          <FiFilter className="text-muted-foreground" />
          <label className="text-sm font-medium text-foreground">Filtrar motoristas:</label>
          <select 
            value={filtroAtivo} 
            onChange={e => setFiltroAtivo(e.target.value)}
            className="px-3 py-1 border border-input rounded-md bg-background text-foreground text-sm focus:ring-2 focus:ring-ring"
          >
            <option value="todos">Todos</option>
            <option value="ativos">Ativos</option>
            <option value="inativos">Inativos</option>
          </select>
        </div>
      </div>

      <div className="relative">
        <table className="w-full border-collapse text-sm" style={{ tableLayout: 'fixed' }}>
          <thead className="sticky top-0 z-10">
            <tr>
              {/* Cabeçalhos visíveis */}
              {allColumns
                .filter(col => colunasSelecionadas.includes(col.key))
                .map((col, i) => (
                  <th
                    key={col.key}
                    className="table-header-cell border-r border-border last:border-r-0"
                    style={{ width: colWidths[i] }}
                  >
                    {col.label}
                    <div
                      className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/20 z-20"
                      onMouseDown={e => handleMouseDown(e, i)}
                    />
                  </th>
                ))
              }

              {/* Botão de colunas */}
              <th className="table-header-cell w-10 text-center">
                <button
                  onClick={() => setMostrarPopover(v => !v)}
                  className="p-1 hover:bg-accent rounded transition-colors"
                  title="Configurar colunas"
                >
                  <FiList size={16} />
                </button>
              </th>
            </tr>
          </thead>

          <tbody>
            {driversFiltrados.map((r, i) => {
              const off = estaOffline(r.localizacao_timestamp);
              const isSel = r.id_motorista === selectedId;
              const isLoadingRoute = loadingRoute === r.id_motorista;

              return (
                <tr
                  key={r.id_motorista}
                  className={`table-row border-b border-border ${isSel ? 'selected' : ''}`}
                >
                  {allColumns
                    .filter(col => colunasSelecionadas.includes(col.key))
                    .map((col, j) => {
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
                              className="w-4 h-4 rounded border-border text-primary focus:ring-ring cursor-pointer"
                            />
                          );
                          break;

                        case 'nome':
                          cellContent = <span className="font-medium">{r.nome}</span>;
                          break;
                        case 'sobrenome':
                          cellContent = r.sobrenome;
                          break;
                        case 'cpf':
                          cellContent = <span className="font-mono text-xs">{r.cpf}</span>;
                          break;
                        case 'telefone':
                          cellContent = <span className="font-mono text-xs">{r.contato}</span>;
                          break;
                        case 'unidade':
                          cellContent = <span className="text-muted-foreground">{r.unidade}</span>;
                          break;

                        case 'status':
                          cellContent = (
                            <span className={`status-badge ${off ? 'status-offline pulse-danger' : 'status-online'}`}>
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
                                return <span className="font-mono text-xs text-destructive font-medium">{m}m {s}s</span>;
                              })()
                            : <span className="text-muted-foreground">—</span>;
                          break;

                        case 'risco':
                          const nivel = riscoPorMotorista[r.id_motorista]?.nivel;
                          cellContent = (
                            <span className={`status-badge ${
                              nivel === 'vermelho' ? 'status-danger pulse-danger' :
                              nivel === 'amarelo' ? 'status-warning pulse-warning' :
                              'status-normal'
                            }`}>
                              {nivel === 'vermelho' ? 'Parado >15min' :
                               nivel === 'amarelo' ? 'Parado >10min' :
                               'Normal'}
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
                              className={`inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                                isLoadingRoute 
                                  ? 'bg-muted text-muted-foreground cursor-not-allowed' 
                                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
                              }`}
                            >
                              <FaRoute size={12} />
                              {isLoadingRoute ? 'Carregando...' : 'Ver Rota'}
                            </button>
                          );
                          break;

                        case 'veiculo':
                          cellContent = (
                            <div className="text-xs">
                              <div className="font-medium">{r.placa || '-'}</div>
                              <div className="text-muted-foreground">{r.modelo || '-'} • {r.cor || '-'} • {r.ano || '-'}</div>
                            </div>
                          );
                          break;

                        case 'lat':
                          cellContent = <span className="font-mono text-xs">{r.latitude || '-'}</span>;
                          break;
                        case 'lng':
                          cellContent = <span className="font-mono text-xs">{r.longitude || '-'}</span>;
                          break;

                        case 'velbat':
                          cellContent = (
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1">
                                <FaTachometerAlt className="text-primary" size={12} />
                                <span className="text-xs font-mono">{r.velocidade != null ? `${r.velocidade} km/h` : '-'}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <FaBatteryFull 
                                  className={r.bateria > 50 ? 'text-success' : r.bateria > 20 ? 'text-warning' : 'text-destructive'} 
                                  size={12} 
                                />
                                <span className="text-xs font-mono">{r.bateria != null ? `${r.bateria}%` : '-'}</span>
                              </div>
                            </div>
                          );
                          break;

                        case 'atualizacao':
                          cellContent = (
                            <span className="text-xs font-mono text-muted-foreground">
                              {r.localizacao_timestamp ? formatUTCToBrasilia(r.localizacao_timestamp) : '-'}
                            </span>
                          );
                          break;

                        default:
                          cellContent = '-';
                      }

                      return (
                        <td
                          key={col.key}
                          onClick={() => handleRowClick(r)}
                          className="table-cell border-r border-border last:border-r-0"
                          style={{ width }}
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

        {/* Popover de configuração de colunas */}
        {mostrarPopover && (
          <div
            ref={popoverRef}
            className="absolute top-16 right-4 bg-popover border border-border rounded-lg shadow-lg p-3 z-50 min-w-48"
          >
            <h3 className="font-medium text-sm mb-2 text-popover-foreground">Configurar Colunas</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {allColumns.map(col => (
                <label key={col.key} className="flex items-center gap-2 text-sm text-popover-foreground hover:bg-accent/50 p-1 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={colunasSelecionadas.includes(col.key)}
                    onChange={() => toggleColuna(col.key)}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-ring"
                  />
                  {col.label}
                </label>
              ))}
            </div>
            <div className="mt-3 pt-2 border-t border-border">
              <button
                onClick={() => setMostrarPopover(false)}
                className="w-full px-3 py-1 text-xs bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
