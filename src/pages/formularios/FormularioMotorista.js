import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

  const handleCheckboxChange = (name, checked, target = 'form') => {
    const setter = target === 'form' ? setForm : setVeiculo;
    setter(prev => ({
      ...prev,
      [name]: checked
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
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold mb-6">
        {editar ? 'Editar Motorista + Veículo' : 'Novo Motorista + Veículo'}
      </h2>
      
      <form onSubmit={handleSubmit} noValidate className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Dados do Motorista</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                ['status', 'Status']
              ].map(([key, label]) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={key}>{label}</Label>
                  <Input
                    id={key}
                    name={key}
                    value={form[key] ?? ''}
                    onChange={e => handleChange(e, 'form')}
                    className={errors[key] ? 'border-destructive' : ''}
                  />
                  {errors[key] && (
                    <p className="text-sm text-destructive">{errors[key]}</p>
                  )}
                </div>
              ))}
              
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="send_mensagem"
                    checked={!!form.send_mensagem}
                    onCheckedChange={(checked) => handleCheckboxChange('send_mensagem', checked, 'form')}
                  />
                  <Label htmlFor="send_mensagem">Recebe Mensagem?</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="app_liberado"
                    checked={!!form.app_liberado}
                    onCheckedChange={(checked) => handleCheckboxChange('app_liberado', checked, 'form')}
                  />
                  <Label htmlFor="app_liberado">App Liberado</Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dados do Veículo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                <div key={key} className="space-y-2">
                  <Label htmlFor={key}>{label}</Label>
                  <Input
                    id={key}
                    name={key}
                    value={veiculo[key] ?? ''}
                    onChange={e => handleChange(e, 'veiculo')}
                    className={errors[key] ? 'border-destructive' : ''}
                  />
                  {errors[key] && (
                    <p className="text-sm text-destructive">{errors[key]}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button type="submit" className="bg-primary hover:bg-primary/90">
            {editar ? 'Atualizar' : 'Cadastrar'}
          </Button>
          {editar && (
            <Button type="button" variant="outline" onClick={onCancelar}>
              Cancelar
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
