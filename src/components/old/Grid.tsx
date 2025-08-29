import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Route, Settings, Filter, ChevronDown, Zap, Activity, AlertTriangle, Clock } from 'lucide-react';
import { cn } from '../components/lib/utils.ts';
import { Button } from '../components/ui/button.tsx';
import { Checkbox } from '../components/ui/checkbox.tsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select.tsx';
import { Badge } from '../components/ui/badge.tsx';
import { Card } from '../components/ui/card.tsx';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover.tsx';

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
    <Card className="h-full overflow-hidden border-0 shadow-lg bg-card">
      {/* Header with filters */}
      <div className="p-6 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Filtrar motoristas:</span>
            </div>
            <Select value={filtroAtivo} onValueChange={setFiltroAtivo}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="ativos">Ativos</SelectItem>
                <SelectItem value="inativos">Inativos</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Badge variant="outline" className="text-xs">
            {driversFiltrados.length} motoristas
          </Badge>
        </div>
      </div>

      {/* Table container */}
      <div className="overflow-auto h-full">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-muted/50 backdrop-blur-sm">
            <tr className="border-b border-border">
              {/* cabeçalhos visíveis */}
              {allColumns
                .filter(col => colunasSelecionadas.includes(col.key))
                .map((col, i) => (
                  <th
                    key={col.key}
                    className="p-3 text-left font-semibold text-muted-foreground uppercase text-xs tracking-wider relative bg-muted/50"
                    style={{ width: colWidths[i] }}
                  >
                    {col.label}
                    <div
                      className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/20 transition-colors"
                      onMouseDown={e => handleMouseDown(e, i)}
                    />
                  </th>
                ))
              }

              {/* botão de colunas */}
              <th className="p-3 text-center w-10 bg-muted/50">
                <Popover open={mostrarPopover} onOpenChange={setMostrarPopover}>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-3" align="end">
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm mb-3">Colunas visíveis</h4>
                      {allColumns.map(col => (
                        <div key={col.key} className="flex items-center space-x-2">
                          <Checkbox
                            id={col.key}
                            checked={colunasSelecionadas.includes(col.key)}
                            onCheckedChange={() => toggleColuna(col.key)}
                          />
                          <label htmlFor={col.key} className="text-sm cursor-pointer">
                            {col.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
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
                  className={cn(
                    "border-b border-border cursor-pointer transition-colors hover:bg-muted/50",
                    isSel && "bg-primary/10 border-primary/20",
                    i % 2 === 0 ? "bg-background" : "bg-muted/20"
                  )}
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
                            <Checkbox
                              checked={!!r.ativo}
                              onCheckedChange={(checked) => {
                                handleToggleAtivo(r.id_motorista, checked);
                              }}
                              onClick={(e) => e.stopPropagation()}
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
                            <Badge
                              variant={off ? "destructive" : "default"}
                              className={cn(
                                "text-xs font-medium",
                                off && "animate-pulse"
                              )}
                            >
                              <div className={cn(
                                "w-2 h-2 rounded-full mr-2",
                                off ? "bg-destructive-foreground" : "bg-green-500"
                              )} />
                              {off ? 'Offline' : 'Online'}
                            </Badge>
                          );
                          break;

                        case 'offline':
                          cellContent = off
                            ? (() => {
                                const diff = now - new Date(r.localizacao_timestamp).getTime();
                                const m = Math.floor(diff / 60000);
                                const s = Math.floor((diff % 60000) / 1000);
                                return (
                                  <span className="text-destructive font-mono text-xs">
                                    <Clock className="w-3 h-3 inline mr-1" />
                                    {m}m {s}s
                                  </span>
                                );
                              })()
                            : <span className="text-muted-foreground">—</span>;
                          break;

                        case 'risco':
                          const nivel = riscoPorMotorista[r.id_motorista]?.nivel;
                          cellContent = (
                            <Badge
                              variant={
                                nivel === 'vermelho' ? "destructive" :
                                nivel === 'amarelo' ? "secondary" : "outline"
                              }
                              className={cn(
                                "text-xs font-medium",
                                nivel === 'vermelho' && "animate-pulse",
                                nivel === 'amarelo' && "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                              )}
                            >
                              {nivel === 'vermelho' && <AlertTriangle className="w-3 h-3 mr-1" />}
                              {nivel === 'amarelo' && <Activity className="w-3 h-3 mr-1" />}
                              {nivel === 'vermelho'
                                ? 'Parado >15min'
                                : nivel === 'amarelo'
                                ? 'Parado >10min'
                                : 'Normal'}
                            </Badge>
                          );
                          break;

                        case 'rota':
                          cellContent = (
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleBuscarRota(r);
                              }}
                              disabled={isLoadingRoute}
                              size="sm"
                              className="h-8"
                            >
                              <Route className="w-3 h-3 mr-1" />
                              {isLoadingRoute ? '...' : 'Rota'}
                            </Button>
                          );
                          break;

                        case 'veiculo':
                          cellContent = (
                            <div className="text-xs">
                              <div className="font-medium">{r.placa || '-'}</div>
                              <div className="text-muted-foreground">
                                {r.modelo || '-'} - {r.cor || '-'} - {r.ano || '-'}
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
                            <div className="flex items-center gap-2 text-xs">
                              <span className="flex items-center">
                                <Activity className="w-3 h-3 mr-1 text-blue-500" />
                                {r.velocidade != null ? r.velocidade + ' km/h' : '-'}
                              </span>
                              <span className="flex items-center">
                                <Zap className="w-3 h-3 mr-1 text-green-500" />
                                {r.bateria != null ? r.bateria + '%' : '-'}
                              </span>
                            </div>
                          );
                          break;

                        case 'atualizacao':
                          cellContent = (
                            <span className="font-mono text-xs text-muted-foreground">
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
                          className="p-3"
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

    </Card>
  );
}