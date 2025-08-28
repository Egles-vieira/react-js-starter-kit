import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import Mapa from '../components/Mapa';

export default function Historico() {
  const [driversInfo, setDriversInfo] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filtroId, setFiltroId] = useState('');
  const [filtroData, setFiltroData] = useState('');
  const [filtroLocs, setFiltroLocs] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [painelAberto, setPainelAberto] = useState(false);

  const mapRef = useRef(null);

  const API_URL = 'https://app.roadweb.com.br';


  useEffect(() => {
    fetch(`${API_URL}/api/drivers-info`)
      .then(res => res.json())
      .then(setDriversInfo);
  }, []);

  const buscarHistorico = async () => {
    if (!filtroId || !filtroData) {
      alert('Preencha motorista e data');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/localizacoes-historico?id_motorista=${filtroId}&data=${filtroData}`);
      const data = await res.json();
      setFiltroLocs([]);
      setSelectedId(null);
      setTimeout(() => {
        setFiltroLocs(data);
        setSelectedId(filtroId);
        setLoading(false);
      }, 50);
    } catch (err) {
      console.error('Erro ao buscar histórico:', err);
      setLoading(false);
    }
  };

  const limparFiltro = () => {
    setFiltroId('');
    setFiltroData('');
    setFiltroLocs([]);
    setSelectedId(null);
  };
const gerarRelatorioPDF = async () => {
  if (!filtroLocs.length) {
    alert('Nenhuma rota para gerar relatório');
    return;
  }

  const doc = new jsPDF('p', 'mm', 'a4');
  const motorista = driversInfo.find(d => d.id_motorista === parseInt(filtroId));
  const totalKm = calcularDistanciaTotalKm(filtroLocs).toFixed(2);
  const velMedia = calcularVelocidadeMedia(filtroLocs).toFixed(2);

  doc.setFontSize(18);
  doc.setTextColor(40);
  doc.text(`📍 Relatório de Rota`, 14, 20);

  doc.setFontSize(12);
  doc.setTextColor(80);
  doc.text(`Motorista: ${motorista?.nome || '-'}`, 14, 30);
  doc.text(`CPF: ${motorista?.cpf || '-'}`, 14, 36);
  doc.text(`Placa: ${motorista?.placa || '-'}`, 14, 42);
  doc.text(`Data: ${filtroData}`, 14, 48);
  doc.text(`Distância total: ${totalKm} km`, 14, 54);
  doc.text(`Velocidade média: ${velMedia} km/h`, 14, 60);

  const mapElement = document.querySelector('#map-print');
  const canvas = await html2canvas(mapElement);
  const imgData = canvas.toDataURL('image/png');
  doc.setDrawColor(200);
  doc.line(14, 66, 200, 66);
  doc.addImage(imgData, 'PNG', 14, 70, 180, 80);

  doc.setFontSize(11);
  doc.text('🧭 Registro de Posições (limitado aos primeiros 25 pontos):', 14, 158);

  let y = 166;
  filtroLocs.slice(0, 25).forEach((loc, i) => {
    const linha = `${i + 1}. ${new Date(loc.timestamp).toLocaleString()} - Lat: ${loc.latitude}, Lng: ${loc.longitude} - Vel: ${loc.velocidade} km/h - Bat: ${loc.bateria}%`;
    doc.text(linha, 14, y);
    y += 6;
    if (y > 280) {
      doc.addPage();
      y = 20;
    }
  });

  doc.save(`relatorio-rota-${motorista?.nome || 'motorista'}.pdf`);
};
  const filteredDrivers = useMemo(() => {
    return driversInfo.filter(driver =>
      driver.nome.toLowerCase().includes(searchText.toLowerCase()) ||
      driver.cpf.includes(searchText)
    );
  }, [searchText, driversInfo]);

  const path = useMemo(() => {
    const pontosFiltrados = [];
    let ultimo = null;

    filtroLocs
      .filter(loc =>
        loc.latitude &&
        loc.longitude &&
        !isNaN(parseFloat(loc.latitude)) &&
        !isNaN(parseFloat(loc.longitude))
      )
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .forEach(loc => {
        const lat = parseFloat(loc.latitude);
        const lng = parseFloat(loc.longitude);

        if (ultimo && lat === ultimo.lat && lng === ultimo.lng) return;

        const dist = ultimo ? Math.sqrt(Math.pow(lat - ultimo.lat, 2) + Math.pow(lng - ultimo.lng, 2)) : 0;
        if (dist > 0.1) return;

        pontosFiltrados.push({
          lat,
          lng,
          info: {
            timestamp: loc.timestamp,
            velocidade: loc.velocidade,
            bateria: loc.bateria
          }
        });
        ultimo = { lat, lng };
      });

    return pontosFiltrados;
  }, [filtroLocs]);

  return (
    <div style={{ height: '100vh', position: 'relative' }}>
      <div
        style={{
          position: 'absolute',
          top: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          background: 'white',
          padding: 12,
          borderRadius: 8,
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          flexWrap: 'wrap',
          maxWidth: '90%'
        }}
      >
        <input
          type="text"
          placeholder="Nome ou CPF..."
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc', minWidth: 200 }}
        />
        <select
          value={filtroId}
          onChange={e => setFiltroId(e.target.value)}
          style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc', minWidth: 220 }}
        >
          <option value="">Selecione o motorista</option>
          {filteredDrivers.map(d => (
            <option key={d.id_motorista} value={d.id_motorista}>
              {d.nome} ({d.cpf})
            </option>
          ))}
        </select>
        <input
          type="date"
          value={filtroData}
          onChange={e => setFiltroData(e.target.value)}
          style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc', minWidth: 130 }}
        />
        <button
          onClick={buscarHistorico}
          style={{
            padding: '8px 16px',
            backgroundColor: '#06C8E3',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            height: 38,
            fontWeight: 500
          }}
        >
          Buscar
        </button>
      

        <button
          onClick={gerarRelatorioPDF}
          style={{
            padding: '8px 16px',
            backgroundColor: '#4CAF50',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            height: 38,
            fontWeight: 500
          }}
        >
          Gerar PDF
        </button>
      </div>

      <button
        onClick={() => setPainelAberto(!painelAberto)}
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
          zIndex: 15,
          background: '#FF612B',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          padding: '10px 14px',
          cursor: 'pointer'
        }}
      >
        ☰ 
      </button>

      {loading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(20, 224, 213, 0.95)',
          padding: 20,
          borderRadius: 10,
          zIndex: 20
        }}>
          Carregando rota...
        </div>
      )}

      <div style={{ height: '100%', width: '100%' }}>
        <Mapa
          drivers={[]}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          driversInfo={driversInfo}
          routePath={path}
          mapRef={mapRef}
        />
      </div>
    </div>
  );
}


const calcularDistanciaTotalKm = (locs) => {
  let total = 0;
  for (let i = 1; i < locs.length; i++) {
    const lat1 = parseFloat(locs[i - 1].latitude);
    const lng1 = parseFloat(locs[i - 1].longitude);
    const lat2 = parseFloat(locs[i].latitude);
    const lng2 = parseFloat(locs[i].longitude);
    const rad = Math.PI / 180;
    const dLat = (lat2 - lat1) * rad;
    const dLng = (lng2 - lng1) * rad;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*rad) * Math.cos(lat2*rad) * Math.sin(dLng/2)**2;
    total += 6371 * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  }
  return total;
};

const calcularVelocidadeMedia = (locs) => {
  const velocidades = locs.map(l => parseFloat(l.velocidade)).filter(v => !isNaN(v));
  const total = velocidades.reduce((a, b) => a + b, 0);
  return velocidades.length ? total / velocidades.length : 0;
};


