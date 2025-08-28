import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Route, Settings, Filter, ChevronDown, Zap, Activity, AlertTriangle, Clock } from 'lucide-react';
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
  onRouteRequest,
  ativos: propsAtivos,
  setAtivos: propsSetAtivos
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
    if (propsAtivos !== undefined) return propsAtivos;
    try { return JSON.parse(localStorage.getItem('ativos')) || {}; } catch { return {}; }
  });

  const [loadingRoute, setLoadingRoute] = useState(null);

  const handleToggleAtivo = (idMotorista, novoStatus) => {
    const novos = { ...ativos, [idMotorista]: novoStatus };
    setAtivos(novos);
    if (propsSetAtivos) {
      propsSetAtivos(novos);
    }
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
    <div className="h-full overflow-hidden border-0 shadow-lg bg-white">
      {/* Header with filters */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <FiFilter className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-900">Filtrar motoristas:</span>
            </div>
            <select 
              value={filtroAtivo} 
              onChange={e => setFiltroAtivo(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors min-w-[120px]"
            >
              <option value="todos">Todos</option>
              <option value="ativos">Ativos</option>
              <option value="inativos">Inativos</option>
            </select>
          </div>
          
          <div className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
            {driversFiltrados.length} motoristas
          </div>
        </div>
      </div>

      {/* Table container */}
      <div className="overflow-auto h-full">
        <table className="w-full border-collapse text-sm" style={{ tableLayout: 'fixed' }}>
          <thead className="sticky top-0 z-10 bg-gray-50">
            <tr className="border-b border-gray-200">
              {/* Cabeçalhos visíveis */}
              {allColumns
                .filter(col => colunasSelecionadas.includes(col.key))
                .map((col, i) => (
                  <th
                    key={col.key}
                    className="p-3 text-left font-semibold text-gray-900 uppercase text-xs tracking-wider relative bg-gray-50 border-r border-gray-200 last:border-r-0"
                    style={{ width: colWidths[i] }}
                  >
                    {col.label}
                    <div
                      className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-400 transition-colors"
                      onMouseDown={e => handleMouseDown(e, i)}
                    />
                  </th>
                ))
              }

              {/* Botão de colunas */}
              <th className="p-3 text-center w-10 bg-gray-50">
                <button
                  onClick={() => setMostrarPopover(v => !v)}
                  className="h-6 w-6 p-0 hover:bg-gray-200 rounded transition-colors"
                  title="Configurar colunas"
                >
                  <Settings className="w-4 h-4 text-gray-600 mx-auto" />
                </button>
                
                {/* Popover simples */}
                {mostrarPopover && (
                  <div className="absolute right-0 mt-2 w-56 p-3 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm mb-3 text-gray-900">Colunas visíveis</h4>
                      {allColumns.map(col => (
                        <div key={col.key} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={col.key}
                            checked={colunasSelecionadas.includes(col.key)}
                            onChange={() => toggleColuna(col.key)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <label htmlFor={col.key} className="text-sm cursor-pointer text-gray-700">
                            {col.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
                  className={`border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50 ${
                    isSel ? 'bg-blue-50 border-blue-200' : ''
                  } ${off ? 'bg-red-50' : ''} ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
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
                              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
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
                          cellContent = <span className="text-gray-600">{r.unidade}</span>;
                          break;

                        case 'status':
                          cellContent = (
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${off ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                off 
                                  ? 'bg-red-100 text-red-800' 
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {off ? 'Offline' : 'Online'}
                              </span>
                            </div>
                          );
                          break;

                        case 'offline':
                          cellContent = off
                            ? (() => {
                                const diff = now - new Date(r.localizacao_timestamp).getTime();
                                const m = Math.floor(diff / 60000);
                                const s = Math.floor((diff % 60000) / 1000);
                                return (
                                  <span className="text-red-600 font-mono text-xs font-medium flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {m}m {s}s
                                  </span>
                                );
                              })()
                            : <span className="text-gray-500">—</span>;
                          break;

                        case 'risco':
                          const nivel = riscoPorMotorista[r.id_motorista]?.nivel;
                          cellContent = (
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${
                                nivel === 'vermelho' ? 'bg-red-500 animate-pulse' :
                                nivel === 'amarelo' ? 'bg-yellow-500 animate-pulse' :
                                'bg-green-500'
                              }`} />
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                nivel === 'vermelho' ? 'bg-red-100 text-red-800' :
                                nivel === 'amarelo' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {nivel === 'vermelho' ? 'Parado >15min' :
                                 nivel === 'amarelo' ? 'Parado >10min' :
                                 'Normal'}
                              </span>
                            </div>
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
                              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                                isLoadingRoute 
                                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50' 
                                  : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 shadow-sm hover:shadow-md'
                              }`}
                            >
                              <FaRoute size={12} />
                              {isLoadingRoute ? 'Carregando...' : 'Ver Rota'}
                            </button>
                          );
                          break;

                        case 'veiculo':
                          cellContent = (
                            <div className="text-xs space-y-1">
                              <div className="font-semibold text-gray-900 bg-gray-100 px-2 py-1 rounded text-center">
                                {r.placa || '-'}
                              </div>
                              <div className="text-gray-600 text-center">
                                <div>{r.modelo || '-'}</div>
                                <div className="text-xs">{r.cor || '-'} • {r.ano || '-'}</div>
                              </div>
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
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-lg">
                                <FaTachometerAlt className="text-blue-600" size={12} />
                                <span className="text-xs font-mono font-medium">
                                  {r.velocidade != null ? `${r.velocidade} km/h` : '-'}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-lg">
                                <FaBatteryFull 
                                  className={r.bateria > 50 ? 'text-green-600' : r.bateria > 20 ? 'text-yellow-600' : 'text-red-600'} 
                                  size={12} 
                                />
                                <span className="text-xs font-mono font-medium">
                                  {r.bateria != null ? `${r.bateria}%` : '-'}
                                </span>
                              </div>
                            </div>
                          );
                          break;

                        case 'atualizacao':
                          cellContent = (
                            <span className="font-mono text-xs text-gray-600">
                              {r.localizacao_timestamp
                                ? formatUTCToBrasilia(r.localizacao_timestamp)
                                : '-'}
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
                          className="p-3 border-r border-gray-100 last:border-r-0"
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
      </div>
    </div>
  );
}