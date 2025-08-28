// src/components/Mapa.js
import React, { useRef, useState, useEffect } from 'react';
import { GoogleMap, Polyline, InfoWindow, Marker } from '@react-google-maps/api';

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

  // ===== Heatmap (novos props) =====
  heatmapEnabled = false,
  heatmapPoints = [],
  heatmapOptions = { radius: 30, opacity: 0.6, maxIntensity: undefined },
}) {
  const DEFAULT_CENTER = { lat: -23.55052, lng: -46.633308 };
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [zoomLevel, setZoomLevel] = useState(12);
  const [hoveredMarkerId, setHoveredMarkerId] = useState(null);

  const [mudancasStatus, setMudancasStatus] = useState({});
  const statusAnterior = useRef({});

  // Ref do HeatmapLayer (visualization lib do Google Maps)
  const heatLayerRef = useRef(null);

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
      const atual = estaOffline(motorista.timestamp || motorista.localizacao_timestamp);
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
          Object.entries(prev).filter(([, v]) => agora - v.timestamp < 5000)
        )
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // ====== HEATMAP management ======
  const ensureHeatLayer = (map) => {
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

    const data = heatmapPoints.map(p => ({
      location: new window.google.maps.LatLng(p.lat, p.lng),
      weight: p.weight || 1,
    }));
    const mvc = new window.google.maps.MVCArray(data);
    layer.setData(mvc);

    const opts = {};
    if (heatmapOptions?.radius != null) opts.radius = heatmapOptions.radius;
    if (heatmapOptions?.opacity != null) opts.opacity = heatmapOptions.opacity;
    if (heatmapOptions?.maxIntensity != null) opts.maxIntensity = heatmapOptions.maxIntensity;

    layer.setOptions(opts);
    layer.setMap(heatmapEnabled ? map : null);
  }, [heatmapEnabled, heatmapPoints, heatmapOptions, mapRef]);

  // ===== Render
  return (
    <div className="h-full w-full bg-gradient-to-br from-muted/20 to-muted/40 rounded-lg overflow-hidden shadow-inner border border-border/30">
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={mapCenter}
        zoom={zoomLevel}
        onLoad={(map) => {
          if (mapRef) mapRef.current = map;
          // cria heatlayer no load (sem depender de regra do eslint)
          ensureHeatLayer(map);
        }}
        options={{ 
          clickableIcons: false,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }]
            },
            {
              featureType: "road",
              elementType: "labels.icon",
              stylers: [{ visibility: "off" }]
            }
          ]
        }}
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

          const offline = estaOffline(motorista.timestamp || motorista.localizacao_timestamp);

          return (
            <Marker
              key={id}
              position={{
                lat: parseFloat(motorista.latitude || motorista.lat),
                lng: parseFloat(motorista.longitude || motorista.lng),
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
                  <div className="p-3 bg-gradient-to-br from-card to-card/90 rounded-lg shadow-lg min-w-[200px]">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 pb-2 border-b border-border/30">
                        <div className={`w-3 h-3 rounded-full ${offline ? 'bg-destructive animate-pulse' : 'bg-success'}`}></div>
                        <h3 className="font-semibold text-foreground">{motorista.nome}</h3>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground">Status:</span>
                            <span className={`font-medium ${offline ? 'text-destructive' : 'text-success'}`}>
                              {offline ? 'Offline' : 'Online'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground">Velocidade:</span>
                            <span className="font-medium text-foreground">{motorista.velocidade || 0} km/h</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground">Bateria:</span>
                            <span className={`font-medium ${
                              motorista.bateria > 50 ? 'text-success' : 
                              motorista.bateria > 20 ? 'text-warning' : 'text-destructive'
                            }`}>
                              {motorista.bateria != null ? motorista.bateria + '%' : '—'}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {motorista.localizacao_timestamp
                              ? new Date(motorista.localizacao_timestamp).toLocaleString('pt-BR', { 
                                  timeZone: 'America/Sao_Paulo',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              : '—'}
                          </div>
                        </div>
                      </div>
                    </div>
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
              strokeColor: '#FF612B',
              strokeOpacity: 0.9,
              strokeWeight: 4,
              icons: [{
                icon: {
                  path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                  scale: 3,
                  strokeColor: '#ffffff',
                  strokeWeight: 1,
                  fillColor: '#FF612B',
                  fillOpacity: 1,
                },
                offset: '0%',
                repeat: '80px',
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
