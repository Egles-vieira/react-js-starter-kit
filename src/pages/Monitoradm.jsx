// Monitoramento.js
import React, { useState, useEffect, useRef, useMemo } from 'react';
import Mapa from '../components/Mapa.jsx';
import Grid from '../components/Gridadm';
import AudiosModal from '../components/AudiosModal';
import io from 'socket.io-client';

export default function Monitoramento() {
  const [drivers, setDrivers] = useState([]);
  const [driversInfo, setDriversInfo] = useState([]);
  const [rawLocs, setRawLocs] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [routePath, setRoutePath] = useState([]); // Para rota dinâmica
  const [mapHeight, setMapHeight] = useState(60);
  const [audiosModalOpen, setAudiosModalOpen] = useState(false);
  const [audiosList, setAudiosList] = useState([]);
  const [modalMotoristaId, setModalMotoristaId] = useState(null);
  const [motoristaSelecionado, setMotoristaSelecionado] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [filtroId, setFiltroId] = useState('');
  const [filtroData, setFiltroData] = useState('');
  const [filtroLocs, setFiltroLocs] = useState([]);
  const mapRef = useRef(null);
  const AUDIO_URL = 'https://app.roadweb.com.br';

  // Atualiza o timestamp a cada segundo para calcular tempo offline
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Última localização de cada motorista
  const ultimasLocalizacoes = useMemo(() => {
    if (!rawLocs.length) return [];
    const byDriver = {};
    rawLocs.forEach(loc => {
      if (!loc.id_motorista) return;
      if (
        !byDriver[loc.id_motorista] ||
        new Date(loc.timestamp) > new Date(byDriver[loc.id_motorista].timestamp)
      ) {
        byDriver[loc.id_motorista] = loc;
      }
    });
    return Object.values(byDriver);
  }, [rawLocs]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [locsRes, rawRes, infoRes] = await Promise.all([

          fetch('https://app.roadweb.com.br/api/locations'),
          fetch('https://app.roadweb.com.br/api/localizacoes'),
          fetch('https://app.roadweb.com.br/api/drivers-info'),


        ]);
        
        setDrivers(await locsRes.json());
        
        const novasLocs = await rawRes.json();
        setRawLocs(prev => {
          const ids = new Set(prev.map(p => p.id_localizacao));
          const novas = novasLocs.filter(p => !ids.has(p.id_localizacao));
          return [...prev, ...novas];
        });
        
        setDriversInfo(await infoRes.json());
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      }
    };
    
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {

    const socket = io('https://app.roadweb.com.br');

    
    socket.on('locationUpdate', upd => {
      const nova = {
        id_localizacao: upd.id_localizacao,
        id_motorista: upd.id,
        latitude: upd.lat,
        longitude: upd.lng,
        velocidade: upd.speed,
        bateria: upd.battery,
        timestamp: upd.lastUpdate,
      };
      
      setRawLocs(prev => {
        const existe = prev.some(p => p.id_localizacao === nova.id_localizacao);
        return existe ? prev : [...prev, nova];
      });
      
      setDrivers(curr =>
        curr.map(d =>
          d.id === upd.id ? { ...d, lat: upd.lat, lng: upd.lng } : d
        )
      );
      
      setDriversInfo(curr =>
        curr.map(r =>
          r.id_motorista === upd.id
            ? {
                ...r,
                latitude: upd.lat,
                longitude: upd.lng,
                velocidade: upd.speed,
                bateria: upd.battery,
                localizacao_timestamp: upd.lastUpdate,
              }
            : r
        )
      );
    });
    
    return () => socket.disconnect();
  }, []);

  // Filtra motoristas do dia atual
  const driversHoje = driversInfo.filter(d => {
    const data = d.localizacao_timestamp?.slice(0, 10);
    return data === new Date().toISOString().slice(0, 10);
  });

  // Verifica se motorista está offline (mais de 2 minutos sem atualização)
  const estaOffline = (ts) => {
    if (!ts) return true;
    return now - new Date(ts).getTime() > 2 * 60 * 1000;
  };

  // FUNÇÃO ROBUSTA para buscar rota do motorista
  const buscarRotaMotorista = async (id_motorista) => {
    if (!id_motorista) {
      setRoutePath([]);
      return;
    }

    try {
      // Busca histórico de localizações do motorista
      const res = await fetch(

        `https://app.roadweb.com.br/api/localizacoes-historico?id_motorista=${id_motorista}`

      );
      
      if (!res.ok) {
        throw new Error('Erro ao buscar histórico de localizações');
      }
      
      let data = await res.json();
      
      // Robustez máxima - diferentes formatos de resposta da API
      if (!Array.isArray(data)) {
        if (Array.isArray(data?.localizacoes)) {
          data = data.localizacoes;
        } else if (Array.isArray(data?.result)) {
          data = data.result;
        } else if (data && typeof data === 'object') {
          data = [data];
        } else {
          data = [];
        }
      }

      // Filtra apenas pontos válidos, ordena por timestamp e converte para formato do Google Maps
      const pontosValidos = data
        .filter(loc => loc.latitude && loc.longitude && loc.timestamp)
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
        .map(loc => ({
          lat: parseFloat(loc.latitude),
          lng: parseFloat(loc.longitude),
          timestamp: loc.timestamp
        }));

      setRoutePath(pontosValidos.map(({ lat, lng }) => ({ lat, lng })));

      // Ajusta o mapa para mostrar toda a rota se houver pontos
      if (mapRef.current && pontosValidos.length > 1) {
        const bounds = new window.google.maps.LatLngBounds();
        pontosValidos.forEach(point => bounds.extend(point));
        mapRef.current.fitBounds(bounds);
      } else if (mapRef.current && pontosValidos.length === 1) {
        // Se só há um ponto, centraliza nele
        mapRef.current.panTo(pontosValidos[0]);
        mapRef.current.setZoom(17);
      }

    } catch (error) {
      console.error('Erro ao buscar rota do motorista:', error);
      setRoutePath([]);
      throw error; // Re-throw para que o Grid possa mostrar erro
    }
  };

  // Função chamada quando clica numa linha da grid (SEM o botão de rota)
  const handleRowClick = (motorista) => {
    setSelectedId(motorista.id_motorista);
    
    // Limpa a rota quando seleciona um motorista diferente sem usar o botão de rota
    if (selectedId !== motorista.id_motorista) {
      setRoutePath([]);
    }

    // Centraliza no motorista atual
    if (mapRef.current && motorista.latitude && motorista.longitude) {
      mapRef.current.panTo({
        lat: parseFloat(motorista.latitude),
        lng: parseFloat(motorista.longitude),
      });
      mapRef.current.setZoom(17);
    }
  };

  // Função chamada quando clica no botão "Ver Rota" do grid
  const handleRouteRequest = async (id_motorista) => {
    await buscarRotaMotorista(id_motorista);
    // Seleciona o motorista após carregar a rota
    setSelectedId(id_motorista);
  };

  // Função chamada quando clica num marcador no mapa
  const onSelectMotorista = (motorista) => {
    setSelectedId(motorista.id_motorista || motorista.id);
    // Limpa rota quando seleciona pelo mapa
    setRoutePath([]);
  };

  // Limpa a rota e seleção
  const limparSelecaoMotorista = () => {
    setSelectedId(null);
    setRoutePath([]);
  };

  // Função para abrir modal de áudios
  const handleOpenAudiosModal = async (id_motorista) => {
    try {
      const motorista = driversInfo.find(d => d.id_motorista === id_motorista);
      setMotoristaSelecionado(motorista);
      
      const res = await fetch(`${AUDIO_URL}/api/audios/${id_motorista}`);
      const data = await res.json();
      
      const now = Date.now();
      const audiosComStatus = data.map(audio => {
        const ts = new Date(audio.timestamp || audio.data_gravacao).getTime();
        return { 
          ...audio, 
          status: now - ts > 2 * 60 * 1000 ? 'offline' : 'online' 
        };
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
      try {
        return JSON.parse(localStorage.getItem('ativos')) || {};
      } catch {
        return {};
      }
    });


  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Mapa */}
      <div style={{ flex: `0 0 ${mapHeight}%` }}>
        <Mapa
          drivers={ultimasLocalizacoes}
          ativos={ativos}
          setAtivos={setAtivos}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          routePath={routePath}
          onSelectMotorista={onSelectMotorista}
          estaOffline={estaOffline}
          mapRef={mapRef}
        />
      </div>

      {/* Divisor redimensionável */}
      <div
        style={{ 
          height: '10px', 
          background: '#ccc', 
          cursor: 'row-resize',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderTop: '1px solid #999',
          borderBottom: '1px solid #999'
        }}
        onMouseDown={e => {
          e.preventDefault();
          const handleDrag = (e) => {
            const y = e.clientY || (e.touches && e.touches[0].clientY);
            const vh = window.innerHeight;
            const newHeight = Math.max(30, Math.min(80, (y / vh) * 100));
            setMapHeight(newHeight);
          };
          
          const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleDrag);
            document.removeEventListener('mouseup', handleMouseUp);
          };
          
          document.addEventListener('mousemove', handleDrag);
          document.addEventListener('mouseup', handleMouseUp);
        }}
        onTouchStart={e => {
          e.preventDefault();
          const handleDrag = (e) => {
            const y = e.touches && e.touches[0].clientY;
            if (y) {
              const vh = window.innerHeight;
              const newHeight = Math.max(30, Math.min(80, (y / vh) * 100));
              setMapHeight(newHeight);
            }
          };
          
          const handleTouchEnd = () => {
            document.removeEventListener('touchmove', handleDrag);
            document.removeEventListener('touchend', handleTouchEnd);
          };
          
          document.addEventListener('touchmove', handleDrag);
          document.addEventListener('touchend', handleTouchEnd);
        }}
      >
        <div style={{ 
          width: '30px', 
          height: '4px', 
          background: '#666', 
          borderRadius: '2px' 
        }} />
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
          riscoPorMotorista={{}} // Adicione sua lógica de risco se necessário
          handleOpenAudiosModal={handleOpenAudiosModal}
          AUDIO_URL={AUDIO_URL}
          onRouteRequest={handleRouteRequest} // Nova prop para buscar rota
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
        telefone={motoristaSelecionado?.telefone}
      />

      {/* Botão para limpar seleção (opcional) */}
      {selectedId && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 1000
        }}>
          <button
            onClick={limparSelecaoMotorista}
            style={{
              backgroundColor: '#ff4444',
              color: 'white',
              border: 'none',
              padding: '10px 15px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
            }}
          >
            Limpar Seleção
          </button>
        </div>
      )}
    </div>
  );
}