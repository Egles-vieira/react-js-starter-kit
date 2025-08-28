// Monitoramento.js (AJUSTADO 2025-08-15)
// - Mantém overlay de carregamento (load) com barra de progresso
// - Usa endpoints otimizados: /api/drivers-info e /api/localizacoes/raw-latest
// - Remove fetch redundante e estado "drivers" não utilizado
// - Corrige semicolons em JSX (erro de sintaxe no overlay)
// - Usa BASE de API e SOCKET via env com fallback
// - Mantém Grid, Mapa, AudiosModal e props já usadas

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Mapa from '../components/Mapa.tsx';
import Grid from '../components/Grid.tsx';
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

  // --- Render ---
  return (
    <div style={{
      height: '93vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#f4f7fa',
      color: '#222',
      fontFamily: 'Poppins, Arial, sans-serif',
      position: 'relative'
    }}>
      {/* Overlay de carregamento */}
      {loading && (
        <div style={{
          position: 'fixed', inset: 0, background: '#fff', zIndex: 9999,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
        }}>
          <img
            src="https://heavycomprovante.nyc3.cdn.digitaloceanspaces.com/img/logo-road-removebg-preview.png"
            alt="Splash"
            style={{ width: 120, animation: 'pulse 2s infinite' }}
          />
          <div style={{ height: 3, width: 180, background: '#eee', borderRadius: 10, overflow: 'hidden', marginTop: 20 }}>
            <div style={{ width: `${progress}%`, height: '100%', background: '#FF612B', transition: 'width 300ms ease' }} />
          </div>
        </div>
      )}

      {/* Mapa */}
      <div style={{ flex: `0 0 ${mapHeight}%` }}>
        <Mapa
          drivers={driversHoje}
          ativos={ativos}
          filtroAtivo={filtroAtivo}
          setAtivos={setAtivos}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          routePath={routePath}
          onSelectMotorista={onSelectMotorista}
          estaOffline={estaOffline}
          mapRef={mapRef}
          now={now}
           // UPDATE: props do heatmap
          heatmapEnabled={heatmapEnabled}
          heatmapPoints={heatmapPoints}
          heatmapOptions={{ radius: heatRadius, opacity: heatOpacity, maxIntensity: heatMaxIntensity }}
        />
      </div>

      {/* Divisor redimensionável */}
      <div
        style={{ height: '10px', background: '#ccc', cursor: 'row-resize', display: 'flex', alignItems: 'center', justifyContent: 'center', borderTop: '1px solid #999', borderBottom: '1px solid #999' }}
        onMouseDown={(e) => {
          e.preventDefault();
          const handleDrag = (ev) => {
            const y = ev.clientY || (ev.touches && ev.touches[0].clientY);
            const vh = window.innerHeight;
            const newHeight = Math.max(30, Math.min(80, (y / vh) * 100));
            setMapHeight(newHeight);
          };
          const handleUp = () => {
            document.removeEventListener('mousemove', handleDrag);
            document.removeEventListener('mouseup', handleUp);
          };
          document.addEventListener('mousemove', handleDrag);
          document.addEventListener('mouseup', handleUp);
        }}
        onTouchStart={(e) => {
          e.preventDefault();
          const handleDrag = (ev) => {
            const y = ev.touches && ev.touches[0].clientY;
            if (!y) return;
            const vh = window.innerHeight;
            const newHeight = Math.max(30, Math.min(80, (y / vh) * 100));
            setMapHeight(newHeight);
          };
          const handleEnd = () => {
            document.removeEventListener('touchmove', handleDrag);
            document.removeEventListener('touchend', handleEnd);
          };
          document.addEventListener('touchmove', handleDrag);
          document.addEventListener('touchend', handleEnd);
        }}
      >
        <div style={{ width: '30px', height: '4px', background: '#666', borderRadius: '2px' }} />
      </div>

      {/* Grid */}
      <div style={{ flex: `1 1 ${100 - mapHeight}%`, overflow: 'auto' }}>
        <Grid
          driversHoje={driversHoje}
          ativos={ativos}
          setAtivos={setAtivos}
          selectedId={selectedId}
          handleRowClick={handleRowClick}
          estaOffline={estaOffline}
          riscoPorMotorista={riscoPorMotorista}
          handleOpenAudiosModal={handleOpenAudiosModal}
          AUDIO_URL={AUDIO_URL}
          onRouteRequest={handleRouteRequest}
          now={now}
        />
      </div>

      {/* Modal de Áudios */}
      <AudiosModal
        isOpen={audiosModalOpen}
        onClose={() => setAudiosModalOpen(false)}
        audiosList={audiosList}
        motoristaId={modalMotoristaId}
        audioBaseUrl={AUDIO_URL}
        nome={motoristaSelecionado?.nome}
        cpf={motoristaSelecionado?.cpf}
        contato={motoristaSelecionado?.contato}
      />

      {/* Botão limpar seleção */}
      {selectedId && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 1000 }}>
          <button
            onClick={limparSelecaoMotorista}
            style={{ backgroundColor: '#ff4444', color: '#fff', border: 'none', padding: '10px 15px', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
          >
            Limpar Seleção
          </button>
        </div>
      )}

{/* FAB do Drawer */}
<button
  onClick={() => setDrawerOpen(v => !v)}
  title={drawerOpen ? 'Fechar controles' : 'Abrir controles'}
  style={{
    position: 'fixed', right: 20, bottom: 24, width: 56, height: 56,
    borderRadius: '50%', border: 'none', boxShadow: '0 6px 16px rgba(0,0,0,.25)',
    background: '#FF612B', color: '#fff', fontSize: 26, cursor: 'pointer', zIndex: 2000
  }}
>
  {drawerOpen ? '×' : '≡'}
</button>

{/* Drawer de Controles */}
<aside
  style={{
    position: 'fixed', top: 16, right: drawerOpen ? 16 : -400, width: 360,
    height: 'calc(100vh - 32px)', background: '#fff',
    boxShadow: '0 8px 24px rgba(0,0,0,.18)', borderRadius: '12px',
    padding: 16, transition: 'right .25s ease', zIndex: 1999,
    display: 'flex', flexDirection: 'column', overflow: 'auto'
  }}
>




  {/* Tabs */}
 <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
  <button
    onClick={() => setTab('rotas')}
    style={{
      padding: '8px 10px', borderRadius: 8,
      border: tab==='rotas' ? '2px solid #FF612B' : '1px solid #e5e7eb',
      background: tab==='rotas' ? '#fff7ed' : '#fff', cursor: 'pointer'
    }}
  >
    Rotas
  </button>
  <button
    onClick={() => setTab('furtos')}
    style={{
      padding: '8px 10px', borderRadius: 8,
      border: tab==='furtos' ? '2px solid #2563eb' : '1px solid #e5e7eb',
      background: tab==='furtos' ? '#eff6ff' : '#fff', cursor: 'pointer'
    }}
  >
    Furtos
  </button>
  <button
    onClick={() => setTab('indicadores')}
    style={{
      padding: '8px 10px', borderRadius: 8,
      border: tab==='indicadores' ? '2px solid #0ea5e9' : '1px solid #e5e7eb',
      background: tab==='indicadores' ? '#f0f9ff' : '#fff', cursor: 'pointer'
    }}
  >
    Indicadores
  </button>
</div>
{tab === 'indicadores' && (
  <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
    {/* Resumo geral */}
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: 8
    }}>
      <div style={{ background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 10, padding: 10 }}>
        <div style={{ fontSize: 12, color: '#64748b' }}>Total (geral)</div>
        <div style={{ fontSize: 20, fontWeight: 700 }}>{indicadoresPorUnidade.totalGeral.total}</div>
      </div>
      <div style={{ background: '#ecfdf5', border: '1px solid #bbf7d0', borderRadius: 10, padding: 10 }}>
        <div style={{ fontSize: 12, color: '#047857' }}>Online (geral)</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#065f46' }}>{indicadoresPorUnidade.totalGeral.online}</div>
      </div>
      <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: 10 }}>
        <div style={{ fontSize: 12, color: '#b91c1c' }}>Offline (geral)</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#991b1b' }}>{indicadoresPorUnidade.totalGeral.offline}</div>
      </div>
    </div>

    {/* Tabela por unidade */}
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: '#f1f5f9', color: '#0f172a' }}>
            <th style={{ textAlign: 'left', padding: '10px 8px' }}>Unidade</th>
            <th style={{ textAlign: 'right', padding: '10px 8px' }}>Total</th>
            <th style={{ textAlign: 'right', padding: '10px 8px' }}>Online</th>
            <th style={{ textAlign: 'right', padding: '10px 8px' }}>Offline</th>
            <th style={{ textAlign: 'right', padding: '10px 8px' }}>% Online</th>
          </tr>
        </thead>
        <tbody>
          {indicadoresPorUnidade.linhas.map((r, i) => {
            const pct = r.total ? Math.round((r.online / r.total) * 100) : 0;
            return (
              <tr key={r.unidade} style={{ background: i % 2 ? '#fff' : '#f8fafc' }}>
                <td style={{ padding: '8px' }}>{r.unidade}</td>
                <td style={{ padding: '8px', textAlign: 'right' }}>{r.total}</td>
                <td style={{ padding: '8px', textAlign: 'right', color: '#065f46', fontWeight: 600 }}>{r.online}</td>
                <td style={{ padding: '8px', textAlign: 'right', color: '#991b1b', fontWeight: 600 }}>{r.offline}</td>
                <td style={{ padding: '8px', textAlign: 'right' }}>{pct}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
)}


  {tab === 'rotas' && (
    <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
      <label style={{ display: 'grid', gap: 6, fontSize: 13 }}>
        <span>Motorista (ID)</span>
        <input
          placeholder="ex: 123"
          value={selectedId ?? ''}
          onChange={(e) => setSelectedId(e.target.value)}
          style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #e5e7eb', outline: 'none' }}
        />
      </label>
      <button
        onClick={() => selectedId && (async () => { await handleRouteRequest(selectedId); })()}
        style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #2563eb', background: '#2563eb', color: '#fff', cursor: 'pointer' }}
      >
        Iniciar rota
      </button>
    </div>
  )}

  {tab === 'furtos' && (
    <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
      <label style={{ display: 'grid', gap: 6, fontSize: 13 }}>
        <span>Fonte dos dados (URL ou caminho)</span>
        <input
          value={heatUrl}
          onChange={(e) => setHeatUrl(e.target.value)}
          placeholder="/regiaodefurtos.json ou https://…"
          style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #e5e7eb' }}
        />
      </label>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <label style={{ display: 'grid', gap: 6, fontSize: 13 }}>
          <span>Raio (px)</span>
          <input
            type="number" min={5} max={80}
            value={heatRadius}
            onChange={(e) => setHeatRadius(Number(e.target.value))}
            style={{ padding: '8px 10px', borderRadius: 10, border: '1px solid #e5e7eb' }}
          />
        </label>
        <label style={{ display: 'grid', gap: 6, fontSize: 13 }}>
          <span>Opacidade</span>
          <input
            type="number" step="0.05" min={0.1} max={1}
            value={heatOpacity}
            onChange={(e) => setHeatOpacity(Number(e.target.value))}
            style={{ padding: '8px 10px', borderRadius: 10, border: '1px solid #e5e7eb' }}
          />
        </label>
      </div>

      <label style={{ display: 'grid', gap: 6, fontSize: 13 }}>
        <span>MaxIntensity (Maps) – opcional</span>
        <input
          type="number"
          value={heatMaxIntensity ?? ''}
          onChange={(e) => setHeatMaxIntensity(e.target.value === '' ? undefined : Number(e.target.value))}
          placeholder="ex: 3"
          style={{ padding: '8px 10px', borderRadius: 10, border: '1px solid #e5e7eb' }}
        />
      </label>

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={carregarFurtos}
          style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #2563eb', background: '#2563eb', color: '#fff', cursor: 'pointer' }}
        >
          Iniciar furtos
        </button>
        <button
          onClick={() => { setHeatmapEnabled(false); setHeatmapPoints([]); }}
          style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer' }}
        >
          Limpar
        </button>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginLeft: 'auto', fontSize: 13 }}>
          <input
            type="checkbox"
            checked={heatmapEnabled}
            onChange={(e) => setHeatmapEnabled(e.target.checked)}
          />
          Mostrar no mapa
        </label>
      </div>

      {heatStatus !== 'idle' && (
        <div
          style={{
            background: heatStatus==='error' ? '#fee2e2' : heatStatus==='ok' ? '#ecfdf5' : '#f3f4f6',
            border: '1px solid #e5e7eb', borderRadius: 8, padding: 8, fontSize: 13
          }}
        >
          {heatMsg}
        </div>
      )}
    </div>
  )}
</aside>

    </div>
  );
}
