import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { apiFetch } from '@/services/api';

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

export default function GestaoOcorrencias() {
  const [ocorrencias, setOcorrencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    busca: '',
    tipo: '',
    status: '',
    dataInicio: '',
    dataFim: ''
  });
  const [paginacao, setPaginacao] = useState({
    pagina: 1,
    limite: 20,
    total: 0
  });

  useEffect(() => {
    carregarOcorrencias();
  }, [filtros, paginacao.pagina]);

  const carregarOcorrencias = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        pagina: paginacao.pagina,
        limite: paginacao.limite,
        ...filtros
      });
      
      const data = await apiFetch(`/api/ocorrencias?${params}`);
      setOcorrencias(data.ocorrencias || []);
      setPaginacao(prev => ({ ...prev, total: data.total || 0 }));
    } catch (error) {
      toast.error('Erro ao carregar ocorrências');
      console.error(error);
    } finally {
      setLoading(false);
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
    setPaginacao(prev => ({ ...prev, pagina: 1 }));
  };

  const limparFiltros = () => {
    setFiltros({
      busca: '',
      tipo: '',
      status: '',
      dataInicio: '',
      dataFim: ''
    });
  };

  const exportarOcorrencias = async () => {
    try {
      const params = new URLSearchParams(filtros);
      const response = await fetch(`/api/ocorrencias/export?${params}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ocorrencias_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Relatório exportado com sucesso');
    } catch (error) {
      toast.error('Erro ao exportar relatório');
      console.error(error);
    }
  };

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
          <Button onClick={carregarOcorrencias} variant="outline" size="sm">
            <RefreshCw size={16} className="mr-2" />
            Atualizar
          </Button>
          <Button onClick={exportarOcorrencias} variant="outline" size="sm">
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
              <Select value={filtros.tipo} onValueChange={(value) => handleFiltroChange('tipo', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os tipos</SelectItem>
                  {Object.entries(tiposOcorrencia).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

      {/* Tabela de Ocorrências */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText size={20} />
              Ocorrências ({paginacao.total})
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nota Fiscal</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Destinatário</TableHead>
                  <TableHead>Transportadora</TableHead>
                  <TableHead>Observações</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ocorrencias.map((ocorrencia) => (
                  <TableRow key={ocorrencia.id}>
                    <TableCell className="font-medium">
                      {ocorrencia.numero_nota_fiscal}
                    </TableCell>
                    <TableCell>
                      <StatusBadge tipo={ocorrencia.tipo} />
                    </TableCell>
                    <TableCell>
                      {formatarData(ocorrencia.data_ocorrencia)}
                    </TableCell>
                    <TableCell>
                      {ocorrencia.destinatario || 'Não informado'}
                    </TableCell>
                    <TableCell>
                      {ocorrencia.transportadora || 'Não informado'}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {ocorrencia.observacoes || 'Sem observações'}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>
                            <Eye size={16} className="mr-2" />
                            Ver Detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit size={16} className="mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <FileText size={16} className="mr-2" />
                            Ver Nota Fiscal
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!loading && ocorrencias.length === 0 && (
            <div className="text-center py-8">
              <FileText size={48} className="mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhuma ocorrência encontrada</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Paginação */}
      {paginacao.total > paginacao.limite && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPaginacao(prev => ({ ...prev, pagina: prev.pagina - 1 }))}
            disabled={paginacao.pagina === 1}
          >
            Anterior
          </Button>
          <span className="flex items-center px-4">
            Página {paginacao.pagina} de {Math.ceil(paginacao.total / paginacao.limite)}
          </span>
          <Button
            variant="outline"
            onClick={() => setPaginacao(prev => ({ ...prev, pagina: prev.pagina + 1 }))}
            disabled={paginacao.pagina >= Math.ceil(paginacao.total / paginacao.limite)}
          >
            Próxima
          </Button>
        </div>
      )}
    </div>
  );
}

