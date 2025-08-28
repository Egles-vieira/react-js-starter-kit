import React, { useState } from 'react';

export default function FiltroNotas({ onFiltrar }) {
  const [mostrar, setMostrar] = useState(false);
  const [filtros, setFiltros] = useState({
    chave_nf: '',
    nro_pedido: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  const handleBuscar = () => {
    onFiltrar(filtros);
  };

  return (
    <div style={{ marginBottom: 20, border: '1px solid #fff', borderRadius: 8, background: '#fff' }}>
      <div
        onClick={() => setMostrar(!mostrar)}
        style={{ padding: '10px 16px', cursor: 'pointer', fontWeight: 'bold', background: '#fff', borderBottom: '1px solid #ddd' }}
      >
        Pesquisar entregas {mostrar ? '▲' : '▼'}
      </div>

      {mostrar && (
        <div style={{ padding: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <label style={{ fontSize: 13, color: '#555' }}>Chave NF</label><br />
            <input
              type="text"
              name="chave_nf"
              value={filtros.chave_nf}
              onChange={handleChange}
              placeholder="Digite a chave da NF"
              style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc', minWidth: 220,  outline: 'none'}}
              onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px #00bfff'}
              onBlur={(e) => e.target.style.boxShadow = '0 0 0 2px transparent'}
            />
          </div>
          <div>
            <label style={{ fontSize: 13, color: '#555' }}>Nº Pedido</label><br />
            <input
              type="text"
              name="nro_pedido"
              value={filtros.nro_pedido}
              onChange={handleChange}
              placeholder="Digite o nº do pedido"
              style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc', minWidth: 150, outline: 'none', 

              }}               
              onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px #00bfff'}
              onBlur={(e) => e.target.style.boxShadow = '0 0 0 2px transparent'}
            />
            
          </div>
          <div style={{ alignSelf: 'flex-end' }}>
            <button
              onClick={handleBuscar}
              style={{ padding: '8px 16px', background: '#FF612B', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', outline: 'none', }}
              onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px #00bfff'}
              onBlur={(e) => e.target.style.boxShadow = '0 0 0 2px transparent'}
            >
              Buscar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}