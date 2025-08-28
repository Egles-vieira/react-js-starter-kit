import React from 'react';

export default function TabelaRomaneios({ romaneios, onSelecionar }) {
  return (
    <table style={{ width: '100%', backgroundColor: '#fff', borderCollapse: 'collapse', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
      <thead>
        <tr style={{ backgroundColor: '#FF612B', color: '#fff' }}>
          {['Número', 'Data', 'Transportador', 'Placa', 'Motorista'].map((col, i) => (
            <th key={i} style={{ padding: 12, textAlign: 'left' }}>{col}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {romaneios.map((r, i) => (
          <tr key={i}
              style={{ backgroundColor: i % 2 === 0 ? '#f4f8fb' : '#fff', cursor: 'pointer' }}
              onClick={() => onSelecionar(r)}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#e0f7f9'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = i % 2 === 0 ? '#f4f8fb' : '#fff'}
          >
            <td style={{ padding: 12 }}>{r.numero}</td>
            <td style={{ padding: 12 }}>{r.data}</td>
            <td style={{ padding: 12 }}>{r.transportador}</td>
            <td style={{ padding: 12 }}>{r.placa}</td>
            <td style={{ padding: 12 }}>{r.motorista}</td>
          </tr>
        ))}
        {romaneios.length === 0 && (
          <tr>
            <td colSpan={5} style={{ padding: 20, textAlign: 'center', color: '#999' }}>
              Nenhum romaneio encontrado.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}