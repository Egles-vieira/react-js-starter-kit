import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Search,
  Filter,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  Truck,
  MapPin,
  Calendar,
  User,
  RefreshCw,
  Download,
  Eye,
  Edit,
  MoreHorizontal
} from 'lucide-react';

const tiposOcorrencia = {
  'entrega_realizada': { 
    label: 'Entrega Realizada', 
    color: 'bg-green-100 text-green-800', 
    icon: CheckCircle 
  },
  'tentativa_entrega': { 
    label: 'Tentativa de Entrega', 
    color: 'bg-yellow-100 text-yellow-800', 
    icon: Clock 
  },
  'endereco_incorreto': { 
    label: 'Endereço Incorreto', 
    color: 'bg-red-100 text-red-800', 
    icon: MapPin 
  },
  'destinatario_ausente': { 
    label: 'Destinatário Ausente', 
    color: 'bg-orange-100 text-orange-800', 
    icon: User 
  },
  'recusa_entrega': { 
    label: 'Recusa na Entrega', 
    color: 'bg-red-100 text-red-800', 
    icon: XCircle 
  },
  'avaria_produto': { 
    label: 'Avaria no Produto', 
    color: 'bg-purple-100 text-purple-800', 
    icon: AlertTriangle 
  },
  'em_transito': { 
    label: 'Em Trânsito', 
    color: 'bg-blue-100 text-blue-800', 
    icon: Truck 
  },
  'saiu_entrega': { 
    label: 'Saiu para Entrega', 
    color: 'bg-cyan-100 text-cyan-800', 
    icon: Package 
  }
};

// Dados de exemplo
const ocorrenciasExemplo = [
  {
    id: 1,
    numero_nota_fiscal: 'NF001234',
    tipo: 'entrega_realizada',
    data_ocorrencia: '2024-09-04T10:30:00',
    destinatario: 'João Silva',
    transportadora: 'TNT Express',
    observacoes: 'Entrega realizada com sucesso'
  },
  {
    id: 2,
    numero_nota_fiscal: 'NF001235',
    tipo: 'tentativa_entrega',
    data_ocorrencia: '2024-09-04T09:15:00',
    destinatario: 'Maria Santos',
    transportadora: 'Correios',
    observacoes: 'Destinatário ausente, nova tentativa agendada'
  },
  {
    id: 3,
    numero_nota_fiscal: 'NF001236',
    tipo: 'endereco_incorreto',
    data_ocorrencia: '2024-09-04T08:45:00',
    destinatario: 'Pedro Costa',
    transportadora: 'Jadlog',
    observacoes: 'Endereço não localizado, aguardando correção'
  }
];

export default function GestaoOcorrenciasSimples() {
  const [ocorrencias, setOcorrencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    busca: '',
    tipo: '',
    dataInicio: '',
    dataFim: ''
  });
  const [paginacao, setPaginacao] = useState({
    pagina: 1,
    limite: 20,
    total: 0,
    totalPaginas: 0
  });

  const carregarOcorrencias = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        pagina: paginacao.pagina,
        limite: paginacao.limite,
        ...filtros
      });
      
      const response = await fetch(`http://localhost:4000/api/ocorrencias?${params}`);
      if (response.ok) {
        const data = await response.json();
        setOcorrencias(data.ocorrencias);
        setPaginacao(prev => ({
          ...prev,
          total: data.total,
          totalPaginas: data.totalPaginas
        }));
      } else {
        toast.error('Erro ao carregar ocorrências');
      }
    } catch (error) {
      console.error('Erro ao carregar ocorrências:', error);
      toast.error('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarOcorrencias();
  }, [filtros, paginacao.pagina]);

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
    setPaginacao(prev => ({ ...prev, pagina: 1 })); // Reset para primeira página
  };

  const limparFiltros = () => {
    setFiltros({
      busca: '',
      tipo: '',
      dataInicio: '',
      dataFim: ''
    });
    setPaginacao(prev => ({ ...prev, pagina: 1 }));
  };

  const handleExportar = async () => {
    try {
      const params = new URLSearchParams(filtros);
      const response = await fetch(`http://localhost:4000/api/ocorrencias/export?${params}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ocorrencias.json';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Exportação realizada com sucesso');
      } else {
        toast.error('Erro ao exportar ocorrências');
      }
    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast.error('Erro ao exportar dados');
    }
  };

  const StatusBadge = ({ tipo }) => {
    const config = tiposOcorrencia[tipo] || tiposOcorrencia.em_transito;
    const IconComponent = config.icon;
    
    return (
      <Badge variant="outline" className={`${config.color} flex items-center gap-2 text-sm px-3 py-1`}>
        <IconComponent size={14} />
        {config.label}
      </Badge>
    );
  };

  const formatarData = (data) => {
    if (!data) return 'Não informado';
    return new Date(data).toLocaleString('pt-BR');
  };

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
  };

  const limparFiltros = () => {
    setFiltros({
      busca: '',
      tipo: '',
      dataInicio: '',
      dataFim: ''
    });
  };

  const ocorrenciasFiltradas = ocorrencias.filter(ocorrencia => {
    if (filtros.busca && !ocorrencia.numero_nota_fiscal.toLowerCase().includes(filtros.busca.toLowerCase()) &&
        !ocorrencia.destinatario.toLowerCase().includes(filtros.busca.toLowerCase())) {
      return false;
    }
    if (filtros.tipo && ocorrencia.tipo !== filtros.tipo) {
      return false;
    }
    return true;
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestão de Ocorrências</h1>
          <p className="text-muted-foreground">
            Acompanhe e gerencie todas as ocorrências de entrega
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={carregarOcorrencias} disabled={loading}>
            <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportar}>
            <Download size={16} className="mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter size={20} />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="busca">Buscar</Label>
              <Input
                id="busca"
                placeholder="Número da nota, destinatário..."
                value={filtros.busca}
                onChange={(e) => handleFiltroChange('busca', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="tipo">Tipo de Ocorrência</Label>
              <select
                id="tipo"
                value={filtros.tipo}
                onChange={(e) => handleFiltroChange('tipo', e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-sm"
              >
                <option value="">Todos os tipos</option>
                {Object.entries(tiposOcorrencia).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="dataInicio">Data Início</Label>
              <Input
                id="dataInicio"
                type="date"
                value={filtros.dataInicio}
                onChange={(e) => handleFiltroChange('dataInicio', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="dataFim">Data Fim</Label>
              <Input
                id="dataFim"
                type="date"
                value={filtros.dataFim}
                onChange={(e) => handleFiltroChange('dataFim', e.target.value)}
              />
            </div>

            <div className="flex items-end">
              <Button onClick={limparFiltros} variant="outline" className="w-full">
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Ocorrências */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText size={20} />
              Ocorrências ({loading ? '...' : paginacao.total})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <RefreshCw className="animate-spin" size={24} />
              <span className="ml-2">Carregando ocorrências...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {ocorrencias.map((ocorrencia) => (
                <div key={ocorrencia.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium text-lg">{ocorrencia.numero_nota_fiscal}</h3>
                      <StatusBadge tipo={ocorrencia.tipo} />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye size={16} className="mr-2" />
                        Ver Detalhes
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit size={16} className="mr-2" />
                        Editar
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Data/Hora:</span>
                      <p className="font-medium">{formatarData(ocorrencia.data_ocorrencia)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Destinatário:</span>
                      <p className="font-medium">{ocorrencia.destinatario}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Transportadora:</span>
                      <p className="font-medium">{ocorrencia.transportadora}</p>
                    </div>
                  </div>
                  
                  {ocorrencia.observacoes && (
                    <div className="mt-3 pt-3 border-t">
                      <span className="text-muted-foreground text-sm">Observações:</span>
                      <p className="text-sm mt-1">{ocorrencia.observacoes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {!loading && ocorrencias.length === 0 && (
            <div className="text-center py-8">
              <FileText size={48} className="mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhuma ocorrência encontrada</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="mx-auto mb-2 text-green-600" size={24} />
            <p className="text-sm text-muted-foreground">Entregas Realizadas</p>
            <p className="text-2xl font-bold text-green-600">
              {ocorrencias.filter(o => o.tipo === 'entrega_realizada').length}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="mx-auto mb-2 text-yellow-600" size={24} />
            <p className="text-sm text-muted-foreground">Tentativas</p>
            <p className="text-2xl font-bold text-yellow-600">
              {ocorrencias.filter(o => o.tipo === 'tentativa_entrega').length}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <AlertTriangle className="mx-auto mb-2 text-red-600" size={24} />
            <p className="text-sm text-muted-foreground">Problemas</p>
            <p className="text-2xl font-bold text-red-600">
              {ocorrencias.filter(o => ['endereco_incorreto', 'recusa_entrega', 'avaria_produto'].includes(o.tipo)).length}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Truck className="mx-auto mb-2 text-blue-600" size={24} />
            <p className="text-sm text-muted-foreground">Em Trânsito</p>
            <p className="text-2xl font-bold text-blue-600">
              {ocorrencias.filter(o => ['em_transito', 'saiu_entrega'].includes(o.tipo)).length}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

