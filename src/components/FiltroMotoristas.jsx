import React, { useState } from 'react';

export default function FiltroMotoristas({ onFiltrar, onNovo }) {
  const [mostrar, setMostrar] = useState(false);
  const [filtros, setFiltros] = useState({
    nome: '',
    cpf: '',
    unidade: ''
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
        Pesquisar motoristas {mostrar ? '▲' : '▼'}
      </div>

      {mostrar && (
        <div style={{ padding: 16, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div>
            <label style={{ fontSize: 13, color: '#555' }}>Nome</label><br />
            <input
              type="text"
              name="nome"
              value={filtros.nome}
              onChange={handleChange}
              placeholder="Digite o nome"
              style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc', minWidth: 200 }}
            />
          </div>
          <div>
            <label style={{ fontSize: 13, color: '#555' }}>CPF</label><br />
            <input
              type="text"
              name="cpf"
              value={filtros.cpf}
              onChange={handleChange}
              placeholder="Digite o CPF"
              style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc', minWidth: 120 }}
            />
          </div>
          <div>
            <label style={{ fontSize: 13, color: '#555' }}>Unidade</label><br />
            <input
              type="text"
              name="unidade"
              value={filtros.unidade}
              onChange={handleChange}
              placeholder="Digite a unidade"
              style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc', minWidth: 120 }}
            />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={handleBuscar}
              style={{
                padding: '8px 16px',
                background: '#FF612B',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Buscar
            </button>
            <button
              onClick={onNovo}
              style={{
                padding: '8px 16px',
                background: '#008e78',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              + Cadastrar Motorista
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
