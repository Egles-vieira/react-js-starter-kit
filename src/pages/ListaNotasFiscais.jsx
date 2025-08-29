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
    status: '',
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

    const statusMatch = !filtros.status || nota.status_nf === filtros.status;
    
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
    <Card className="h-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText size={18} />
              NF #{nota.nro}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Pedido: {nota.nro_pedido}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
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
                className="text-red-600"
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
          <span className="text-sm font-medium">
            R$ {Number(nota.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <strong className="text-foreground">Cliente:</strong>
            <span className="text-muted-foreground">{nota.cliente_nome}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <MapPin size={14} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground truncate">
              {nota.endereco_entrega_completo || 'Endereço não informado'}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Truck size={14} className="text-muted-foreground" />
            <span className="text-muted-foreground">
              {nota.transportadora_nome || 'Não atribuída'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="flex items-center gap-2">
              <Package size={14} className="text-muted-foreground" />
              <span className="text-sm">{nota.qtd_volumes || 0} vol.</span>
            </div>
            <div className="flex items-center gap-2">
              <Weight size={14} className="text-muted-foreground" />
              <span className="text-sm">{nota.peso_real || 0} kg</span>
            </div>
          </div>

          {nota.previsao_entrega && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar size={14} className="text-muted-foreground" />
              <span className="text-muted-foreground">
                Previsão: {new Date(nota.previsao_entrega).toLocaleDateString('pt-BR')}
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <Select 
            value={nota.status_nf || 'aguardando'} 
            onValueChange={(value) => handleStatusChange(nota.id, value)}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(statusConfig).map(([key, config]) => (
                <SelectItem key={key} value={key} className="text-xs">
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto mb-4" size={32} />
          <p className="text-muted-foreground">Carregando notas fiscais...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileText size={24} />
          Notas Fiscais
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter size={16} className="mr-2" />
            Filtros Avançados
          </Button>
          <Button>
            <FileText size={16} className="mr-2" />
            Nova Nota
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por NF, cliente, pedido..."
                value={filtros.busca}
                onChange={(e) => setFiltros(prev => ({ ...prev, busca: e.target.value }))}
                className="pl-10"
              />
            </div>
            
            <Select value={filtros.status} onValueChange={(value) => setFiltros(prev => ({ ...prev, status: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os status</SelectItem>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="date"
              placeholder="Data início"
              value={filtros.dataInicio}
              onChange={(e) => setFiltros(prev => ({ ...prev, dataInicio: e.target.value }))}
            />

            <Input
              type="date"
              placeholder="Data fim"
              value={filtros.dataFim}
              onChange={(e) => setFiltros(prev => ({ ...prev, dataFim: e.target.value }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Resultados */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {notasFiltradas.length} nota(s) encontrada(s)
        </p>
        <div className="flex gap-2">
          <Button 
            variant={viewMode === 'cards' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setViewMode('cards')}
          >
            Cards
          </Button>
          <Button 
            variant={viewMode === 'table' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setViewMode('table')}
          >
            Tabela
          </Button>
        </div>
      </div>

      {/* Lista de Notas */}
      {notasFiltradas.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText size={48} className="mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Nenhuma nota fiscal encontrada</h3>
            <p className="text-muted-foreground">
              Ajuste os filtros ou adicione uma nova nota fiscal.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === 'cards' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" 
          : "space-y-4"
        }>
          {notasFiltradas.map(nota => (
            <NotaCard key={nota.id} nota={nota} />
          ))}
        </div>
      )}
    </div>
  );
}