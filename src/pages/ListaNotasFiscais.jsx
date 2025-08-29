import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Search, 
  Filter, 
  FileText, 
  Truck, 
  Calendar, 
  Weight, 
  Package, 
  MapPin, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  Edit,
  Trash2,
  MoreHorizontal,
  Eye,
  Printer,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { apiFetch } from '@/services/api';

const statusConfig = {
  'aguardando': { 
    label: 'Aguardando', 
    color: 'bg-gray-100 text-gray-800', 
    icon: Clock 
  },
  'roteirizada': { 
    label: 'Roteirizada', 
    color: 'bg-blue-100 text-blue-800', 
    icon: MapPin 
  },
  'em_transporte': { 
    label: 'Em Transporte', 
    color: 'bg-yellow-100 text-yellow-800', 
    icon: Truck 
  },
  'entregue': { 
    label: 'Entregue', 
    color: 'bg-green-100 text-green-800', 
    icon: CheckCircle 
  },
  'devolvida': { 
    label: 'Devolvida', 
    color: 'bg-red-100 text-red-800', 
    icon: XCircle 
  },
  'cancelada': { 
    label: 'Cancelada', 
    color: 'bg-gray-100 text-gray-600', 
    icon: XCircle 
  }
};

export default function ListaNotasFiscais() {
  const [notasFiscais, setNotasFiscais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    busca: '',
    status: 'todos',
    dataInicio: '',
    dataFim: '',
    transportadora: ''
  });
  const [viewMode, setViewMode] = useState('cards'); // 'cards' ou 'table'

  useEffect(() => {
    carregarNotasFiscais();
  }, []);

  const carregarNotasFiscais = async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/api/notaFiscal');
      setNotasFiscais(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Erro ao carregar notas fiscais');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const notasFiltradas = notasFiscais.filter(nota => {
    const buscaMatch = !filtros.busca || 
      nota.chave_nf?.toLowerCase().includes(filtros.busca.toLowerCase()) ||
      nota.cliente_nome?.toLowerCase().includes(filtros.busca.toLowerCase()) ||
      nota.nro_pedido?.toString().includes(filtros.busca) ||
      nota.transportadora_nome?.toLowerCase().includes(filtros.busca.toLowerCase());

    const statusMatch = filtros.status === 'todos' || !filtros.status || nota.status_nf === filtros.status;
    
    return buscaMatch && statusMatch;
  });

  const handleStatusChange = async (notaId, novoStatus) => {
    try {
      await apiFetch(`/api/notaFiscal/${notaId}`, {
        method: 'PUT',
        body: JSON.stringify({ status_nf: novoStatus })
      });
      toast.success('Status atualizado com sucesso!');
      carregarNotasFiscais();
    } catch (error) {
      toast.error('Erro ao atualizar status');
    }
  };

  const handleDeleteNota = async (notaId) => {
    if (window.confirm('Tem certeza que deseja excluir esta nota fiscal?')) {
      try {
        await apiFetch(`/api/notaFiscal/${notaId}`, { method: 'DELETE' });
        toast.success('Nota fiscal excluída com sucesso!');
        carregarNotasFiscais();
      } catch (error) {
        toast.error('Erro ao excluir nota fiscal');
      }
    }
  };

  const StatusBadge = ({ status }) => {
    const config = statusConfig[status] || statusConfig.aguardando;
    const IconComponent = config.icon;
    
    return (
      <Badge variant="outline" className={`${config.color} flex items-center gap-1`}>
        <IconComponent size={12} />
        {config.label}
      </Badge>
    );
  };

  const NotaCard = ({ nota }) => (
    <Card className="h-full hover:shadow-lg transition-all duration-200 border border-border">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2 text-foreground">
              <FileText size={18} className="text-primary" />
              NF #{nota.nro}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Pedido: {nota.nro_pedido} • Chave: {nota.chave_nf?.slice(-8)}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>
                <Eye size={14} className="mr-2" />
                Visualizar Detalhes
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit size={14} className="mr-2" />
                Editar Dados
              </DropdownMenuItem>
              <DropdownMenuItem>
                <RefreshCw size={14} className="mr-2" />
                Reatribuir Entrega
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Printer size={14} className="mr-2" />
                Imprimir Comprovante
              </DropdownMenuItem>
              <DropdownMenuItem>
                <ExternalLink size={14} className="mr-2" />
                Consultar SEFAZ
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive"
                onClick={() => handleDeleteNota(nota.id)}
              >
                <Trash2 size={14} className="mr-2" />
                Excluir Nota
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <StatusBadge status={nota.status_nf || 'aguardando'} />
          <span className="text-lg font-semibold text-foreground">
            R$ {Number(nota.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="space-y-3">
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <strong className="text-sm text-foreground">Cliente:</strong>
            </div>
            <p className="text-sm text-muted-foreground font-medium">{nota.cliente_nome}</p>
          </div>
          
          <div className="flex items-start gap-2">
            <MapPin size={14} className="text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Endereço de Entrega</p>
              <p className="text-sm text-foreground">
                {nota.endereco_entrega_completo || 'Endereço não informado'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Truck size={14} className="text-muted-foreground" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Transportadora</p>
              <p className="text-sm text-foreground font-medium">
                {nota.transportadora_nome || 'Não atribuída'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-2 bg-muted/30 rounded">
              <Package size={14} className="text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Volumes</p>
                <p className="text-sm font-medium">{nota.qtd_volumes || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 bg-muted/30 rounded">
              <Weight size={14} className="text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Peso</p>
                <p className="text-sm font-medium">{nota.peso_real || 0} kg</p>
              </div>
            </div>
          </div>

          {nota.previsao_entrega && (
            <div className="flex items-center gap-2 p-2 bg-primary/5 rounded border border-primary/20">
              <Calendar size={14} className="text-primary" />
              <div>
                <p className="text-xs text-primary/80 uppercase tracking-wide">Previsão de Entrega</p>
                <p className="text-sm font-medium text-primary">
                  {new Date(nota.previsao_entrega).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-border">
          <Select 
            value={nota.status_nf || 'aguardando'} 
            onValueChange={(value) => handleStatusChange(nota.id, value)}
          >
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(statusConfig).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    <config.icon size={12} />
                    {config.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );

  const TableView = () => (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <div className="min-w-full">
            {/* Header da Tabela */}
            <div className="grid grid-cols-12 gap-4 p-4 bg-muted/50 border-b border-border font-medium text-sm text-muted-foreground">
              <div className="col-span-2">NF / Pedido</div>
              <div className="col-span-2">Cliente</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Valor</div>
              <div className="col-span-2">Transportadora</div>
              <div className="col-span-1">Vol/Peso</div>
              <div className="col-span-1">Ações</div>
            </div>
            
            {/* Linhas da Tabela */}
            <div className="divide-y divide-border">
              {notasFiltradas.map((nota, index) => (
                <div 
                  key={nota.id} 
                  className={`grid grid-cols-12 gap-4 p-4 hover:bg-muted/30 transition-colors ${
                    index % 2 === 0 ? 'bg-background' : 'bg-muted/10'
                  }`}
                >
                  <div className="col-span-2">
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-primary" />
                      <div>
                        <p className="font-medium text-sm">NF #{nota.nro}</p>
                        <p className="text-xs text-muted-foreground">Pedido: {nota.nro_pedido}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-span-2">
                    <p className="font-medium text-sm truncate">{nota.cliente_nome}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {nota.endereco_entrega_completo?.split(',')[0] || 'Endereço não informado'}
                    </p>
                  </div>
                  
                  <div className="col-span-2">
                    <StatusBadge status={nota.status_nf || 'aguardando'} />
                  </div>
                  
                  <div className="col-span-2">
                    <p className="font-semibold text-sm">
                      R$ {Number(nota.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    {nota.previsao_entrega && (
                      <p className="text-xs text-muted-foreground">
                        Prev: {new Date(nota.previsao_entrega).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </div>
                  
                  <div className="col-span-2">
                    <div className="flex items-center gap-2">
                      <Truck size={14} className="text-muted-foreground" />
                      <p className="text-sm truncate">{nota.transportadora_nome || 'Não atribuída'}</p>
                    </div>
                  </div>
                  
                  <div className="col-span-1">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <Package size={12} className="text-muted-foreground" />
                        <span className="text-xs">{nota.qtd_volumes || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Weight size={12} className="text-muted-foreground" />
                        <span className="text-xs">{nota.peso_real || 0}kg</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-span-1">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye size={14} className="mr-2" />
                          Detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit size={14} className="mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => handleDeleteNota(nota.id)}
                        >
                          <Trash2 size={14} className="mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <RefreshCw className="animate-spin mx-auto text-primary" size={32} />
          <p className="text-muted-foreground">Carregando notas fiscais...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 text-foreground">
            <FileText size={28} className="text-primary" />
            Notas Fiscais
          </h1>
          <p className="text-muted-foreground mt-2">
            Gerencie todas as notas fiscais e acompanhe o status das entregas
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter size={16} className="mr-2" />
            Filtros Avançados
          </Button>
          <Button className="bg-primary hover:bg-primary/90">
            <FileText size={16} className="mr-2" />
            Nova Nota
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card className="border border-border shadow-sm">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por NF, cliente, pedido..."
                value={filtros.busca}
                onChange={(e) => setFiltros(prev => ({ ...prev, busca: e.target.value }))}
                className="pl-10 border-border focus:border-primary"
              />
            </div>
            
            <Select value={filtros.status} onValueChange={(value) => setFiltros(prev => ({ ...prev, status: value === 'todos' ? '' : value }))}>
              <SelectTrigger className="border-border focus:border-primary">
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <config.icon size={12} />
                      {config.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="date"
              placeholder="Data início"
              value={filtros.dataInicio}
              onChange={(e) => setFiltros(prev => ({ ...prev, dataInicio: e.target.value }))}
              className="border-border focus:border-primary"
            />

            <Input
              type="date"
              placeholder="Data fim"
              value={filtros.dataFim}
              onChange={(e) => setFiltros(prev => ({ ...prev, dataFim: e.target.value }))}
              className="border-border focus:border-primary"
            />
          </div>
        </CardContent>
      </Card>

      {/* Resultados e Toggle de Visualização */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{notasFiltradas.length}</span> nota(s) encontrada(s)
          </p>
          {notasFiltradas.length > 0 && (
            <Badge variant="outline" className="text-xs">
              Total: R$ {notasFiltradas.reduce((acc, nota) => acc + Number(nota.valor || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button 
            variant={viewMode === 'cards' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setViewMode('cards')}
            className="text-xs"
          >
            <Package size={14} className="mr-1" />
            Cards
          </Button>
          <Button 
            variant={viewMode === 'table' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setViewMode('table')}
            className="text-xs"
          >
            <FileText size={14} className="mr-1" />
            Tabela
          </Button>
        </div>
      </div>

      {/* Lista de Notas */}
      {notasFiltradas.length === 0 ? (
        <Card className="border border-border">
          <CardContent className="py-16 text-center">
            <FileText size={64} className="mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-medium mb-2 text-foreground">Nenhuma nota fiscal encontrada</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Ajuste os filtros de pesquisa ou adicione uma nova nota fiscal para começar.
            </p>
            <Button className="mt-4">
              <FileText size={16} className="mr-2" />
              Adicionar Nova Nota
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === 'table' ? (
        <TableView />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notasFiltradas.map(nota => (
            <NotaCard key={nota.id} nota={nota} />
          ))}
        </div>
      )}
    </div>
  );
}