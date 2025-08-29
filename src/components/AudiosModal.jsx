import React, { useState, useEffect } from 'react';

export default function AudiosModal({ isOpen, onClose, audiosList, motoristaId, audioBaseUrl, nome, cpf, telefone }) {
  const [filtroData, setFiltroData] = useState(new Date().toISOString().slice(0, 10));
  const [filtrados, setFiltrados] = useState([]);

  useEffect(() => {
    const [year, month, day] = filtroData.split('-');
    const inicio = new Date(year, month - 1, day, 0, 0, 0);
    const fim = new Date(year, month - 1, day, 23, 59, 59, 999);

    const lista = audiosList.filter(a => {
      const dataCriacao = new Date(a.created_at);
      return dataCriacao >= inicio && dataCriacao <= fim;
    });
    setFiltrados(lista);
  }, [filtroData, audiosList]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999
    }}>
      <div style={{
        background: '#fff', padding: 24, borderRadius: 12,
        maxHeight: '90%', overflowY: 'auto', width: '95%', maxWidth: 750,
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
      }}>
        <div style={{ textAlign: 'right' }}>
          <button onClick={onClose} style={{ padding: '6px 16px', borderRadius: 6, background: '#FF612B', color: '#fff', border: 'none' }}>Fechar</button>
        </div>
        <h2 style={{ marginTop: 0 }}>Áudios do motorista #{motoristaId} - {nome}</h2>
        <p style={{ fontSize: 14, marginBottom: 10, color: '#555' }}>
          <strong>CPF:</strong> {cpf} | <strong>Telefone:</strong> {telefone}
        </p>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 14, fontWeight: 500 }}>Filtrar por data:&nbsp;</label>
          <input type="date" value={filtroData} onChange={e => setFiltroData(e.target.value)} />
        </div>

        {filtrados.length === 0 ? (
          <p style={{ color: '#666' }}>Nenhum áudio encontrado nesta data.</p>
        ) : (
          <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
            {filtrados.map((a, i) => (
              <li key={i} style={{ marginBottom: 20, borderBottom: '1px solid #ccc', paddingBottom: 10 }}>
                <audio controls style={{ width: '100%' }}>
                   <source 
   src={
     a.arquivo_url.startsWith('http')
       ? a.arquivo_url
       : `${audioBaseUrl}${a.arquivo_url}`
   } 
   type="audio/mpeg" 
 />
                </audio>
                <div style={{ marginTop: 8 }}>
                  <a href={`${audioBaseUrl}${a.arquivo_url}`} download style={{ fontSize: 13, color: '#FF612B', textDecoration: 'none' }}>
                    ⬇️ Baixar áudio
                  </a>
                  <br />
                  <small style={{ color: '#555' }}>
                    {new Date(a.created_at).toLocaleString()} • {a.tamanho_kb} KB<br />
                    Status: {a.status === 'offline' ? (
                      <span style={{ color: 'red' }}>Offline</span>
                    ) : (
                      <span style={{ color: 'green' }}>Online</span>
                    )}
                  </small>
                </div>
              </li>
            ))}
          </ul>
        )}

        
      </div>
    </div>
  );
}