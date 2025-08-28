import React from 'react';

export default function DetalhesEntregas({ romaneio }) {
  return (
    <div style={{
      marginTop: 30,
      padding: 20,
      border: '1px solid #ccc',
      borderRadius: 8,
      backgroundColor: '#fff'
    }}>
      <h3>Entregas do Romaneio {romaneio.numero}</h3>
      <p><strong>Transportador:</strong> {romaneio.transportador}</p>
      <p><strong>Motorista:</strong> {romaneio.motorista}</p>
      <p><strong>Placa:</strong> {romaneio.placa}</p>
      <p><strong>Data:</strong> {romaneio.data}</p>
    </div>
  );
}