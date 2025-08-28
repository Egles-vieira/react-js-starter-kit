import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const API_URL = process.env.REACT_APP_API_URL || 'https://app.roadweb.com.br';

export default function FormularioMotorista({
  editar,
  motoristaSelecionado,
  onSalvo,
  onCancelar
}) {
  const inicialForm = {
    id_motorista: null,
    nome: '',
    sobrenome: '',
    cpf: '',
    contato: '',
    email: '',
    foto_perfil: '',
    pais: '',
    estado: '',
    cidade: '',
    bairro: '',
    rua: '',
    numero: '',
    cep: '',
    unidade: '',
    send_mensagem: true,
    legislacao_id: '',
    app_liberado: false,
    status: ''
  };

  const inicialVeiculo = {
    id_veiculo: null,
    placa: '',
    modelo: '',
    marca: '',
    ano: '',
    cor: '',
    renavam: '',
    capacidade: '',
    tipo: '',
    observacoes: ''
  };

  const [form, setForm] = useState(inicialForm);
  const [veiculo, setVeiculo] = useState(inicialVeiculo);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editar && motoristaSelecionado) {
      const { veiculo: vm, ...ms } = motoristaSelecionado;
      setForm({ ...inicialForm, ...ms });
      if (vm) setVeiculo({ ...inicialVeiculo, ...vm });
    } else {
      setForm(inicialForm);
      setVeiculo(inicialVeiculo);
    }
  }, [editar, motoristaSelecionado]);

  const handleChange = (e, target = 'form') => {
    const { name, value, type, checked } = e.target;
    const setter = target === 'form' ? setForm : setVeiculo;
    setter(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const get = (v) => String(v ?? '').trim();
    const newErrors = {};
    if (!get(form.nome)) newErrors.nome = 'Nome é obrigatório.';
    if (!get(form.cpf)) newErrors.cpf = 'CPF é obrigatório.';
    if (!get(veiculo.placa)) newErrors.placa = 'Placa é obrigatória.';
    if (!get(veiculo.modelo)) newErrors.modelo = 'Modelo é obrigatório.';
    if (!get(veiculo.cor)) newErrors.cor = 'Cor é obrigatória.';
    if (!get(veiculo.ano)) newErrors.ano = 'Ano é obrigatório.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Preencha os campos obrigatórios.');
      return;
    }
    if (editar && !form.id_motorista) {
      toast.error('ID do motorista não encontrado para atualização.');
      return;
    }

    const token = localStorage.getItem('token');
    // Garantir que cpf não seja null antes de usar trim()
    const cpfTrim = String(form.cpf || '').trim();
    const cleanedForm = {
      ...form,
      cpf: cpfTrim,
      legislacao_id: form.legislacao_id
        ? parseInt(form.legislacao_id, 10)
        : null
    };

    const payload = {
      ...cleanedForm,
      veiculo: { ...veiculo }
    };

    const method = editar ? 'PUT' : 'POST';
    const url = editar
      ? `${API_URL}/api/registro/${form.id_motorista}`
      : `${API_URL}/api/registro`;

    try {
      const resp = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await resp.json();

      if (resp.status === 409) {
        toast.error(data.message || data.error || 'CPF já cadastrado.');
        return;
      }
      if (!resp.ok) {
        toast.error(data.message || data.error || 'Erro ao salvar.');
        return;
      }

      toast.success(editar ? 'Atualizado com sucesso!' : 'Cadastrado com sucesso!');
      if (!editar) {
        setForm(inicialForm);
        setVeiculo(inicialVeiculo);
      }
      onSalvo();
    } catch (err) {
      console.error('Erro interno:', err);
      toast.error('Erro interno. Tente novamente.');
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>
        {editar ? 'Editar Motorista + Veículo' : 'Novo Motorista + Veículo'}
      </h2>
      <form onSubmit={handleSubmit} noValidate>
        <h3>Dados do Motorista</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))',
          gap: 30
        }}>
          {[
            ['nome', 'Nome*'],
            ['sobrenome', 'Sobrenome'],
            ['cpf', 'CPF*'],
            ['contato', 'Contato'],
            ['email', 'E-mail'],
            ['foto_perfil', 'Foto de Perfil (URL)'],
            ['pais', 'País'],
            ['estado', 'Estado'],
            ['cidade', 'Cidade'],
            ['bairro', 'Bairro'],
            ['rua', 'Rua'],
            ['numero', 'Número'],
            ['cep', 'CEP'],
            ['unidade', 'Aplicativo'],
            ['legislacao_id', 'Legislação ID'],
            ['send_mensagem', 'Recebe Mensagem?'],
            ['app_liberado', 'App Liberado'],
            ['status', 'Status']
          ].map(([key, label]) => (
            <div key={key}>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#555' }}>
                {label}
              </label>
              {key === 'send_mensagem' || key === 'app_liberado' ? (
                <input
                  type="checkbox"
                  name={key}
                  checked={!!form[key]}
                  onChange={e => handleChange(e, 'form')}
                  style={{ marginTop: 8 }}
                />
              ) : (
                <input
                  type="text"
                  name={key}
                  value={form[key] ?? ''}
                  onChange={e => handleChange(e, 'form')}
                  style={{
                    width: '100%',
                    padding: 10,
                    borderRadius: 6,
                    border: errors[key] ? '1px solid red' : '1px solid #ccc',
                    marginTop: 4
                  }}
                />
              )}
              {errors[key] && (
                <div style={{ color: 'red', fontSize: 12 }}>
                  {errors[key]}
                </div>
              )}
            </div>
          ))}
        </div>

        <h3 style={{ marginTop: 30 }}>Dados do Veículo</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))',
          gap: 30
        }}>
          {[
            ['placa', 'Placa*'],
            ['modelo', 'Modelo*'],
            ['marca', 'Marca'],
            ['ano', 'Ano*'],
            ['cor', 'Cor*'],
            ['renavam', 'Renavam'],
            ['capacidade', 'Capacidade'],
            ['tipo', 'Tipo'],
            ['observacoes', 'Observações']
          ].map(([key, label]) => (
            <div key={key}>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#555' }}>
                {label}
              </label>
              <input
                type="text"
                name={key}
                value={veiculo[key] ?? ''}
                onChange={e => handleChange(e, 'veiculo')}
                style={{
                  width: '100%',
                  padding: 10,
                  borderRadius: 6,
                  border: errors[key] ? '1px solid red' : '1px solid #ccc',
                  marginTop: 4
                }}
              />
              {errors[key] && (
                <div style={{ color: 'red', fontSize: 12 }}>
                  {errors[key]}
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ marginTop: 24, textAlign: 'right' }}>
          <button
            type="submit"
            style={{
              backgroundColor: '#FF612B',
              color: '#fff',
              padding: '10px 24px',
              border: 'none',
              borderRadius: 6,
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            {editar ? 'Atualizar' : 'Cadastrar'}
          </button>
          {editar && (
            <button
              type="button"
              onClick={onCancelar}
              style={{
                marginLeft: 12,
                backgroundColor: '#ccc',
                color: '#333',
                padding: '10px 24px',
                border: 'none',
                borderRadius: 6,
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
