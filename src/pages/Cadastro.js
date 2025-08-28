import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';


const API_URL = process.env.REACT_APP_API_URL || 'https://app.roadweb.com.br';


export default function Cadastro() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nome: '',
    cpf: '',
    telefone: '',
    profilePic: null,
    licenseDoc: null,
    placa: '',
    modelo: '',
    cor: '',
    ano: '',
    emailVerificado: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/motoristas/${id}`);
        const drv = await res.json();
        setForm((f) => ({
          ...f,
          nome: drv.nome,
          cpf: drv.cpf,
          telefone: drv.telefone,
          placa: drv.placa || '',
          modelo: drv.modelo || '',
          cor: drv.cor || '',
          ano: drv.ano || ''
        }));
      } catch (e) {
        console.error(e);
      }
    })();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const { name } = e.target;
    const file = e.target.files[0] || null;
    setForm((f) => ({ ...f, [name]: file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = new FormData();
      data.append('nome', form.nome);
      data.append('cpf', form.cpf);
      data.append('telefone', form.telefone);
      if (form.profilePic) data.append('profilePic', form.profilePic);
      if (form.licenseDoc) data.append('licenseDoc', form.licenseDoc);

      const methodDrv = id ? 'PUT' : 'POST';
      const urlDrv = id
        ? `${API_URL}/api/motoristas/${id}`
        : `${API_URL}/api/motoristas`;

      const resDrv = await fetch(urlDrv, {
        method: methodDrv,
        body: data
      });
      if (!resDrv.ok) throw new Error(`Motorista: ${resDrv.statusText}`);
      const driverId = id
        ? Number(id)
        : (await resDrv.json()).id_motorista;

      const vehiclePayload = {
        id_motorista: driverId,
        placa: form.placa,
        modelo: form.modelo,
        cor: form.cor,
        ano: form.ano
      };
      const methodVeh = id ? 'PUT' : 'POST';
      const urlVeh = id
        ? `${API_URL}/api/veiculos/${driverId}`
        : `${API_URL}/api/veiculos`;

      const resVeh = await fetch(urlVeh, {
        method: methodVeh,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vehiclePayload)
      });
      if (!resVeh.ok) throw new Error(`Veículo: ${resVeh.statusText}`);

      alert('Salvo com sucesso!');
      navigate('/monitoramento');
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .cadastro-container {
          padding: 32px;
          font-family: 'Poppins', sans-serif;
          max-width: 1200px;
          margin: auto;
        }
        .cadastro-grid {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 32px;
        }
        .card {
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.06);
          padding: 24px;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          margin-bottom: 16px;
        }
        .form-group label {
          font-weight: 500;
          margin-bottom: 6px;
          font-size: 14px;
        }
        .form-group input {
          padding: 12px;
          border: 1px solid #ccc;
          border-radius: 8px;
          font-size: 15px;
          transition: 0.2s;
        }
        .form-group input:focus {
          outline: none;
          border-color: #00ab55;
        }
        .upload-box {
          text-align: center;
          border: 2px dashed #ccc;
          padding: 32px;
          border-radius: 12px;
        }
        .upload-box p {
          color: #637381;
          font-size: 13px;
          margin-top: 12px;
        }
        .switch {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 16px;
        }
        .form-two-columns {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .btn-primary {
          background-color: #00ab55;
          color: #fff;
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          cursor: pointer;
        }
        .error-message {
          color: #d32f2f;
          margin-bottom: 16px;
        }
        @media(max-width: 800px) {
          .cadastro-grid { grid-template-columns: 1fr; }
          .form-two-columns { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="cadastro-container">
        <h1>{id ? 'Editar Motorista' : 'Cadastrar Motorista'}</h1>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="cadastro-grid">
            {/* Coluna esquerda */}
            <div className="card">
              <div className="upload-box">
                <input
                  type="file"
                  name="profilePic"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ marginBottom: 12 }}
                />
                <div>Upload photo</div>
                <p>Allowed *.jpeg, *.jpg, *.png, *.gif<br />Max size of 3 Mb</p>
              </div>

              <div className="switch">
                <label>Email verificado</label>
                <input
                  type="checkbox"
                  name="emailVerificado"
                  checked={form.emailVerificado}
                  onChange={handleChange}
                />
              </div>
              <small>
                Desabilitar enviará um e-mail de verificação para o usuário.
              </small>
            </div>

            {/* Coluna direita */}
            <div className="card">
              <div className="form-two-columns">
                <div className="form-group">
                  <label>Nome</label>
                  <input
                    name="nome"
                    value={form.nome}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>CPF</label>
                  <input
                    name="cpf"
                    value={form.cpf}
                    onChange={handleChange}
                    maxLength={14}
                    placeholder="000.000.000-00"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Telefone</label>
                  <input
                    name="telefone"
                    value={form.telefone}
                    onChange={handleChange}
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div className="form-group">
                  <label>Habilitação</label>
                  <input
                    type="file"
                    name="licenseDoc"
                    accept=".pdf,image/*"
                    onChange={handleFileChange}
                  />
                </div>
                <div className="form-group">
                  <label>Placa</label>
                  <input
                    name="placa"
                    value={form.placa}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Modelo</label>
                  <input
                    name="modelo"
                    value={form.modelo}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Cor</label>
                  <input
                    name="cor"
                    value={form.cor}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Ano</label>
                  <input
                    name="ano"
                    type="number"
                    value={form.ano}
                    onChange={handleChange}
                    min={1900}
                    max={new Date().getFullYear()}
                  />
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 24, textAlign: 'right' }}>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
