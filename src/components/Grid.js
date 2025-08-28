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
    <div className="h-full bg-card rounded-lg border shadow-sm overflow-hidden">
      {/* Header com filtros */}
      <div className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border/50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FiFilter className="w-4 h-4 text-primary" />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-semibold text-foreground">Monitoramento de Motoristas</h3>
              <p className="text-xs text-muted-foreground">{driversFiltrados.length} motoristas encontrados</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-foreground">Filtrar:</label>
            <select 
              value={filtroAtivo} 
              onChange={e => setFiltroAtivo(e.target.value)}
              className="px-3 py-2 border border-input rounded-lg bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 min-w-[120px]"
            >
              <option value="todos">Todos</option>
              <option value="ativos">Ativos</option>
              <option value="inativos">Inativos</option>
            </select>
          </div>
        </div>
      </div>

      <div className="relative overflow-auto">
        <table className="w-full text-sm" style={{ tableLayout: 'fixed' }}>
          <thead className="sticky top-0 z-10">
            <tr className="bg-gradient-to-r from-muted/80 to-muted/60 backdrop-blur-sm">
              {/* Cabeçalhos visíveis */}
              {allColumns
                .filter(col => colunasSelecionadas.includes(col.key))
                .map((col, i) => (
                  <th
                    key={col.key}
                    className="relative px-3 py-3 text-left font-semibold text-foreground border-r border-border/30 last:border-r-0 bg-muted/50"
                    style={{ width: colWidths[i] }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase tracking-wide">{col.label}</span>
                    </div>
                    <div
                      className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/30 transition-colors duration-200 z-20"
                      onMouseDown={e => handleMouseDown(e, i)}
                    />
                  </th>
                ))
              }

              {/* Botão de colunas */}
              <th className="px-3 py-3 text-center bg-muted/50 w-12">
                <button
                  onClick={() => setMostrarPopover(v => !v)}
                  className="p-2 hover:bg-accent/80 rounded-lg transition-all duration-200 hover:scale-105"
                  title="Configurar colunas"
                >
                  <FiList className="w-4 h-4 text-muted-foreground" />
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
                  className={`group cursor-pointer border-b border-border/30 transition-all duration-200 hover:bg-accent/30 ${
                    isSel 
                      ? 'bg-primary/10 border-primary/30 shadow-sm' 
                      : 'hover:shadow-sm'
                  } ${off ? 'bg-destructive/5' : ''}`}
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
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${off ? 'bg-destructive animate-pulse' : 'bg-success'}`} />
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                off 
                                  ? 'bg-destructive/10 text-destructive' 
                                  : 'bg-success/10 text-success'
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
                                return <span className="font-mono text-xs text-destructive font-medium">{m}m {s}s</span>;
                              })()
                            : <span className="text-muted-foreground">—</span>;
                          break;

                         case 'risco':
                           const nivel = riscoPorMotorista[r.id_motorista]?.nivel;
                           cellContent = (
                             <div className="flex items-center gap-2">
                               <div className={`w-2 h-2 rounded-full ${
                                 nivel === 'vermelho' ? 'bg-destructive animate-pulse' :
                                 nivel === 'amarelo' ? 'bg-warning animate-pulse' :
                                 'bg-success'
                               }`} />
                               <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                 nivel === 'vermelho' ? 'bg-destructive/10 text-destructive' :
                                 nivel === 'amarelo' ? 'bg-warning/10 text-warning' :
                                 'bg-success/10 text-success'
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
                                  ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-50' 
                                  : 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 hover:scale-105 shadow-sm hover:shadow-md'
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
                              <div className="font-semibold text-foreground bg-muted/30 px-2 py-1 rounded text-center">
                                {r.placa || '-'}
                              </div>
                              <div className="text-muted-foreground text-center">
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
                              <div className="flex items-center gap-1 bg-muted/30 px-2 py-1 rounded-lg">
                                <FaTachometerAlt className="text-primary" size={12} />
                                <span className="text-xs font-mono font-medium">
                                  {r.velocidade != null ? `${r.velocidade} km/h` : '-'}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 bg-muted/30 px-2 py-1 rounded-lg">
                                <FaBatteryFull 
                                  className={r.bateria > 50 ? 'text-success' : r.bateria > 20 ? 'text-warning' : 'text-destructive'} 
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
                          className="px-3 py-3 border-r border-border/30 last:border-r-0 transition-all duration-200"
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
            className="absolute top-16 right-4 bg-card border border-border rounded-xl shadow-2xl p-4 z-50 min-w-56 backdrop-blur-sm"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <FiList className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-semibold text-sm text-foreground">Configurar Colunas</h3>
            </div>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {allColumns.map(col => (
                <label key={col.key} className="flex items-center gap-3 text-sm text-foreground hover:bg-accent/60 p-2 rounded-lg cursor-pointer transition-all duration-200 group">
                  <input
                    type="checkbox"
                    checked={colunasSelecionadas.includes(col.key)}
                    onChange={() => toggleColuna(col.key)}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 focus:ring-2"
                  />
                  <span className="group-hover:text-primary transition-colors">{col.label}</span>
                </label>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-border">
              <button
                onClick={() => setMostrarPopover(false)}
                className="w-full px-4 py-2 text-sm bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg hover:from-primary/90 hover:to-primary/70 transition-all duration-200 font-medium"
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
