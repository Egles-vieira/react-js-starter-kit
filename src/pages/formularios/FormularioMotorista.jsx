import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Car, Mail, Phone, MapPin, Hash, Shield, Settings } from 'lucide-react';

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
  const [isLoading, setIsLoading] = useState(false);

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

    setIsLoading(true);
    const token = localStorage.getItem('token');
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
    } finally {
      setIsLoading(false);
    }
  };

  const getFieldIcon = (fieldName) => {
    const iconMap = {
      nome: User,
      sobrenome: User,
      email: Mail,
      contato: Phone,
      pais: MapPin,
      estado: MapPin,
      cidade: MapPin,
      bairro: MapPin,
      rua: MapPin,
      numero: MapPin,
      cep: MapPin,
      cpf: Hash,
      legislacao_id: Shield,
      unidade: Settings,
      placa: Car,
      modelo: Car,
      marca: Car,
      ano: Car,
      cor: Car,
      renavam: Hash,
      capacidade: Car,
      tipo: Car
    };
    return iconMap[fieldName];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <Badge variant="outline" className="mb-4">
            {editar ? 'Modo Edição' : 'Novo Cadastro'}
          </Badge>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            {editar ? 'Editar Motorista' : 'Cadastrar Motorista'}
          </h1>
          <p className="text-muted-foreground text-lg">
            Preencha os dados do motorista e do veículo para {editar ? 'atualizar' : 'criar'} o cadastro
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-8">
          {/* Dados Pessoais */}
          <Card className="border-2 hover:border-primary/20 transition-colors duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Dados Pessoais</CardTitle>
                  <p className="text-muted-foreground">Informações básicas do motorista</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  ['nome', 'Nome*', 'Digite o nome completo'],
                  ['sobrenome', 'Sobrenome', 'Digite o sobrenome'],
                  ['cpf', 'CPF*', 'Digite apenas números'],
                  ['contato', 'Telefone', '(11) 99999-9999'],
                  ['email', 'E-mail', 'exemplo@email.com']
                ].map(([key, label, placeholder]) => {
                  const Icon = getFieldIcon(key);
                  return (
                    <div key={key} className="space-y-2 group">
                      <Label htmlFor={key} className="flex items-center gap-2 font-medium">
                        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                        {label}
                      </Label>
                      <Input
                        id={key}
                        name={key}
                        placeholder={placeholder}
                        value={form[key] ?? ''}
                        onChange={e => handleChange(e, 'form')}
                        className={`transition-all duration-200 ${
                          errors[key] 
                            ? 'border-destructive focus:border-destructive' 
                            : 'focus:border-primary group-hover:border-primary/50'
                        }`}
                      />
                      {errors[key] && (
                        <p className="text-sm text-destructive animate-fade-in flex items-center gap-1">
                          <span className="h-1 w-1 bg-destructive rounded-full"></span>
                          {errors[key]}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              <Separator className="my-6" />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  ['foto_perfil', 'Foto de Perfil (URL)', 'https://exemplo.com/foto.jpg'],
                  ['unidade', 'Aplicativo', 'Nome do aplicativo'],
                  ['legislacao_id', 'ID Legislação', 'Número da legislação'],
                  ['status', 'Status', 'Ativo/Inativo']
                ].map(([key, label, placeholder]) => {
                  const Icon = getFieldIcon(key);
                  return (
                    <div key={key} className="space-y-2 group">
                      <Label htmlFor={key} className="flex items-center gap-2 font-medium">
                        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                        {label}
                      </Label>
                      <Input
                        id={key}
                        name={key}
                        placeholder={placeholder}
                        value={form[key] ?? ''}
                        onChange={e => handleChange(e, 'form')}
                        className="transition-all duration-200 focus:border-primary group-hover:border-primary/50"
                      />
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-3 p-3 bg-background rounded-lg border">
                  <Checkbox
                    id="send_mensagem"
                    checked={!!form.send_mensagem}
                    onCheckedChange={(checked) => handleCheckboxChange('send_mensagem', checked, 'form')}
                  />
                  <Label htmlFor="send_mensagem" className="flex items-center gap-2 cursor-pointer">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    Recebe Mensagens
                  </Label>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-background rounded-lg border">
                  <Checkbox
                    id="app_liberado"
                    checked={!!form.app_liberado}
                    onCheckedChange={(checked) => handleCheckboxChange('app_liberado', checked, 'form')}
                  />
                  <Label htmlFor="app_liberado" className="flex items-center gap-2 cursor-pointer">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    App Liberado
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Endereço */}
          <Card className="border-2 hover:border-primary/20 transition-colors duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary/10 rounded-lg">
                  <MapPin className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Endereço</CardTitle>
                  <p className="text-muted-foreground">Localização do motorista</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  ['pais', 'País', 'Brasil'],
                  ['estado', 'Estado', 'São Paulo'],
                  ['cidade', 'Cidade', 'São Paulo'],
                  ['bairro', 'Bairro', 'Centro'],
                  ['rua', 'Rua', 'Rua das Flores'],
                  ['numero', 'Número', '123'],
                  ['cep', 'CEP', '01234-567']
                ].map(([key, label, placeholder]) => (
                  <div key={key} className="space-y-2 group">
                    <Label htmlFor={key} className="flex items-center gap-2 font-medium">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      {label}
                    </Label>
                    <Input
                      id={key}
                      name={key}
                      placeholder={placeholder}
                      value={form[key] ?? ''}
                      onChange={e => handleChange(e, 'form')}
                      className="transition-all duration-200 focus:border-primary group-hover:border-primary/50"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Dados do Veículo */}
          <Card className="border-2 hover:border-primary/20 transition-colors duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Car className="h-6 w-6 text-accent-foreground" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Dados do Veículo</CardTitle>
                  <p className="text-muted-foreground">Informações do veículo utilizado</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  ['placa', 'Placa*', 'ABC-1234'],
                  ['modelo', 'Modelo*', 'Civic'],
                  ['marca', 'Marca', 'Honda'],
                  ['ano', 'Ano*', '2020'],
                  ['cor', 'Cor*', 'Branco'],
                  ['renavam', 'Renavam', '12345678901'],
                  ['capacidade', 'Capacidade', '5 pessoas'],
                  ['tipo', 'Tipo', 'Sedan'],
                  ['observacoes', 'Observações', 'Informações adicionais']
                ].map(([key, label, placeholder]) => {
                  const Icon = getFieldIcon(key);
                  return (
                    <div key={key} className="space-y-2 group">
                      <Label htmlFor={key} className="flex items-center gap-2 font-medium">
                        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                        {label}
                      </Label>
                      <Input
                        id={key}
                        name={key}
                        placeholder={placeholder}
                        value={veiculo[key] ?? ''}
                        onChange={e => handleChange(e, 'veiculo')}
                        className={`transition-all duration-200 ${
                          errors[key] 
                            ? 'border-destructive focus:border-destructive' 
                            : 'focus:border-primary group-hover:border-primary/50'
                        }`}
                      />
                      {errors[key] && (
                        <p className="text-sm text-destructive animate-fade-in flex items-center gap-1">
                          <span className="h-1 w-1 bg-destructive rounded-full"></span>
                          {errors[key]}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Ações */}
          <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="px-8 py-3 text-lg font-semibold min-w-[200px] bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300 transform hover:scale-105"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                      Salvando...
                    </div>
                  ) : (
                    editar ? 'Atualizar Motorista' : 'Cadastrar Motorista'
                  )}
                </Button>
                
                {editar && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={onCancelar}
                    className="px-8 py-3 text-lg font-semibold min-w-[200px] hover:bg-muted transition-all duration-300"
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
