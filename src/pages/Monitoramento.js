// Monitoramento.js (AJUSTADO 2025-08-15)
// - Mantém overlay de carregamento (load) com barra de progresso
// - Usa endpoints otimizados: /api/drivers-info e /api/localizacoes/raw-latest
// - Remove fetch redundante e estado "drivers" não utilizado
// - Corrige semicolons em JSX (erro de sintaxe no overlay)
// - Usa BASE de API e SOCKET via env com fallback
// - Mantém Grid, Mapa, AudiosModal e props já usadas

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Mapa from '../components/Mapa.jsx';
import Grid from '../components/Grid';
import AudiosModal from '../components/AudiosModal';
import io from 'socket.io-client';

const LIMIT_PER_DRIVER = 50; // histórico curto por motorista
const API_BASE = process.env.REACT_APP_API_BASE || 'https://app.roadweb.com.br';
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'https://app.roadweb.com.br';
const AUDIO_URL = 'https://app.roadweb.com.br';

export default function Monitoramento() {

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [tab, setTab] = useState('rotas'); // 'rotas' | 'furtos
  const [heatmapEnabled, setHeatmapEnabled] = useState(false);
  const [heatmapPoints, setHeatmapPoints] = useState([]);
  const [heatRadius, setHeatRadius] = useState(10);
  const [heatOpacity, setHeatOpacity] = useState(0.25);
  const [heatMaxIntensity, setHeatMaxIntensity] = useState(3);
  const [heatUrl, setHeatUrl] = useState('/regiaodefurtos.json');
  const [heatStatus, setHeatStatus] = useState('idle'); // idle|loading|ok|error
  const [heatMsg, setHeatMsg] = useState('');

  // ADD: normalizador para (lat,lng,weight)
function normalizeHeatPoints(input) {
  const list = Array.isArray(input) ? input : [];
  const out = [];
  for (const row of list) {
    if (!row) continue;
    const latN = Number(row.lat ?? row.LATITUDE ?? row.latitude);
    const lngN = Number(row.lng ?? row.LONGITUDE ?? row.lon ?? row.long ?? row.longitude);
    const wN = Number(row.weight ?? row.intensity ?? row.CONT_VEICULO ?? 1);
    if (
      Number.isFinite(latN) && Number.isFinite(lngN) &&
      latN >= -90 && latN <= 90 && lngN >= -180 && lngN <= 180
    ) {
      out.push({ lat: latN, lng: lngN, weight: wN > 0 ? wN : 1 });
    }
  }
  // agrega pontos iguais
  const map = new Map();
  for (const p of out) {
    const k = `${p.lat},${p.lng}`;
    const cur = map.get(k);
    if (cur) cur.weight += p.weight;
    else map.set(k, { ...p });
  }
  return Array.from(map.values());
}

// ADD: carregador do JSON (local ou remoto)
async function carregarFurtos() {
  try {
    setHeatStatus('loading');
    setHeatMsg(`Carregando ${heatUrl}…`);
    const res = await fetch(heatUrl, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const ct = (res.headers.get('content-type') || '').toLowerCase();
    let payload;
    if (ct.includes('json')) payload = await res.json();
    else payload = await res.text();

    let arr;
    if (typeof payload === 'string') {
      const parsed = JSON.parse(payload);
      arr = parsed.points || parsed.data || parsed || [];
    } else {
      arr = payload.points || payload.data || payload || [];
    }

    const pts = normalizeHeatPoints(arr);
    setHeatmapPoints(pts);
    setHeatStatus('ok');
    setHeatMsg(`Carregado: ${pts.length} pontos.`);
    setHeatmapEnabled(true);

    // opcional: ajustar bounds
    if (mapRef.current && pts.length) {
      const bounds = new window.google.maps.LatLngBounds();
      pts.forEach(p => bounds.extend({ lat: p.lat, lng: p.lng }));
      mapRef.current.fitBounds(bounds);
    }
  } catch (e) {
    console.error('[heatmap] falha', e);
    setHeatStatus('error');
    setHeatMsg(e?.message || 'Falha ao carregar dados');
  }
}

  // --- Estados principais ---
  const [driversInfo, setDriversInfo] = useState([]); // agregado por motorista (última pos)
  const [rawLocs, setRawLocs] = useState([]);         // histórico curto (flat)
  const [selectedId, setSelectedId] = useState(null);
  const [routePath, setRoutePath] = useState([]);     // rota dinâmica
  const [mapHeight, setMapHeight] = useState(60);
  const [audiosModalOpen, setAudiosModalOpen] = useState(false);
  const [audiosList, setAudiosList] = useState([]);
  const [modalMotoristaId, setModalMotoristaId] = useState(null);
  const [motoristaSelecionado, setMotoristaSelecionado] = useState(null);
  const [now, setNow] = useState(Date.now());
  const mapRef = useRef(null);

  // Loading overlay
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0); // 0..100

  const filtroAtivo = localStorage.getItem('filtroAtivo') || 'todos';
  const [isDragging, setIsDragging] = useState(false);

  // Tick para offline/tempo
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // --- Util ---
  const toNum = (v) => {
    if (v == null || v === '') return null;
    const s = typeof v === 'string' ? v.replace(',', '.') : v;
    const n = parseFloat(s);
    return Number.isFinite(n) ? n : null;
  };

  // Última localização de cada motorista derivada do histórico curto (se precisar)
  const ultimasLocalizacoes = useMemo(() => {
    if (!rawLocs.length) return [];
    const byDriver = {};
    for (const loc of rawLocs) {
      if (!loc.id_motorista || !loc.timestamp) continue;
      const t = new Date(loc.timestamp).getTime();
      const prev = byDriver[loc.id_motorista];
      if (!prev || t > new Date(prev.timestamp).getTime()) {
        byDriver[loc.id_motorista] = {
          ...loc,
          timestamp_local: new Date(t).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
        };
      }
    }
    return Object.values(byDriver);
  }, [rawLocs]);

  // --- Carregamento inicial ---
  useEffect(() => {
    let mounted = true;
    const acInfo = new AbortController();
    const acRaw = new AbortController();

    async function fetchInitialData() {
      try {
        setLoading(true);
        setProgress(0);

        // 1) drivers-info
        setProgress(15);
        const infoRes = await fetch(`${API_BASE}/api/drivers-info`, { signal: acInfo.signal });
        if (!infoRes.ok) throw new Error('Falha ao carregar drivers-info');
        const infoJson = await infoRes.json();
        if (!mounted) return;
        setDriversInfo(Array.isArray(infoJson) ? infoJson : []);
        setProgress(50);

        // 2) raw-latest (histórico curto)
        const rawRes = await fetch(
          `${API_BASE}/api/localizacoes/raw-latest?limitPerDriver=${LIMIT_PER_DRIVER}`,
          { signal: acRaw.signal }
        );
        if (!rawRes.ok) throw new Error('Falha ao carregar raw-latest');
        const rawJson = await rawRes.json();
        if (!mounted) return;
        // Normaliza/filtra nulos e limita por motorista
        setRawLocs(() => {
          const agrupado = new Map();
          for (const loc of Array.isArray(rawJson) ? rawJson : []) {
            const id = loc.id_motorista;
            if (!id || !loc.timestamp) continue;
            const arr = agrupado.get(id) || [];
            arr.push({
              ...loc,
              latitude: toNum(loc.latitude),
              longitude: toNum(loc.longitude),
            });
            agrupado.set(id, arr);
          }
          const out = [];
          for (const arr of agrupado.values()) {
            arr.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            out.push(...arr.slice(0, LIMIT_PER_DRIVER));
          }
          // Ordena por motorista e tempo desc para consumo estável
          return out.sort((a, b) => (a.id_motorista - b.id_motorista) || (new Date(b.timestamp) - new Date(a.timestamp)));
        });
        setProgress(85);

        // 3) pronto
        setProgress(100);
        setTimeout(() => mounted && setLoading(false), 200);
      } catch (error) {
        console.error('Erro ao buscar dados iniciais:', error);
        setProgress(100);
        setTimeout(() => mounted && setLoading(false), 200);
      }
    }

    fetchInitialData();
    return () => {
      mounted = false;
      acInfo.abort();
      acRaw.abort();
    };
  }, []);

  // --- Poll de drivers-info a cada 30s ---
  useEffect(() => {
    const ac = new AbortController();
    const timer = setInterval(async () => {
      try {
        const r = await fetch(`${API_BASE}/api/drivers-info`, { signal: ac.signal });
        if (!r.ok) return;
        const j = await r.json();
        setDriversInfo(Array.isArray(j) ? j : []);
      } catch (e) {
        if (e.name !== 'AbortError') console.warn('Erro poll drivers-info:', e);
      }
    }, 30000);
    return () => {
      ac.abort();
      clearInterval(timer);
    };
  }, []);

  // --- Socket.IO (tempo real) ---
  useEffect(() => {
    const socket = io(SOCKET_URL, { path: '/socket.io', transports: ['websocket'] });

    socket.on('locationUpdate', (upd) => {
      // Esperado: { id, lat, lng, speed, battery, lastUpdate, id_localizacao? }
      if (!upd || !upd.id) return;
      const nova = {
        id_localizacao: upd.id_localizacao || `${upd.id}_${upd.lastUpdate || Date.now()}`,
        id_motorista: upd.id,
        latitude: toNum(upd.lat),
        longitude: toNum(upd.lng),
        velocidade: upd.speed != null ? Number(upd.speed) : null,
        bateria: upd.battery != null ? Number(upd.battery) : null,
        timestamp: upd.lastUpdate || new Date().toISOString(),
      };

      if (!nova.timestamp) return; // ignora nulos

      setRawLocs((prev) => {
        // de-dupe simples por id_localizacao
        const seen = new Set();
        const merged = [nova, ...prev.filter(p => p.id_localizacao !== nova.id_localizacao)];
        const agrupado = new Map();
        for (const loc of merged) {
          if (!loc.id_motorista || !loc.timestamp) continue;
          const arr = agrupado.get(loc.id_motorista) || [];
          arr.push(loc);
          agrupado.set(loc.id_motorista, arr);
        }
        const out = [];
        for (const arr of agrupado.values()) {
          arr.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          out.push(...arr.slice(0, LIMIT_PER_DRIVER));
        }
        return out.sort((a, b) => (a.id_motorista - b.id_motorista) || (new Date(b.timestamp) - new Date(a.timestamp)));
      });

      // Atualiza driversInfo (espelha última posição)
      setDriversInfo((curr) => curr.map(r => (
        (r.id_motorista === upd.id || r.id === upd.id)
          ? { ...r, latitude: upd.lat, longitude: upd.lng, velocidade: upd.speed, bateria: upd.battery, localizacao_timestamp: upd.lastUpdate }
          : r
      )));
    });

    socket.on('connect_error', (e) => console.warn('Socket connect_error:', e.message));
    socket.on('disconnect', (reason) => console.log('Socket disconnect:', reason));

    return () => socket.disconnect();
  }, []);

  // --- Helpers ---
  const driversHoje = useMemo(() => {
    if (!Array.isArray(driversInfo)) return [];
    const hojeBR = new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    return driversInfo.filter(d => {
      const ts = d.localizacao_timestamp || d.timestamp;
      if (!ts) return false;
      const dia = new Date(ts).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
      return dia === hojeBR;
    });
  }, [driversInfo]);

  const estaOffline = (ts) => {
    if (!ts) return true;
    return now - new Date(ts).getTime() > 2 * 60 * 1000; // > 2 min
  };

  // Busca rota
  const buscarRotaMotorista = async (id_motorista) => {
    limparSelecaoMotorista();
    if (!id_motorista) return;
    try {
      const hoje = new Date().toISOString().slice(0, 10);
      const res = await fetch(`${API_BASE}/api/localizacoes-historico?id_motorista=${id_motorista}&data=${hoje}`);
      if (!res.ok) throw new Error('Erro ao buscar histórico');
      let data = await res.json();
      if (!Array.isArray(data)) {
        if (Array.isArray(data?.localizacoes)) data = data.localizacoes;
        else if (Array.isArray(data?.result)) data = data.result;
        else if (data && typeof data === 'object') data = [data];
        else data = [];
      }
      const pontos = data
        .filter(loc => loc.latitude && loc.longitude && loc.timestamp)
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
        .map(loc => ({ lat: toNum(loc.latitude), lng: toNum(loc.longitude), timestamp: loc.timestamp }));

      setRoutePath(pontos.map(({ lat, lng }) => ({ lat, lng })));
      setSelectedId(id_motorista);

      if (mapRef.current && pontos.length > 1) {
        const bounds = new window.google.maps.LatLngBounds();
        pontos.forEach(p => bounds.extend(p));
        mapRef.current.fitBounds(bounds);
      } else if (mapRef.current && pontos.length === 1) {
        mapRef.current.panTo(pontos[0]);
        mapRef.current.setZoom(17);
      }
    } catch (error) {
      console.error('Erro ao buscar rota do motorista:', error);
      setRoutePath([]);
      throw error;
    }
  };

  const handleRowClick = (motorista) => {
    setSelectedId(motorista.id_motorista);
    if (selectedId !== motorista.id_motorista) setRoutePath([]);
    if (mapRef.current && motorista.latitude && motorista.longitude) {
      mapRef.current.panTo({ lat: toNum(motorista.latitude), lng: toNum(motorista.longitude) });
      mapRef.current.setZoom(17);
    }
  };

  const handleRouteRequest = async (id_motorista) => {
    await buscarRotaMotorista(id_motorista);
    setSelectedId(id_motorista);
  };

  const onSelectMotorista = (motorista) => {
    setSelectedId(motorista.id_motorista || motorista.id);
    setRoutePath([]);
  };

  const limparSelecaoMotorista = () => {
    setSelectedId(null);
    setRoutePath([]);
  };

  const handleOpenAudiosModal = async (id_motorista) => {
    try {
      const motorista = driversInfo.find(d => (d.id_motorista || d.id) === id_motorista);
      setMotoristaSelecionado(motorista);
      const res = await fetch(`${AUDIO_URL}/api/audios/${id_motorista}`);
      const data = await res.json();
      const nowMs = Date.now();
      const audiosComStatus = (Array.isArray(data) ? data : []).map(audio => {
        const ts = new Date(audio.timestamp || audio.data_gravacao).getTime();
        return { ...audio, status: nowMs - ts > 2 * 60 * 1000 ? 'offline' : 'online' };
      });
      setAudiosList(audiosComStatus);
      setModalMotoristaId(id_motorista);
      setAudiosModalOpen(true);
    } catch (error) {
      console.error('Erro ao buscar áudios:', error);
      alert('Erro ao carregar áudios do motorista');
    }
  };

  const [ativos, setAtivos] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ativos')) || {}; } catch { return {}; }
  });

// Contadores de motoristas (total/online/offline)
const totals = React.useMemo(() => {
  const total = Array.isArray(driversHoje) ? driversHoje.length : 0;
  let online = 0, offline = 0;
  if (total > 0) {
    for (const d of driversHoje) {
      const ts = d.localizacao_timestamp || d.timestamp;
      if (estaOffline(ts)) offline++;
      else online++;
    }
  }
  return { total, online, offline };
}, [driversHoje, now]); // inclui "now" para refletir mudanças de status em tempo real

// Indicadores por unidade/base
const indicadoresPorUnidade = React.useMemo(() => {
  const mapa = new Map(); // unidade -> { total, online, offline }
  const safeOffline = (ts) => estaOffline(ts);

  for (const d of (driversHoje || [])) {
    const uni = (d.unidade || '—').trim() || '—';
    const reg = mapa.get(uni) || { total: 0, online: 0, offline: 0 };
    reg.total += 1;
    if (safeOffline(d.localizacao_timestamp || d.timestamp)) reg.offline += 1;
    else reg.online += 1;
    mapa.set(uni, reg);
  }

  // transforma em array ordenado por nome da unidade
  const linhas = Array.from(mapa.entries())
    .map(([unidade, v]) => ({ unidade, ...v }))
    .sort((a, b) => a.unidade.localeCompare(b.unidade, 'pt-BR'));

  // total geral
  const totalGeral = linhas.reduce((acc, r) => {
    acc.total += r.total; acc.online += r.online; acc.offline += r.offline;
    return acc;
  }, { total: 0, online: 0, offline: 0 });

  return { linhas, totalGeral };
}, [driversHoje, now, estaOffline]);

  // --- Risco por motorista (exemplo, mantido) ---
  function distanciaMetros(lat1, lon1, lat2, lon2) {
    const toRad = (x) => x * Math.PI / 180;
    const R = 6371000;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat/2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  const riscoPorMotorista = useMemo(() => {
    const risco = {};
    const agrupado = {};
    for (const loc of rawLocs) {
      if (!agrupado[loc.id_motorista]) agrupado[loc.id_motorista] = [];
      agrupado[loc.id_motorista].push(loc);
    }
    for (const [id_motorista, locs] of Object.entries(agrupado)) {
      const ordenadas = locs
        .filter(l => l.latitude && l.longitude && l.timestamp)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      if (!ordenadas.length) continue;
      const ultima = ordenadas[0];
      let tempoParadoMs = 0;
      for (let i = 1; i < ordenadas.length; i++) {
        const d = distanciaMetros(
          toNum(ultima.latitude), toNum(ultima.longitude), toNum(ordenadas[i].latitude), toNum(ordenadas[i].longitude)
        );
        if (d > 30) break; // saiu do raio
        const tUlt = new Date(ultima.timestamp).getTime();
        const tAnt = new Date(ordenadas[i].timestamp).getTime();
        tempoParadoMs = tUlt - tAnt;
      }
      const minutos = Math.floor(tempoParadoMs / 60000);
      let nivel = 'cinza';
      if (minutos > 15) nivel = 'vermelho';
      else if (minutos > 10) nivel = 'amarelo';
      risco[id_motorista] = { nivel, minutos };
    }
    return risco;
  }, [rawLocs]);

  // --- Render principal ---
  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4">
            <div className="text-center space-y-6">
              <div className="w-16 h-16 mx-auto bg-gradient-to-r from-primary to-primary/70 rounded-full flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">Carregando sistema</h3>
                <p className="text-sm text-muted-foreground">Preparando dados de monitoramento...</p>
              </div>
              <div className="space-y-2">
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-primary to-primary/70 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">{progress}%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header com estatísticas */}
      <div className="bg-gradient-to-r from-card via-card to-card/95 border-b border-border/50 backdrop-blur-sm">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl">
                <div className="w-6 h-6 bg-gradient-to-r from-primary to-primary/70 rounded-lg"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Monitoramento</h1>
                <p className="text-sm text-muted-foreground">Sistema de rastreamento em tempo real</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-foreground">
                {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
              <div className="text-sm text-muted-foreground">
                {new Date().toLocaleTimeString('pt-BR')}
              </div>
            </div>
          </div>

          {/* Cards de estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-card to-card/80 border border-border/50 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold text-foreground">{totals.total}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-card to-card/80 border border-border/50 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-success/10 rounded-lg">
                  <div className="w-4 h-4 bg-success rounded animate-pulse"></div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Online</p>
                  <p className="text-2xl font-bold text-success">{totals.online}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-card to-card/80 border border-border/50 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-destructive/10 rounded-lg">
                  <div className="w-4 h-4 bg-destructive rounded animate-pulse"></div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Offline</p>
                  <p className="text-2xl font-bold text-destructive">{totals.offline}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-card to-card/80 border border-border/50 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-warning/10 rounded-lg">
                  <div className="w-4 h-4 bg-warning rounded"></div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Taxa Online</p>
                  <p className="text-2xl font-bold text-foreground">
                    {totals.total > 0 ? Math.round((totals.online / totals.total) * 100) : 0}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo principal com layout dividido */}
      <div className="flex-1 flex overflow-hidden">
        {/* Container do Mapa */}
        <div 
          className="relative bg-white border-r border-gray-200"
          style={{ 
            height: '100%', 
            width: `${mapHeight}%`,
          }}
        >
          <Mapa
            drivers={driversHoje}
            selectedId={selectedId}
            routePath={routePath}
            onSelectMotorista={onSelectMotorista}
            filtroAtivo={filtroAtivo}
            heatmapEnabled={heatmapEnabled}
            heatmapPoints={heatmapPoints}
            heatmapOptions={{
              radius: heatRadius,
              opacity: heatOpacity,
              maxIntensity: heatMaxIntensity,
              gradient: {
                0.2: 'rgba(0, 255, 255, 0)',
                0.4: 'rgba(0, 255, 255, 1)',
                0.6: 'rgba(0, 191, 255, 1)',
                0.8: 'rgba(0, 127, 255, 1)',
                1.0: 'rgba(0, 63, 255, 1)'
              }
            }}
            mapRef={mapRef}
          />
        </div>

        {/* Divisor redimensionável */}
        <div 
          className="w-1 bg-gray-300 hover:bg-blue-400 cursor-col-resize transition-colors duration-200"
          onMouseDown={(e) => {
            const startX = e.clientX;
            const startWidth = mapHeight;
            const containerWidth = e.currentTarget.parentElement.offsetWidth;

            const handleMouseMove = (e) => {
              const deltaX = e.clientX - startX;
              const deltaPercent = (deltaX / containerWidth) * 100;
              const newWidth = Math.min(Math.max(startWidth + deltaPercent, 20), 80);
              setMapHeight(newWidth);
            };

            const handleMouseUp = () => {
              document.removeEventListener('mousemove', handleMouseMove);
              document.removeEventListener('mouseup', handleMouseUp);
            };

            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
          }}
        />

        {/* Container do Grid */}
        <div 
          className="relative bg-white"
          style={{ 
            height: '100%', 
            width: `${100 - mapHeight}%`,
          }}
        >
          <Grid
            driversHoje={driversHoje}
            selectedId={selectedId}
            handleRowClick={handleRowClick}
            estaOffline={estaOffline}
            riscoPorMotorista={riscoPorMotorista}
            handleOpenAudiosModal={handleOpenAudiosModal}
            AUDIO_URL={AUDIO_URL}
            now={now}
            onRouteRequest={handleRouteRequest}
            ativos={ativos}
            setAtivos={setAtivos}
          />
        </div>
      </div>

      {/* Painel lateral (drawer) */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 lg:relative lg:inset-auto">
          {/* Overlay para mobile */}
          <div className="lg:hidden fixed inset-0 bg-black/50" onClick={() => setDrawerOpen(false)} />
          
          {/* Painel */}
          <div className="fixed right-0 top-0 h-full w-96 bg-white border-l border-gray-200 shadow-xl lg:relative lg:w-80 lg:shadow-lg overflow-auto">
            {/* Header do painel */}
            <div className="bg-gray-50 border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Painel de Controle</h3>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-semibold text-foreground">Modo de Visualização:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                      tab === 'rotas' 
                        ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-md' 
                        : 'bg-muted hover:bg-accent text-muted-foreground hover:text-foreground'
                    }`}
                    onClick={() => setTab('rotas')}
                  >
                    Rotas
                  </button>
                  <button
                    className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                      tab === 'furtos' 
                        ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-md' 
                        : 'bg-muted hover:bg-accent text-muted-foreground hover:text-foreground'
                    }`}
                    onClick={() => setTab('furtos')}
                  >
                    Heatmap
                  </button>
                </div>
              </div>

              {tab === 'furtos' && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <div className="p-1.5 bg-warning/10 rounded-lg">
                        <div className="w-4 h-4 bg-warning rounded"></div>
                      </div>
                      Heatmap de Furtos
                    </h3>
                    
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-foreground">URL do arquivo:</label>
                      <input
                        type="text"
                        value={heatUrl}
                        onChange={(e) => setHeatUrl(e.target.value)}
                        className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        placeholder="/regiaodefurtos.json"
                      />
                    </div>

                    <button
                      className="w-full px-4 py-3 bg-gradient-to-r from-secondary to-secondary/80 text-secondary-foreground rounded-lg hover:from-secondary/90 hover:to-secondary/70 transition-all duration-200 font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={carregarFurtos}
                      disabled={heatStatus === 'loading'}
                    >
                      {heatStatus === 'loading' ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Carregando...
                        </div>
                      ) : 'Carregar Dados'}
                    </button>

                    {heatMsg && (
                      <div className={`p-4 rounded-lg text-sm border ${
                        heatStatus === 'error' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                        heatStatus === 'ok' ? 'bg-success/10 text-success border-success/20' :
                        'bg-muted text-muted-foreground border-border'
                      }`}>
                        {heatMsg}
                      </div>
                    )}

                    <div className="bg-muted/30 p-4 rounded-lg border border-border/30">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={heatmapEnabled}
                          onChange={(e) => setHeatmapEnabled(e.target.checked)}
                          className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
                        />
                        <span className="text-sm font-medium text-foreground">Exibir heatmap no mapa</span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-md font-semibold text-foreground">Configurações Visuais</h4>
                    
                    <div className="space-y-4">
                      <div className="bg-muted/30 p-4 rounded-lg border border-border/30">
                        <label className="text-sm font-medium text-foreground block mb-3">
                          Raio: <span className="text-primary">{heatRadius}px</span>
                        </label>
                        <input
                          type="range"
                          min="5"
                          max="50"
                          value={heatRadius}
                          onChange={(e) => setHeatRadius(Number(e.target.value))}
                          className="w-full accent-primary"
                        />
                      </div>
                      
                      <div className="bg-muted/30 p-4 rounded-lg border border-border/30">
                        <label className="text-sm font-medium text-foreground block mb-3">
                          Opacidade: <span className="text-primary">{heatOpacity}</span>
                        </label>
                        <input
                          type="range"
                          min="0.1"
                          max="1"
                          step="0.05"
                          value={heatOpacity}
                          onChange={(e) => setHeatOpacity(Number(e.target.value))}
                          className="w-full accent-primary"
                        />
                      </div>
                      
                      <div className="bg-muted/30 p-4 rounded-lg border border-border/30">
                        <label className="text-sm font-medium text-foreground block mb-3">
                          Intensidade máx: <span className="text-primary">{heatMaxIntensity}</span>
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={heatMaxIntensity}
                          onChange={(e) => setHeatMaxIntensity(Number(e.target.value))}
                          className="w-full accent-primary"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AudiosModal */}
      {audiosModalOpen && (
        <AudiosModal
          isOpen={audiosModalOpen}
          motorista={motoristaSelecionado}
          audiosList={audiosList}
          onClose={() => {
            setAudiosModalOpen(false);
            setAudiosList([]);
            setModalMotoristaId(null);
            setMotoristaSelecionado(null);
          }}
          AUDIO_URL={AUDIO_URL}
        />
      )}
    </div>
  );
}