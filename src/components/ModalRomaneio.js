import React from 'react';

export default function ModalRomaneio({ onClose, onSave }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    onSave(data);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
      justifyContent: 'center', alignItems: 'center', zIndex: 999
    }}>
      <form onSubmit={handleSubmit} style={{
        background: '#fff', padding: 24, borderRadius: 8,
        width: '100%', maxWidth: 600, overflowY: 'auto', maxHeight: '90vh'
      }}>
        <h2>Gerar Romaneio</h2>

        <h3>Pedido</h3>
        <input name="numero" placeholder="Número" required style={estiloInput} />
        <input name="data" type="date" required style={estiloInput} />
        <input name="peso" placeholder="Peso" required style={estiloInput} />
        <input name="volume" placeholder="Volume" required style={estiloInput} />

        <h3>Transportador</h3>
        <input name="transportador" placeholder="Transportador" required style={estiloInput} />
        <input name="placa" placeholder="Placa" required style={estiloInput} />
        <input name="motorista" placeholder="Motorista" required style={estiloInput} />

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
          <button type="button" onClick={onClose} style={estiloBotaoSec}>Cancelar</button>
          <button type="submit" style={estiloBotao}>Salvar</button>
        </div>
      </form>
    </div>
  );
}

const estiloInput = {
  width: '100%',
  marginBottom: 10,
  padding: 10,
  border: '1px solid #ccc',
  borderRadius: 6
};

const estiloBotao = {
  backgroundColor: '#FF612B',
  color: '#000',
  padding: '10px 20px',
  borderRadius: 6,
  fontWeight: 'bold',
  border: 'none',
  cursor: 'pointer'
};

const estiloBotaoSec = {
  backgroundColor: '#e0e0e0',
  color: '#000',
  padding: '10px 20px',
  borderRadius: 6,
  border: 'none',
  cursor: 'pointer'
};