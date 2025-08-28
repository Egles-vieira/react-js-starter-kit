import React, { useState, useEffect, useRef } from 'react';
import FormularioMotorista from './formularios/FormularioMotorista';
import Modal from '../components/Modal';
import Loader from '../components/Loader';
import FiltroMotoristas from '../components/FiltroMotoristas';
import { toast } from 'react-toastify';
import { confirmAlert } from 'react-confirm-alert';
import { Edit, Trash2, Settings, Search, Filter, Users, Plus, Eye, EyeOff } from 'lucide-react';
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

  const carregar = async () => {
    setLoading(true);
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
      }
    } catch (err) {
      setMotoristas([]);
      toast.error("Erro ao carregar motoristas");
      console.error(err);
    } finally {
      setTimeout(() => setLoading(false), 300);
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

  return (
    <div className="p-6 max-w-full mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-primary" />
              <CardTitle className="text-2xl">Lista de Motoristas</CardTitle>
              <Badge variant="secondary" className="ml-2">
                {motoristas.length} motoristas
              </Badge>
            </div>
            <Button 
              onClick={() => {
                setMostrarFormulario(true);
                setEditando(false);
                setSelecionado(null);
              }}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Novo Motorista
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar por nome, CPF, contato, base ou placa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Settings className="w-4 h-4" />
                  Colunas
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <h4 className="font-medium text-sm">Colunas visíveis</h4>
                  <Separator />
                  
                  {/* Grupo por prioridade */}
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
          </div>
        </CardContent>
      </Card>

      {/* Modal */}
      <Modal open={mostrarFormulario} onClose={() => setMostrarFormulario(false)}>
        <FormularioMotorista
          editar={editando}
          motoristaSelecionado={selecionado}
          aoSalvar={() => {
            carregar();
            setMostrarFormulario(false);
            setEditando(false);
            setSelecionado(null);
          }}
          aoCancelar={() => setMostrarFormulario(false)}
        />
      </Modal>

      {/* Tabela */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader />
            </div>
          ) : (
            <div className="overflow-auto max-h-[70vh] border-t">
              <table className="w-full border-collapse">
                <thead className="sticky top-0 z-10 bg-muted/50 backdrop-blur-sm">
                  <tr className="border-b border-border">
                    {colunasFiltradas.map(col => (
                      <th 
                        key={col.key} 
                        className="p-3 text-left font-semibold text-muted-foreground uppercase text-xs tracking-wider"
                      >
                        {col.label}
                      </th>
                    ))}
                    <th className="p-3 text-center font-semibold text-muted-foreground uppercase text-xs tracking-wider w-24">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {motoristas.map((m, i) => (
                    <tr 
                      key={m.id_motorista} 
                      className={cn(
                        "border-b border-border transition-colors hover:bg-muted/50",
                        i % 2 === 0 ? "bg-background" : "bg-muted/20"
                      )}
                    >
                      {colunasFiltradas.map(col => (
                        <td key={col.key} className="p-3 text-sm">
                          {(() => {
                            const veicCols = ['placa','modelo','marca','ano','cor','renavam','capacidade','tipo','observacoes'];
                            
                            if (col.key === 'send_mensagem') {
                              return (
                                <Badge variant={m.send_mensagem ? "default" : "secondary"} className="text-xs">
                                  {m.send_mensagem ? (
                                    <>
                                      <Eye className="w-3 h-3 mr-1" />
                                      Sim
                                    </>
                                  ) : (
                                    <>
                                      <EyeOff className="w-3 h-3 mr-1" />
                                      Não
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
                                  {m[col.key] || '-'}
                                </Badge>
                              );
                            } else if (veicCols.includes(col.key)) {
                              const valor = m.veiculo?.[col.key];
                              if (col.key === 'placa') {
                                return (
                                  <span className="font-mono text-xs font-medium">
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
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-1">
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
                      </td>
                    </tr>
                  ))}
                  {motoristas.length === 0 && (
                    <tr>
                      <td 
                        colSpan={colunasFiltradas.length + 1} 
                        className="p-8 text-center text-muted-foreground"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <Users className="w-8 h-8 text-muted-foreground/50" />
                          <span>
                            {searchTerm ? 'Nenhum motorista encontrado com este filtro.' : 'Nenhum motorista cadastrado.'}
                          </span>
                          {searchTerm && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => setSearchTerm('')}
                              className="mt-2"
                            >
                              Limpar filtro
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}