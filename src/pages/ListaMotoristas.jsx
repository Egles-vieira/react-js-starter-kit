import React, { useState, useEffect, useRef } from 'react';
import FormularioMotorista from './formularios/FormularioMotorista';
import Modal from '../components/Modal';
import Loader from '../components/Loader';
import FiltroMotoristas from '../components/FiltroMotoristas';
import { toast } from 'react-toastify';
import { confirmAlert } from 'react-confirm-alert';
import { 
  Edit, Trash2, Settings, Search, Filter, Users, Plus, Eye, EyeOff, 
  Car, Phone, Mail, MapPin, Calendar, User, AlertCircle, CheckCircle,
  Download, RefreshCw, Grid3X3, List
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import 'react-confirm-alert/src/react-confirm-alert.css';

const API_URL = process.env.REACT_APP_API_URL || 'https://app.roadweb.com.br';

export default function ListaMotoristas() {
  const [motoristas, setMotoristas] = useState([]);
  const [motoristasOriginais, setMotoristasOriginais] = useState([]);
  const [editando, setEditando] = useState(false);
  const [selecionado, setSelecionado] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' ou 'grid'
  const [isRefreshing, setIsRefreshing] = useState(false);

  const todasColunas = [
    { key: "id_motorista", label: "ID", priority: 3 },
    { key: "nome", label: "Nome", priority: 1 },
    { key: "sobrenome", label: "Sobrenome", priority: 1 },
    { key: "cpf", label: "CPF", priority: 2 },
    { key: "contato", label: "Contato", priority: 2 },
    { key: "email", label: "Email", priority: 3 },
    { key: "pais", label: "País", priority: 4 },
    { key: "estado", label: "Estado", priority: 4 },
    { key: "cidade", label: "Cidade", priority: 3 },
    { key: "bairro", label: "Bairro", priority: 4 },
    { key: "rua", label: "Rua", priority: 4 },
    { key: "numero", label: "Número", priority: 4 },
    { key: "cep", label: "CEP", priority: 4 },
    { key: "unidade", label: "Base", priority: 2 },
    { key: "ultima_atualizacao", label: "Última Atualização", priority: 3 },
    { key: "send_mensagem", label: "Recebe Mensagem", priority: 3 },
    { key: "placa", label: "Placa", priority: 2 },
    { key: "modelo", label: "Modelo", priority: 3 },
    { key: "marca", label: "Marca", priority: 3 },
    { key: "ano", label: "Ano", priority: 3 },
    { key: "cor", label: "Cor", priority: 3 },
    { key: "renavam", label: "Renavam", priority: 4 },
    { key: "capacidade", label: "Capacidade", priority: 4 },
    { key: "tipo", label: "Tipo", priority: 3 },
    { key: "observacoes", label: "Observações", priority: 4 }
  ];

  // Colunas padrão (prioridade 1 e 2)
  const colunasDefault = todasColunas.filter(c => c.priority <= 2).map(c => c.key);
  const colunasSalvas = JSON.parse(localStorage.getItem('colunasSelecionadasMotoristas')) || colunasDefault;
  const [colunasSelecionadas, setColunasSelecionadas] = useState(colunasSalvas);
  
  const token = localStorage.getItem('token');

  const formatarData = (isoString) => {
    if (!isoString) return '-';
    const d = new Date(isoString);
    return d.toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const carregar = async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      const response = await fetch(`${API_URL}/api/motoristas`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      const lista = Array.isArray(data) ? data : [];
      setMotoristas(lista);
      setMotoristasOriginais(lista);
      
      if (!Array.isArray(data) && data?.error) {
        toast.error(data.error);
      } else if (isRefresh) {
        toast.success('Lista atualizada com sucesso!');
      }
    } catch (err) {
      setMotoristas([]);
      toast.error("Erro ao carregar motoristas");
      console.error(err);
    } finally {
      setTimeout(() => {
        setLoading(false);
        setIsRefreshing(false);
      }, 300);
    }
  };

  useEffect(() => {
    carregar();
  }, []);

  // Filtro em tempo real
  useEffect(() => {
    if (!searchTerm.trim()) {
      setMotoristas(motoristasOriginais);
      return;
    }
    
    const filtrados = motoristasOriginais.filter(m => 
      m.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.sobrenome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.cpf?.includes(searchTerm) ||
      m.contato?.includes(searchTerm) ||
      m.unidade?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.veiculo?.placa?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setMotoristas(filtrados);
  }, [searchTerm, motoristasOriginais]);

  const editar = (motorista) => {
    setSelecionado(motorista);
    setEditando(true);
    setMostrarFormulario(true);
  };

  const excluir = async (id_motorista) => {
    confirmAlert({
      title: 'Confirmar exclusão',
      message: 'Deseja realmente excluir este motorista?',
      buttons: [
        {
          label: 'Sim',
          onClick: async () => {
            try {
              const response = await fetch(`${API_URL}/api/motoristas/${id_motorista}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
              });
              if (response.ok) {
                toast.success('Motorista excluído com sucesso!');
                carregar();
              } else {
                toast.error('Erro ao excluir motorista');
              }
            } catch (error) {
              toast.error('Erro ao excluir motorista');
              console.error(error);
            }
          }
        },
        { label: 'Cancelar', onClick: () => {} }
      ]
    });
  };

  const toggleColuna = (key) => {
    const atualizadas = colunasSelecionadas.includes(key)
      ? colunasSelecionadas.filter(k => k !== key)
      : [...colunasSelecionadas, key];
    setColunasSelecionadas(atualizadas);
    localStorage.setItem('colunasSelecionadasMotoristas', JSON.stringify(atualizadas));
  };

  const colunasFiltradas = todasColunas.filter(c => colunasSelecionadas.includes(c.key));

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {motoristas.map((m) => (
        <Card key={m.id_motorista} className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold truncate">
                    {m.nome} {m.sobrenome}
                  </h3>
                  <p className="text-sm text-muted-foreground font-mono">
                    ID: {m.id_motorista}
                  </p>
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editar(m)}
                  className="h-8 w-8 p-0 hover:bg-primary/10"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => excluir(m.id_motorista)}
                  className="h-8 w-8 p-0 hover:bg-destructive/10 text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="font-mono text-xs">{m.contato || '-'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs truncate">{m.email || '-'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs">{m.cidade || '-'}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-muted-foreground" />
                  <span className="font-mono text-xs font-medium">{m.veiculo?.placa || '-'}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {m.veiculo?.modelo || '-'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {m.veiculo?.cor || '-'} {m.veiculo?.ano || ''}
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs">
                {m.unidade || 'Sem base'}
              </Badge>
              
              <Badge 
                variant={m.send_mensagem ? "default" : "secondary"} 
                className="text-xs"
              >
                {m.send_mensagem ? (
                  <>
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Ativo
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Inativo
                  </>
                )}
              </Badge>
            </div>
            
            {m.ultima_atualizacao && (
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatarData(m.ultima_atualizacao)}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="border-2 bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
          <CardHeader className="pb-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    Lista de Motoristas
                  </CardTitle>
                  <p className="text-muted-foreground mt-1">
                    Gerencie todos os motoristas cadastrados no sistema
                  </p>
                </div>
                <Badge variant="secondary" className="ml-2 px-3 py-1 text-sm">
                  {motoristas.length} {motoristas.length === 1 ? 'motorista' : 'motoristas'}
                </Badge>
              </div>
              
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline"
                  onClick={() => carregar(true)}
                  disabled={isRefreshing}
                  className="gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? 'Atualizando...' : 'Atualizar'}
                </Button>
                
                <Button 
                  onClick={() => {
                    setMostrarFormulario(true);
                    setEditando(false);
                    setSelecionado(null);
                  }}
                  className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                >
                  <Plus className="w-4 h-4" />
                  Novo Motorista
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="relative flex-1 max-w-lg">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar por nome, CPF, contato, base ou placa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11 border-2 focus:border-primary"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex border rounded-lg p-1 bg-muted/50">
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('table')}
                    className="gap-2 h-8"
                  >
                    <List className="w-4 h-4" />
                    Tabela
                  </Button>
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="gap-2 h-8"
                  >
                    <Grid3X3 className="w-4 h-4" />
                    Grid
                  </Button>
                </div>
                
                {viewMode === 'table' && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="gap-2 h-11">
                        <Settings className="w-4 h-4" />
                        Colunas
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80" align="end">
                      <div className="space-y-4">
                        <h4 className="font-medium text-sm">Colunas visíveis</h4>
                        <Separator />
                        
                        {[1, 2, 3, 4].map(priority => {
                          const colunasPrioridade = todasColunas.filter(c => c.priority === priority);
                          if (colunasPrioridade.length === 0) return null;
                          
                          const labels = {
                            1: "Essenciais",
                            2: "Importantes", 
                            3: "Úteis",
                            4: "Opcionais"
                          };
                          
                          return (
                            <div key={priority} className="space-y-2">
                              <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                {labels[priority]}
                              </h5>
                              {colunasPrioridade.map(col => (
                                <div key={col.key} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={col.key}
                                    checked={colunasSelecionadas.includes(col.key)}
                                    onCheckedChange={() => toggleColuna(col.key)}
                                  />
                                  <label 
                                    htmlFor={col.key} 
                                    className="text-sm cursor-pointer flex-1"
                                  >
                                    {col.label}
                                  </label>
                                </div>
                              ))}
                              {priority < 4 && <Separator />}
                            </div>
                          );
                        })}
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modal */}
        <Modal open={mostrarFormulario} onClose={() => setMostrarFormulario(false)}>
          <FormularioMotorista
            editar={editando}
            motoristaSelecionado={selecionado}
            onSalvo={() => {
              carregar();
              setMostrarFormulario(false);
              setEditando(false);
              setSelecionado(null);
            }}
            onCancelar={() => setMostrarFormulario(false)}
          />
        </Modal>

        {/* Conteúdo Principal */}
        <Card className="border-2">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <Loader />
                <p className="text-muted-foreground">Carregando motoristas...</p>
              </div>
            ) : motoristas.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <Users className="w-16 h-16 text-muted-foreground/50" />
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold">
                    {searchTerm ? 'Nenhum motorista encontrado' : 'Nenhum motorista cadastrado'}
                  </h3>
                  <p className="text-muted-foreground">
                    {searchTerm 
                      ? 'Tente ajustar os filtros de busca.' 
                      : 'Comece cadastrando seu primeiro motorista.'
                    }
                  </p>
                  {searchTerm ? (
                    <Button 
                      variant="outline" 
                      onClick={() => setSearchTerm('')}
                      className="mt-4"
                    >
                      Limpar filtro
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => {
                        setMostrarFormulario(true);
                        setEditando(false);
                        setSelecionado(null);
                      }}
                      className="mt-4 gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Cadastrar Motorista
                    </Button>
                  )}
                </div>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="p-6">
                {renderGridView()}
              </div>
            ) : (
              <div className="overflow-auto max-h-[70vh]">
                <table className="w-full border-collapse">
                  <thead className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b-2 border-primary/20">
                    <tr>
                      {colunasFiltradas.map(col => (
                        <th 
                          key={col.key} 
                          className="p-4 text-left font-semibold text-foreground uppercase text-xs tracking-wider bg-muted/50"
                        >
                          {col.label}
                        </th>
                      ))}
                      <th className="p-4 text-center font-semibold text-foreground uppercase text-xs tracking-wider w-24 bg-muted/50">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {motoristas.map((m, i) => (
                      <tr 
                        key={m.id_motorista} 
                        className={cn(
                          "border-b border-border transition-all duration-200 hover:bg-primary/5 hover:shadow-sm",
                          i % 2 === 0 ? "bg-background" : "bg-muted/30"
                        )}
                      >
                        {colunasFiltradas.map(col => (
                          <td key={col.key} className="p-4 text-sm">
                            {(() => {
                              const veicCols = ['placa','modelo','marca','ano','cor','renavam','capacidade','tipo','observacoes'];
                              
                              if (col.key === 'send_mensagem') {
                                return (
                                  <Badge 
                                    variant={m.send_mensagem ? "default" : "secondary"} 
                                    className="text-xs gap-1"
                                  >
                                    {m.send_mensagem ? (
                                      <>
                                        <CheckCircle className="w-3 h-3" />
                                        Ativo
                                      </>
                                    ) : (
                                      <>
                                        <AlertCircle className="w-3 h-3" />
                                        Inativo
                                      </>
                                    )}
                                  </Badge>
                                );
                              } else if (col.key === 'ultima_atualizacao') {
                                return (
                                  <span className="font-mono text-xs text-muted-foreground">
                                    {formatarData(m.ultima_atualizacao)}
                                  </span>
                                );
                              } else if (col.key === 'nome' || col.key === 'sobrenome') {
                                return <span className="font-medium">{m[col.key] || '-'}</span>;
                              } else if (col.key === 'cpf' || col.key === 'contato') {
                                return <span className="font-mono text-xs">{m[col.key] || '-'}</span>;
                              } else if (col.key === 'unidade') {
                                return (
                                  <Badge variant="outline" className="text-xs">
                                    {m[col.key] || 'Sem base'}
                                  </Badge>
                                );
                              } else if (veicCols.includes(col.key)) {
                                const valor = m.veiculo?.[col.key];
                                if (col.key === 'placa') {
                                  return (
                                    <span className="font-mono text-xs font-medium bg-primary/10 px-2 py-1 rounded">
                                      {valor || '-'}
                                    </span>
                                  );
                                }
                                return valor || '-';
                              } else {
                                return m[col.key] ?? '-';
                              }
                            })()}
                          </td>
                        ))}
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => editar(m)}
                              className="h-9 w-9 p-0 hover:bg-primary/10 hover:text-primary transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => excluir(m.id_motorista)}
                              className="h-9 w-9 p-0 hover:bg-destructive/10 text-destructive transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}