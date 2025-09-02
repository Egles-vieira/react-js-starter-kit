import React, { useRef, useState, useEffect } from 'react';
import { GoogleMap, Polyline, InfoWindow, Marker } from '@react-google-maps/api';

interface MapaProps {
  drivers: any[];
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  routePath: any[];
  onSelectMotorista: (motorista: any) => void;
  estaOffline: (ts: string) => boolean;
  mapRef: React.MutableRefObject<any>;
  ativos: any;
  setAtivos: (ativos: any) => void;
  filtroAtivo: string;
  heatmapEnabled: boolean;
  heatmapPoints: any[];
  heatmapOptions: any;
  now: number;
}

export default function Mapa({
  drivers = [],
  selectedId = null,
  setSelectedId = () => {},
  routePath = [],
  onSelectMotorista = () => {},
  estaOffline = () => false,
  mapRef,
  ativos = {},
  setAtivos = () => {},
  filtroAtivo = 'todos',
  heatmapEnabled = false,
  heatmapPoints = [],
  heatmapOptions = { radius: 30, opacity: 0.6, maxIntensity: undefined },
  now,
}: MapaProps) {
  const DEFAULT_CENTER = { lat: -23.55052, lng: -46.633308 };
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [zoomLevel, setZoomLevel] = useState(12);
  const [hoveredMarkerId, setHoveredMarkerId] = useState(null);

  const [mudancasStatus, setMudancasStatus] = useState({});
  const statusAnterior = useRef<any>({});

  // Ref do HeatmapLayer (visualization lib do Google Maps)
  const heatLayerRef = useRef<any>(null);

  // Carrega ativos do storage ao montar
  useEffect(() => {
    try {
      const local = JSON.parse(localStorage.getItem('ativos')) || {};
      setAtivos(local);
    } catch {
      setAtivos({});
    }
  }, [setAtivos]);

  // Centraliza mapa no motorista selecionado
  useEffect(() => {
    if (!selectedId || !drivers.length) return;
    const motorista = drivers.find(d => String(d.id_motorista || d.id) === String(selectedId));
    if (motorista && motorista.latitude && motorista.longitude) {
      setMapCenter({
        lat: parseFloat(motorista.latitude),
        lng: parseFloat(motorista.longitude),
      });
      setZoomLevel(17);
    }
  }, [selectedId, drivers]);

  // Detecta mudança de status (online/offline)
  useEffect(() => {
    const novasMudancas = {};
    drivers.forEach(motorista => {
      const id = motorista.id_motorista || motorista.id;
      const atual = estaOffline((motorista as any).timestamp || (motorista as any).localizacao_timestamp);
      if (statusAnterior.current[id] !== undefined && statusAnterior.current[id] !== atual) {
        novasMudancas[id] = { mudouPara: atual ? 'offline' : 'online', timestamp: Date.now() };
      }
      statusAnterior.current[id] = atual;
    });
    if (Object.keys(novasMudancas).length > 0) {
      setMudancasStatus(prev => ({ ...prev, ...novasMudancas }));
    }
  }, [drivers, estaOffline]);

  // Remove mudanças antigas após 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      const agora = Date.now();
      setMudancasStatus(prev =>
        Object.fromEntries(
          Object.entries(prev).filter(([, v]: [string, any]) => agora - v.timestamp < 5000)
        )
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // ====== HEATMAP management ======
  const ensureHeatLayer = (map: any) => {
    if (!window.google?.maps?.visualization) return null;
    if (heatLayerRef.current) return heatLayerRef.current;
    const layer = new window.google.maps.visualization.HeatmapLayer({
      data: new window.google.maps.MVCArray([]),
      dissipating: true,
    });
    layer.setMap(null);
    heatLayerRef.current = layer;
    return layer;
  };

  // Atualiza a camada de heatmap quando dados/props mudarem
  useEffect(() => {
    const map = mapRef?.current;
    if (!map || !window.google?.maps) return;

    const layer = ensureHeatLayer(map);
    if (!layer) return;

    // Garantir que heatmapPoints é um array válido
    const validPoints = Array.isArray(heatmapPoints) ? heatmapPoints : [];
    
    const data = validPoints
      .filter(p => p && typeof p.lat === 'number' && typeof p.lng === 'number')
      .map((p: any) => ({
        location: new window.google.maps.LatLng(p.lat, p.lng),
        weight: p.weight || 1,
      }));
    
    const mvc = new window.google.maps.MVCArray(data);
    layer.setData(mvc);

    const opts: any = {};
    if (heatmapOptions?.radius != null) opts.radius = heatmapOptions.radius;
    if (heatmapOptions?.opacity != null) opts.opacity = heatmapOptions.opacity;
    if (heatmapOptions?.maxIntensity != null) opts.maxIntensity = heatmapOptions.maxIntensity;

    layer.setOptions(opts);
    layer.setMap(heatmapEnabled ? map : null);
  }, [heatmapEnabled, heatmapPoints, heatmapOptions, mapRef]);

  // ===== Render - Google Maps real
  return (
    <div id="map-print" className="relative h-full w-full overflow-hidden rounded-lg border border-border shadow-lg">
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={mapCenter}
        zoom={zoomLevel}
        onLoad={(map) => {
          if (mapRef) mapRef.current = map;
          ensureHeatLayer(map);
        }}
        options={{ clickableIcons: false }}
      >
        {drivers.map(motorista => {
          const id = motorista.id_motorista || motorista.id;
          if (!motorista.latitude || !motorista.longitude) return null;

          const ativoStatus = ativos[id];
          // Respeita filtro do grid
          if (
            (filtroAtivo === 'ativos' && !ativoStatus) ||
            (filtroAtivo === 'inativos' && ativoStatus === true) ||
            (filtroAtivo !== 'todos' && ativoStatus === undefined)
          ) return null;

          const offline = estaOffline((motorista as any).timestamp || (motorista as any).localizacao_timestamp);

          return (
            <Marker
              key={id}
              position={{
                lat: parseFloat(motorista.latitude || (motorista as any).lat),
                lng: parseFloat(motorista.longitude || (motorista as any).lng),
              }}
              icon={{
                url: offline
                  ? 'https://road-guard-audios.sfo3.cdn.digitaloceanspaces.com/icon-red.png'
                  : 'https://road-guard-audios.sfo3.cdn.digitaloceanspaces.com/icon-green.png',
                scaledSize: new window.google.maps.Size(44, 44),
              }}
              onClick={() => onSelectMotorista(motorista)}
              onMouseOver={() => setHoveredMarkerId(id)}
              onMouseOut={() => setHoveredMarkerId(null)}
            >
              {hoveredMarkerId === id && (
                <InfoWindow
                  position={{
                    lat: parseFloat(motorista.latitude),
                    lng: parseFloat(motorista.longitude),
                  }}
                >
                  <div style={{ fontSize: 13 }}>
                    <strong>{(motorista as any).nome}</strong><br />
                    Status: {offline ? 'Offline' : 'Online'}<br />
                    Velocidade: {(motorista as any).velocidade || 0} km/h<br />
                    Bateria: {(motorista as any).bateria != null ? (motorista as any).bateria + '%' : '—'}<br />
                    Última atualização: {(motorista as any).localizacao_timestamp
                      ? new Date((motorista as any).localizacao_timestamp).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
                      : '—'}
                  </div>
                </InfoWindow>
              )}
            </Marker>
          );
        })}

        {routePath.length > 1 && (
          <Polyline
            path={routePath}
            options={{
              strokeColor: 'hsl(var(--primary))',
              strokeOpacity: 0.8,
              strokeWeight: 6,
              icons: [{
                icon: {
                  path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                  scale: 4,
                  strokeColor: '#ffffff',
                  strokeWeight: 2,
                  fillColor: 'hsl(var(--primary))',
                  fillOpacity: 1,
                },
                offset: '0%',
                repeat: '100px',
              }],
            }}
          />
        )}

        {routePath.length > 0 && (
          <Marker
            position={routePath[0]}
            icon={{
              url: 'https://road-guard-audios.sfo3.cdn.digitaloceanspaces.com/icon-green.png',
              scaledSize: new window.google.maps.Size(32, 32),
            }}
            title="Início da rota"
          />
        )}

        {routePath.length > 1 && (
          <Marker
            position={routePath[routePath.length - 1]}
            icon={{
              url: 'https://road-guard-audios.sfo3.cdn.digitaloceanspaces.com/icon-red.png',
              scaledSize: new window.google.maps.Size(32, 32),
            }}
            title="Fim da rota"
          />
        )}
      </GoogleMap>
    </div>
  );
}