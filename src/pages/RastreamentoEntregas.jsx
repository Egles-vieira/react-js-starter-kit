import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Search,
  MapPin,
  Truck,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Navigation,
  RefreshCw,
  Eye,
  Phone,
  Mail,
  Calendar,
  User,
  Building,
  Route,
  Timer
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { apiFetch } from '@/services/api';

const statusConfig = {
  'aguardando': { 
    label: 'Aguardando Coleta', 
    color: 'bg-gray-100 text-gray-800', 
    icon: Clock,
    progress: 10
  },
  'coletado': { 
    label: 'Coletado', 
    color: 'bg-blue-100 text-blue-800', 
    icon: Package,
    progress: 25
  },
  'em_transito': { 
    label: 'Em Trânsito', 
    color: 'bg-yellow-100 text-yellow-800', 
    icon: Truck,
    progress: 50
  },
  'saiu_entrega': { 
    label: 'Saiu para Entrega', 
    color: 'bg-orange-100 text-orange-800', 
    icon: Navigation,
    progress: 75
  },
  'entregue': { 
    label: 'Entregue', 
    color: 'bg-green-100 text-green-800', 
    icon: CheckCircle,
    progress: 100
  },
  'devolvida': { 
    label: 'Devolvida', 
    color: 'bg-red-100 text-red-800', 
    icon: XCircle,
    progress: 100
  },
  'problema': { 
    label: 'Com Problema', 
    color: 'bg-red-100 text-red-800', 
    icon: AlertTriangle,
    progress: 50
  }
};

export default function RastreamentoEntregas() {
  const [entregas, setEntregas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busca, setBusca] = useState('');
  const [entregaSelecionada, setEntregaSelecionada] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);

  useEffect(() => {
    if (busca.length >= 3) {
      buscarEntregas();
    }
  }, [busca]);

  const buscarEntregas = async () => {
    try {
      setLoading(true);
      const data = await apiFetch(`/api/rastreamento?busca=${encodeURIComponent(busca)}`);
      setEntregas(data.entregas || []);
    } catch (error) {
      toast.error('Erro ao buscar entregas');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const carregarDetalhesEntrega = async (id) => {
    try {
      const data = await apiFetch(`/api/rastreamento/${id}`);
      setEntregaSelecionada(data);
      setModalAberto(true);
    } catch (error) {
      toast.error('Erro ao carregar detalhes da entrega');
      console.error(error);
    }
  };

  const StatusBadge = ({ status }) => {
    const config = statusConfig[status] || statusConfig.aguardando;
    const IconComponent = config.icon;
    
    return (
      <Badge variant="outline" className={`${config.color} flex items-center gap-2 text-sm px-3 py-1`}>
        <IconComponent size={14} />
        {config.label}
      </Badge>
    );
  };

  const ProgressBar = ({ status }) => {
    const config = statusConfig[status] || statusConfig.aguardando;
    return (
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${config.progress}%` }}
        />
      </div>
    );
  };

  const formatarData = (data) => {
    if (!data) return 'Não informado';
    return new Date(data).toLocaleString('pt-BR');
  };

  const calcularTempoTransito = (dataColeta) => {
    if (!dataColeta) return 'N/A';
    const agora = new Date();
    const coleta = new Date(dataColeta);
    const diffDias = Math.floor((agora - coleta) / (1000 * 60 * 60 * 24));
    return `${diffDias} dias`;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Rastreamento de Entregas</h1>
          <p className="text-muted-foreground">
            Acompanhe suas entregas em tempo real
          </p>
        </div>
      </div>

      {/* Busca */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search size={20} />
            Buscar Entrega
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="busca">Número da Nota Fiscal ou Código de Rastreamento</Label>
              <Input
                id="busca"
                placeholder="Digite o número da nota fiscal ou código de rastreamento..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={buscarEntregas} disabled={loading || busca.length < 3}>
                {loading ? <RefreshCw className="animate-spin" size={16} /> : <Search size={16} />}
                <span className="ml-2">Buscar</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resultados */}
      {entregas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados da Busca ({entregas.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nota Fiscal</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progresso</TableHead>
                  <TableHead>Destinatário</TableHead>
                  <TableHead>Transportadora</TableHead>
                  <TableHead>Tempo em Trânsito</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entregas.map((entrega) => (
                  <TableRow key={entrega.id}>
                    <TableCell className="font-medium">
                      {entrega.numero_nota_fiscal}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={entrega.status} />
                    </TableCell>
                    <TableCell>
                      <div className="w-24">
                        <ProgressBar status={entrega.status} />
                        <span className="text-xs text-muted-foreground">
                          {statusConfig[entrega.status]?.progress || 0}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{entrega.destinatario}</p>
                        <p className="text-sm text-muted-foreground">{entrega.cidade_destino}</p>
                      </div>
                    </TableCell>
                    <TableCell>{entrega.transportadora}</TableCell>
                    <TableCell>{calcularTempoTransito(entrega.data_coleta)}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => carregarDetalhesEntrega(entrega.id)}
                      >
                        <Eye size={16} className="mr-2" />
                        Detalhes
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Modal de Detalhes */}
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Entrega</DialogTitle>
            <DialogDescription>
              Informações completas sobre a entrega
            </DialogDescription>
          </DialogHeader>
          
          {entregaSelecionada && (
            <div className="space-y-6">
              {/* Informações Básicas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package size={20} />
                      Informações da Entrega
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Nota Fiscal:</span>
                      <span className="font-medium">{entregaSelecionada.numero_nota_fiscal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <StatusBadge status={entregaSelecionada.status} />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Transportadora:</span>
                      <span className="font-medium">{entregaSelecionada.transportadora}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Código Rastreamento:</span>
                      <span className="font-medium">{entregaSelecionada.codigo_rastreamento}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User size={20} />
                      Destinatário
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Nome:</span>
                      <span className="font-medium">{entregaSelecionada.destinatario}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Telefone:</span>
                      <span className="font-medium">{entregaSelecionada.telefone || 'Não informado'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-medium">{entregaSelecionada.email || 'Não informado'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Endereço:</span>
                      <span className="font-medium text-right">
                        {entregaSelecionada.endereco_completo}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Timeline de Ocorrências */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Route size={20} />
                    Histórico de Movimentação
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {entregaSelecionada.ocorrencias && entregaSelecionada.ocorrencias.length > 0 ? (
                    <div className="space-y-4">
                      {entregaSelecionada.ocorrencias.map((ocorrencia, index) => (
                        <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                          <div className="flex-shrink-0">
                            {statusConfig[ocorrencia.tipo]?.icon && 
                              React.createElement(statusConfig[ocorrencia.tipo].icon, { 
                                size: 20, 
                                className: "text-blue-600" 
                              })
                            }
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium">{ocorrencia.descricao}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {ocorrencia.observacoes}
                                </p>
                              </div>
                              <div className="text-right text-sm text-muted-foreground">
                                <p>{formatarData(ocorrencia.data_ocorrencia)}</p>
                                {ocorrencia.local && (
                                  <p className="flex items-center gap-1">
                                    <MapPin size={12} />
                                    {ocorrencia.local}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhuma movimentação registrada
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Informações Adicionais */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Calendar className="mx-auto mb-2 text-blue-600" size={24} />
                    <p className="text-sm text-muted-foreground">Data de Coleta</p>
                    <p className="font-medium">
                      {formatarData(entregaSelecionada.data_coleta)}
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <Timer className="mx-auto mb-2 text-green-600" size={24} />
                    <p className="text-sm text-muted-foreground">Prazo de Entrega</p>
                    <p className="font-medium">
                      {formatarData(entregaSelecionada.prazo_entrega)}
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <Package className="mx-auto mb-2 text-purple-600" size={24} />
                    <p className="text-sm text-muted-foreground">Peso</p>
                    <p className="font-medium">
                      {entregaSelecionada.peso ? `${entregaSelecionada.peso} kg` : 'Não informado'}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Estado vazio */}
      {!loading && entregas.length === 0 && busca.length >= 3 && (
        <Card>
          <CardContent className="text-center py-12">
            <Search size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhuma entrega encontrada</h3>
            <p className="text-muted-foreground">
              Verifique o número da nota fiscal ou código de rastreamento e tente novamente.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

