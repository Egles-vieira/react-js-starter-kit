import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  ArrowLeft,
  FileText,
  User,
  MapPin,
  Truck,
  Package,
  Weight,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  Printer,
  Edit,
  RefreshCw,
  Eye,
  Download,
  Share2,
  MoreHorizontal,
  Navigation,
  Target,
  Ruler
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { apiFetch } from '@/services/api';
import { GoogleMap, Marker, Polyline } from '@react-google-maps/api';

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
  },
  'pedido reservado': {
    label: 'Pedido Reservado',
    color: 'bg-orange-100 text-orange-800',
    icon: AlertCircle
  },
  'pedido embarcado': {
    label: 'Pedido Embarcado',
    color: 'bg-purple-100 text-purple-800',
    icon: Package
  }
};

export default function DetalhesNotaFiscal() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [notaFiscal, setNotaFiscal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDetalhesNota();
  }, [id]);

  const carregarDetalhesNota = async () => {
    try {
      setLoading(true);
      const data = await apiFetch(`/api/notaFiscal/${id}`);
      setNotaFiscal(data);
    } catch (error) {
      toast.error('Erro ao carregar detalhes da nota fiscal');
      console.error(error);
    } finally {
      setLoading(false);
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

  const InfoCard = ({ title, icon: Icon, children, className = "" }) => (
    <Card className={`border border-border ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2 text-foreground">
          <Icon size={20} className="text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );

  const DataItem = ({ label, value, icon: Icon }) => (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={16} className="text-muted-foreground" />}
        <span className="text-sm text-muted-foreground">{label}:</span>
      </div>
      <span className="text-sm font-medium text-foreground">{value || 'Não informado'}</span>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <RefreshCw className="animate-spin mx-auto text-primary" size={32} />
          <p className="text-muted-foreground">Carregando detalhes da nota fiscal...</p>
        </div>
      </div>
    );
  }

  if (!notaFiscal) {
    return (
      <div className="space-y-6 p-6">
        <Card className="border border-border">
          <CardContent className="py-16 text-center">
            <FileText size={64} className="mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-medium mb-2 text-foreground">Nota fiscal não encontrada</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              A nota fiscal solicitada não foi encontrada ou você não tem permissão para visualizá-la.
            </p>
            <Button className="mt-4" onClick={() => navigate('/listanotasfiscais')}>
              <ArrowLeft size={16} className="mr-2" />
              Voltar à Lista
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/listanotasfiscais')}>
            <ArrowLeft size={16} className="mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3 text-foreground">
              <FileText size={28} className="text-primary" />
              Nota Fiscal #{notaFiscal.nro}
            </h1>
            <p className="text-muted-foreground mt-1">
              Pedido: {notaFiscal.nro_pedido} • Chave: {notaFiscal.chave_nf}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal size={16} className="mr-2" />
                Ações
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
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
                Imprimir
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download size={14} className="mr-2" />
                Baixar PDF
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Share2 size={14} className="mr-2" />
                Compartilhar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <ExternalLink size={14} className="mr-2" />
                Consultar SEFAZ
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button>
            <Eye size={16} className="mr-2" />
            Rastrear Entrega
          </Button>
        </div>
      </div>

      {/* Status e Valor */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border border-border">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="mb-4">
                <StatusBadge status={notaFiscal.status_nf || 'aguardando'} />
              </div>
              <h3 className="text-2xl font-bold text-foreground">
                R$ {Number(notaFiscal.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </h3>
              <p className="text-sm text-muted-foreground">Valor Total</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Package size={24} className="text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">{notaFiscal.qtd_volumes || 0}</h3>
              <p className="text-sm text-muted-foreground">Volumes</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Weight size={24} className="text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">{notaFiscal.peso_real || 0} kg</h3>
              <p className="text-sm text-muted-foreground">Peso Real</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Abas de Detalhes */}
      <Tabs defaultValue="geral" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="cliente">Cliente</TabsTrigger>
          <TabsTrigger value="entrega">Entrega</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="geral" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <InfoCard title="Informações da Nota" icon={FileText}>
              <div className="space-y-1">
                <DataItem label="Número da NF" value={notaFiscal.nro} />
                <DataItem label="Série" value={notaFiscal.ser} />
                <DataItem label="Chave de Acesso" value={notaFiscal.chave_nf} />
                <DataItem 
                  label="Data de Emissão" 
                  value={notaFiscal.emi_nf ? new Date(notaFiscal.emi_nf).toLocaleDateString('pt-BR') : null}
                  icon={Calendar}
                />
                <DataItem label="Número do Pedido" value={notaFiscal.nro_pedido} />
                <DataItem label="Código do Representante" value={notaFiscal.cod_rep} />
                <DataItem label="Nome do Representante" value={notaFiscal.nome_rep} />
              </div>
            </InfoCard>

            <InfoCard title="Valores e Medidas" icon={DollarSign}>
              <div className="space-y-1">
                <DataItem 
                  label="Valor Total" 
                  value={`R$ ${Number(notaFiscal.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                />
                <DataItem 
                  label="Valor do Frete" 
                  value={`R$ ${Number(notaFiscal.valor_frete || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                />
                <DataItem label="Peso Real" value={`${notaFiscal.peso_real || 0} kg`} icon={Weight} />
                <DataItem label="Peso Líquido" value={`${notaFiscal.peso_liquido || 0} kg`} />
                <DataItem label="Peso para Cálculo" value={`${notaFiscal.peso_calculo || 0} kg`} />
                <DataItem label="Metro Cúbico" value={`${notaFiscal.metro_cubico || 0} m³`} />
                <DataItem label="Quantidade de Volumes" value={notaFiscal.qtd_volumes} icon={Package} />
              </div>
            </InfoCard>
          </div>

          {notaFiscal.observacoes && (
            <InfoCard title="Observações" icon={FileText}>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {notaFiscal.observacoes}
                </p>
              </div>
            </InfoCard>
          )}
        </TabsContent>

        <TabsContent value="cliente" className="space-y-6">
          <InfoCard title="Dados do Cliente" icon={User}>
            <div className="space-y-1">
              <DataItem label="Nome" value={notaFiscal.cliente_nome} />
              <DataItem label="Código do Cliente" value={notaFiscal.cliente_cod_cliente} />
            </div>
          </InfoCard>
        </TabsContent>

        <TabsContent value="entrega" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <InfoCard title="Endereço de Entrega" icon={MapPin}>
              <div className="space-y-1">
                <DataItem 
                  label="Endereço Completo" 
                  value={notaFiscal.endereco_entrega_completo}
                />
              </div>
            </InfoCard>

            <InfoCard title="Transportadora" icon={Truck}>
              <div className="space-y-1">
                <DataItem label="Nome" value={notaFiscal.transportadora_nome} />
                <DataItem label="Série CTRC" value={notaFiscal.ser_ctrc} />
                <DataItem label="Número CTRC" value={notaFiscal.nro_ctrc} />
                <DataItem label="Chave CTE" value={notaFiscal.chave_cte} />
              </div>
            </InfoCard>
          </div>

          <InfoCard title="Prazos e Datas" icon={Calendar}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <DataItem 
                  label="Previsão de Entrega" 
                  value={notaFiscal.previsao_entrega ? new Date(notaFiscal.previsao_entrega).toLocaleDateString('pt-BR') : null}
                />
                <DataItem 
                  label="Data de Entrega" 
                  value={notaFiscal.data_entrega ? new Date(notaFiscal.data_entrega).toLocaleDateString('pt-BR') : null}
                />
                <DataItem label="Hora de Entrega" value={notaFiscal.hora_entrega} />
              </div>
              <div className="space-y-1">
                <DataItem 
                  label="Data de Separação" 
                  value={notaFiscal.data_separacao ? new Date(notaFiscal.data_separacao).toLocaleDateString('pt-BR') : null}
                />
                <DataItem 
                  label="Data de Conferência" 
                  value={notaFiscal.data_conferencia ? new Date(notaFiscal.data_conferencia).toLocaleDateString('pt-BR') : null}
                />
                <DataItem 
                  label="Data de Expedição" 
                  value={notaFiscal.data_expedido ? new Date(notaFiscal.data_expedido).toLocaleDateString('pt-BR') : null}
                />
              </div>
            </div>
          </InfoCard>
        </TabsContent>

        <TabsContent value="historico" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Histórico da Entrega */}
            <InfoCard title="Histórico da Nota Fiscal" icon={Clock}>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">Nota Fiscal Criada</p>
                    <p className="text-xs text-muted-foreground">
                      {notaFiscal.created_at ? new Date(notaFiscal.created_at).toLocaleString('pt-BR') : 'Data não disponível'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">Última Atualização</p>
                    <p className="text-xs text-muted-foreground">
                      {notaFiscal.updated_at ? new Date(notaFiscal.updated_at).toLocaleString('pt-BR') : 'Data não disponível'}
                    </p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    💡 O histórico completo de rastreamento e ocorrências será exibido aqui conforme a integração com sistemas de transporte.
                  </p>
                </div>
              </div>
            </InfoCard>

            {/* Mapa e Auditoria */}
            <InfoCard title="Auditoria de Entrega" icon={Target}>
              <div className="space-y-4">
                {/* Mapa pequeno */}
                <div className="h-48 w-full bg-muted/30 rounded-lg overflow-hidden border">
                  <AuditMap notaFiscal={notaFiscal} />
                </div>

                {/* Informações de auditoria */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <Target size={16} className="text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-800">Ponto de Entrega Programado</p>
                      <p className="text-xs text-green-600 mt-1">
                        {notaFiscal.endereco_entrega_completo || 'Endereço não informado'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <Navigation size={16} className="text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-800">Local da Finalização</p>
                      <p className="text-xs text-blue-600 mt-1">
                        Aguardando dados de GPS do motorista
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <Ruler size={16} className="text-orange-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-orange-800">Distância</p>
                      <p className="text-xs text-orange-600 mt-1">
                        Calculando diferença entre pontos...
                      </p>
                    </div>
                  </div>

                  {/* Status da auditoria */}
                  <div className="pt-2 border-t border-border">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Status da Auditoria:</span>
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                        <Clock size={12} className="mr-1" />
                        Pendente
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </InfoCard>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Componente do mapa de auditoria
const AuditMap = ({ notaFiscal }) => {
  // Coordenadas padrão (centro de São Paulo) - em produção, extrair do endereço
  const defaultCenter = { lat: -23.550520, lng: -46.633308 };
  
  // Simulando coordenadas do endereço de entrega e local de finalização
  const deliveryPoint = { lat: -23.550520, lng: -46.633308 };
  const completionPoint = { lat: -23.551000, lng: -46.634000 }; // Simulado - 50m de diferença
  
  const mapOptions = {
    zoom: 16,
    center: deliveryPoint,
    mapTypeId: 'roadmap',
    disableDefaultUI: true,
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: false
  };

  return (
    <GoogleMap
      mapContainerStyle={{ width: '100%', height: '100%' }}
      options={mapOptions}
    >
      {/* Marcador do ponto de entrega programado */}
      <Marker
        position={deliveryPoint}
        icon={{
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#10b981',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2
        }}
        title="Ponto de Entrega Programado"
      />
      
      {/* Marcador do local de finalização */}
      <Marker
        position={completionPoint}
        icon={{
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#3b82f6',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2
        }}
        title="Local de Finalização"
      />
      
      {/* Linha conectando os pontos */}
      <Polyline
        path={[deliveryPoint, completionPoint]}
        options={{
          strokeColor: '#f59e0b',
          strokeOpacity: 0.8,
          strokeWeight: 3,
          geodesic: true
        }}
      />
    </GoogleMap>
  );
};