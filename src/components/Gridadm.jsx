import React, { useState, useEffect } from 'react';
import { FaBatteryFull, FaTachometerAlt, FaHeadphonesAlt, FaRoute } from 'react-icons/fa';

export default function Grid({ 
  driversHoje, 
  selectedId, 
  handleRowClick, 
  estaOffline, 
  riscoPorMotorista, 
  handleOpenAudiosModal, 
  AUDIO_URL,
  onRouteRequest // Nova prop para solicitar rota
}) {
  // PERSISTE O FILTRO NO LOCALSTORAGE
  const [filtroAtivo, setFiltroAtivo] = useState(() => localStorage.getItem('filtroAtivo') || 'todos');
  useEffect(() => {
    localStorage.setItem('filtroAtivo', filtroAtivo);
  }, [filtroAtivo]);

  // PERSISTE STATUS ATIVO NO LOCALSTORAGE (por id_motorista)
  const [ativos, setAtivos] = useState (() => {
    try {
      return JSON.parse(localStorage.getItem('ativos')) || {};
    } catch {
      return {};
    }
  });

  // Estado para controlar loading da rota
  const [loadingRoute, setLoadingRoute] = useState(null);

  // Atualiza e persiste status ativo
  const handleToggleAtivo = (idMotorista, novoStatus) => {
    const novosAtivos = { ...ativos, [idMotorista]: novoStatus };
    setAtivos(novosAtivos);
    localStorage.setItem('ativos', JSON.stringify(novosAtivos));
    // Se quiser integrar com API, pode chamar aqui também!
  };

  // Função para buscar rota do motorista
  const handleBuscarRota = async (motorista) => {
    if (!onRouteRequest) return;
    
    setLoadingRoute(motorista.id_motorista);
    
    try {
      // Chama a função passada como prop para buscar a rota
      await onRouteRequest(motorista.id_motorista);
      // Seleciona o motorista após carregar a rota
      handleRowClick(motorista);
    } catch (error) {
      console.error('Erro ao buscar rota:', error);
      alert('Erro ao carregar rota do motorista');
    } finally {
      setLoadingRoute(null);
    }
  };

  const now = Date.now();

  // Aplica campo "ativo" dos dados locais ou vindo da API
  const driversComAtivo = driversHoje.map(r => ({
    ...r,
    ativo: typeof ativos[r.id_motorista] === 'boolean' ? ativos[r.id_motorista] : !!r.ativo
  }));

  // Ordena: offline topo (maior tempo offline), depois online
  const sortedDrivers = [...driversComAtivo].sort((a, b) => {
    const aOffline = estaOffline(a.localizacao_timestamp);
    const bOffline = estaOffline(b.localizacao_timestamp);

    if (aOffline && !bOffline) return -1;
    if (!aOffline && bOffline) return 1;

    if (aOffline && bOffline) {
      const getMinutes = (ts) => {
        const diff = now - new Date(ts).getTime();
        return Math.floor(diff / 60000);
      };
      return getMinutes(b.localizacao_timestamp) - getMinutes(a.localizacao_timestamp);
    }
    return 0;
  });

  // Filtra conforme o filtro selecionado
  const driversFiltrados = sortedDrivers.filter(r => {
    if (filtroAtivo === 'ativos') return r.ativo;
    if (filtroAtivo === 'inativos') return !r.ativo;
    return true;
  });

  return (
    <div style={{
      background: '#fff',
      boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
      height: '100%',
      overflow: 'auto'
    }}>
      <div style={{ padding: '10px 15px' }}>
        <label style={{ marginRight: 10 }}>Filtrar motoristas:</label>
        <select
          value={filtroAtivo}
          onChange={e => setFiltroAtivo(e.target.value)}
          style={{
            padding: '6px 10px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            fontSize: 14
          }}
        >
          <option value="todos">Todos</option>
          <option value="ativos">Ativos</option>
          <option value="inativos">Inativos</option>
        </select>
      </div>

      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: 13,
        minWidth: 1300 // Aumentado para incluir nova coluna
      }}>
        <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
          <tr style={{
            backgroundColor: '#FF612B',
            color: '#000',
            fontWeight: 'bold',
            textTransform: 'uppercase'
          }}>
            {[
              'Ativo', 'Nome', 'CPF', 'Telefone', 'Status', 'Tempo Offline', 'Risco', 'Último Áudio', 'Áudios', 'Rota',
              'Placa', 'Modelo', 'Cor', 'Ano', 'ID Loc.', 'Lat', 'Lng', 'Velocidade', 'Bateria', 'Última Atualização'
            ].map((col, i) => (
              <th key={i} style={{ padding: '10px 8px', textAlign: 'left', fontWeight: 'bold' }}>{col}</th>
            ))}
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
                style={{
                  backgroundColor: isSel ? '#b2ebf2' : i % 2 === 0 ? '#f9f9f9' : '#ffffff',
                  cursor: 'pointer',
                  transition: 'background 0.3s, transform 0.3s ease-in-out'
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#e0f7fa'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = isSel ? '#b2ebf2' : i % 2 === 0 ? '#f9f9f9' : '#ffffff'}
              >
                <td>
                  <input
                    type="checkbox"
                    checked={!!r.ativo}
                    onChange={e => {
                      e.stopPropagation();
                      handleToggleAtivo(r.id_motorista, e.target.checked);
                    }}
                  />
                </td>
                <td onClick={() => handleRowClick(r)}>{r.nome}</td>
                <td onClick={() => handleRowClick(r)}>{r.cpf}</td>
                <td onClick={() => handleRowClick(r)}>{r.telefone}</td>
                <td onClick={() => handleRowClick(r)}>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '12px',
                    color: '#fff',
                    backgroundColor: off ? '#d32f2f' : '#388e3c',
                    animation: off ? 'pulse-strong-red 1.2s infinite' : undefined
                  }}>
                    {off ? 'Offline' : 'Online'}
                  </span>
                </td>
               
                <td onClick={() => handleRowClick(r)}>
                  {off ? (() => {
                    const diff = now - new Date(r.localizacao_timestamp).getTime();
                    const minutos = Math.floor(diff / 60000);
                    const segundos = Math.floor((diff % 60000) / 1000);
                    return `${minutos}m ${segundos}s`;
                  })() : '—'}
                </td>
                
                <td onClick={() => handleRowClick(r)}>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '12px',
                    color: '#000',
                    backgroundColor: riscoPorMotorista[r.id_motorista] ? '#ffc107' : '#e0e0e0',
                    animation: riscoPorMotorista[r.id_motorista] ? 'pulse-risk 1.5s infinite' : undefined
                  }}>
                    {riscoPorMotorista[r.id_motorista] ? 'Atenção' : 'Normal'}
                  </span>
                </td>
                <td onClick={() => handleRowClick(r)}>
             {r.audio_url ? (() => {
   // Se já for URL completa, usa direto; senão prefixa
   const src = r.audio_url.startsWith('http')
     ? r.audio_url
     : `${AUDIO_URL}${r.audio_url}`;
   return (
     <audio key={src} controls style={{ width: 140 }}>
       <source src={src} type="audio/mpeg" />
     </audio>
   );
 })() : (
   <span style={{ color: '#999' }}>–</span>
 )}
                </td>
                <td>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      handleOpenAudiosModal(r.id_motorista);
                    }}
                    style={{
                      backgroundColor: '#FF612B',
                      color: '#000',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontWeight: 'bold',
                      animation: off ? 'pulse-button 1.2s infinite' : undefined
                    }}
                  >
                    <FaHeadphonesAlt /> Ver todos
                  </button>
                </td>
                <td>
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
                      minWidth: '90px',
                      justifyContent: 'center'
                    }}
                  >
                    <FaRoute />
                    {isLoadingRoute ? 'Carregando...' : 'Ver Rota'}
                  </button>
                </td>
                <td onClick={() => handleRowClick(r)}>{r.placa || '-'}</td>
                <td onClick={() => handleRowClick(r)}>{r.modelo || '-'}</td>
                <td onClick={() => handleRowClick(r)}>{r.cor || '-'}</td>
                <td onClick={() => handleRowClick(r)}>{r.ano || '-'}</td>
                <td onClick={() => handleRowClick(r)}>{r.id_localizacao || '-'}</td>
                <td onClick={() => handleRowClick(r)}>{r.latitude || '-'}</td>
                <td onClick={() => handleRowClick(r)}>{r.longitude || '-'}</td>
                <td onClick={() => handleRowClick(r)}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FaTachometerAlt style={{ color: '#FF612B' }} />
                    {r.velocidade != null ? `${r.velocidade} km/h` : '-'}
                  </span>
                </td>
                <td onClick={() => handleRowClick(r)}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FaBatteryFull style={{ color: r.bateria > 50 ? 'green' : r.bateria > 20 ? 'orange' : 'red' }} />
                    {r.bateria != null ? `${r.bateria}%` : '-'}
                  </span>
                </td>
                <td onClick={() => handleRowClick(r)}>{r.localizacao_timestamp ? new Date(r.localizacao_timestamp).toLocaleString() : '-'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Animações inline */}
      <style>
        {`
          @keyframes pulse-red {
            0% { background-color:rgb(231, 231, 231); }
            50% { background-color: #ff0000; }
            100% { background-color:rgb(172, 172, 172); }
          }

          @keyframes pulse-strong-red {
            0% { background-color:rgb(147, 143, 143); }
            50% { background-color: #ff0000; }
            100% { background-color:rgb(168, 168, 168); }
          }

          @keyframes pulse-risk {
            0% { background-color: #ffc107; }
            50% { background-color: #ff8f00; }
            100% { background-color: #ffc107; }
          }
        `}
      </style>
    </div>
  );
}