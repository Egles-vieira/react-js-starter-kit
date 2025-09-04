import React, { useState, useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'https://app.roadweb.com.br';

export default function FormularioRomaneio({ editar, romaneioSelecionado, onSalvo }) {
  const [formData, setFormData] = useState({
    numero: '',
    unidade: '',
    placa_cavalo: '',
    placa_carreta: '',
    motorista_id: '',
    peso: '',
    cubagem: '',
    roteirizar: false
  });

  useEffect(() => {
    if (editar && romaneioSelecionado) {
      setFormData({
        numero: romaneioSelecionado.numero || '',
        unidade: romaneioSelecionado.unidade || '',
        placa_cavalo: romaneioSelecionado.placa_cavalo || '',
        placa_carreta: romaneioSelecionado.placa_carreta || '',
        motorista_id: romaneioSelecionado.motorista_id || '',
        peso: romaneioSelecionado.peso || '',
        cubagem: romaneioSelecionado.cubagem || '',
        roteirizar: romaneioSelecionado.roteirizar || false
      });
    }
  }, [editar, romaneioSelecionado]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = editar 
        ? `${API_URL}/api/romaneios/${romaneioSelecionado.id}`
        : `${API_URL}/api/romaneios`;
      
      const method = editar ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        onSalvo();
        setFormData({
          numero: '',
          unidade: '',
          placa_cavalo: '',
          placa_carreta: '',
          motorista_id: '',
          peso: '',
          cubagem: '',
          roteirizar: false
        });
      } else {
        console.error('Erro ao salvar romaneio');
      }
    } catch (error) {
      console.error('Erro ao salvar romaneio:', error);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div>
      <h2>{editar ? 'Editar Romaneio' : 'Cadastrar Romaneio'}</h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 20 }}>
        <div>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
            Número:
          </label>
          <input
            type="text"
            value={formData.numero}
            onChange={(e) => handleChange('numero', e.target.value)}
            style={{
              width: '100%',
              padding: 8,
              border: '1px solid #ccc',
              borderRadius: 4,
              fontSize: 14
            }}
            required
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
            Unidade:
          </label>
          <input
            type="text"
            value={formData.unidade}
            onChange={(e) => handleChange('unidade', e.target.value)}
            style={{
              width: '100%',
              padding: 8,
              border: '1px solid #ccc',
              borderRadius: 4,
              fontSize: 14
            }}
            required
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
            Placa Cavalo:
          </label>
          <input
            type="text"
            value={formData.placa_cavalo}
            onChange={(e) => handleChange('placa_cavalo', e.target.value)}
            style={{
              width: '100%',
              padding: 8,
              border: '1px solid #ccc',
              borderRadius: 4,
              fontSize: 14
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
            Placa Carreta:
          </label>
          <input
            type="text"
            value={formData.placa_carreta}
            onChange={(e) => handleChange('placa_carreta', e.target.value)}
            style={{
              width: '100%',
              padding: 8,
              border: '1px solid #ccc',
              borderRadius: 4,
              fontSize: 14
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
            ID Motorista:
          </label>
          <input
            type="text"
            value={formData.motorista_id}
            onChange={(e) => handleChange('motorista_id', e.target.value)}
            style={{
              width: '100%',
              padding: 8,
              border: '1px solid #ccc',
              borderRadius: 4,
              fontSize: 14
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
            Peso:
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.peso}
            onChange={(e) => handleChange('peso', e.target.value)}
            style={{
              width: '100%',
              padding: 8,
              border: '1px solid #ccc',
              borderRadius: 4,
              fontSize: 14
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
            Cubagem:
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.cubagem}
            onChange={(e) => handleChange('cubagem', e.target.value)}
            style={{
              width: '100%',
              padding: 8,
              border: '1px solid #ccc',
              borderRadius: 4,
              fontSize: 14
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gridColumn: '1 / -1' }}>
          <input
            type="checkbox"
            checked={formData.roteirizar}
            onChange={(e) => handleChange('roteirizar', e.target.checked)}
            style={{ marginRight: 8 }}
          />
          <label style={{ fontWeight: 'bold' }}>
            Roteirizar
          </label>
        </div>

        <div style={{ gridColumn: '1 / -1', textAlign: 'right', marginTop: 20 }}>
          <button
            type="submit"
            style={{
              backgroundColor: '#FF612B',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '10px 20px',
              fontSize: 14,
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            {editar ? 'Atualizar' : 'Cadastrar'}
          </button>
        </div>
      </form>
    </div>
  );
}