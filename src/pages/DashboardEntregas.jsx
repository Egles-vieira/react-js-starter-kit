import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Calendar,
  MapPin,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { apiFetch } from '@/services/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function DashboardEntregas() {
  const [metricas, setMetricas] = useState({
    totalNotas: 0,
    entregues: 0,
    emTransito: 0,
    pendentes: 0,
    problemas: 0,
    taxaEntrega: 0,
    tempoMedioEntrega: 0
  });
  const [graficos, setGraficos] = useState({
    entregasPorDia: [],
    statusDistribuicao: [],
    ocorrenciasPorTipo: [],
    performanceTransportadoras: []
  });
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState('7d'); // 7d, 30d, 90d

  useEffect(() => {
    carregarDados();
  }, [periodo]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      // Carregar métricas gerais
      const metricasData = await apiFetch(`/api/dashboard/metricas?periodo=${periodo}`);
      setMetricas(metricasData);

      // Carregar dados para gráficos
      const graficosData = await apiFetch(`/api/dashboard/graficos?periodo=${periodo}`);
      setGraficos(graficosData);
      
    } catch (error) {
      toast.error('Erro ao carregar dados do dashboard');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const MetricCard = ({ title, value, subtitle, icon: Icon, trend, color = "text-foreground" }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          <div className="flex flex-col items-end">
            <Icon size={24} className="text-muted-foreground mb-2" />
            {trend && (
              <div className={`flex items-center text-xs ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trend > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                <span className="ml-1">{Math.abs(trend)}%</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const formatarNumero = (num) => {
    return new Intl.NumberFormat('pt-BR').format(num);
  };

  const formatarPorcentagem = (num) => {
    return `${num.toFixed(1)}%`;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard de Entregas</h1>
          <p className="text-muted-foreground">
            Acompanhe o desempenho das entregas em tempo real
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Últimos 90 dias</option>
          </select>
          <Button onClick={carregarDados} variant="outline" size="sm">
            <RefreshCw size={16} className="mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <RefreshCw className="animate-spin" size={32} />
          <span className="ml-3 text-lg">Carregando dados...</span>
        </div>
      ) : (
        <>
          {/* Métricas Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total de Notas"
              value={formatarNumero(metricas.totalNotas)}
              subtitle="Notas fiscais no período"
              icon={Package}
              trend={5.2}
            />
            <MetricCard
              title="Entregas Realizadas"
              value={formatarNumero(metricas.entregues)}
              subtitle={`${formatarPorcentagem(metricas.taxaEntrega)} de sucesso`}
              icon={CheckCircle}
              color="text-green-600"
              trend={2.1}
            />
            <MetricCard
              title="Em Trânsito"
              value={formatarNumero(metricas.emTransito)}
              subtitle="Aguardando entrega"
              icon={Truck}
              color="text-blue-600"
              trend={-1.5}
            />
            <MetricCard
              title="Com Problemas"
              value={formatarNumero(metricas.problemas)}
              subtitle="Requerem atenção"
              icon={AlertTriangle}
              color="text-red-600"
              trend={-8.3}
            />
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Entregas por Dia */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 size={20} />
                  Entregas por Dia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={graficos.entregasPorDia}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="data" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="entregas" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Distribuição de Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart size={20} />
                  Distribuição por Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={graficos.statusDistribuicao}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {graficos.statusDistribuicao.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Ocorrências por Tipo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity size={20} />
                  Ocorrências por Tipo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={graficos.ocorrenciasPorTipo}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="tipo" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="quantidade" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Performance das Transportadoras */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck size={20} />
                  Performance das Transportadoras
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {graficos.performanceTransportadoras.map((transportadora, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{transportadora.nome}</p>
                        <p className="text-sm text-muted-foreground">
                          {transportadora.totalEntregas} entregas
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant="outline" 
                          className={
                            transportadora.taxaSucesso >= 95 
                              ? 'bg-green-100 text-green-800'
                              : transportadora.taxaSucesso >= 85
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }
                        >
                          {formatarPorcentagem(transportadora.taxaSucesso)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resumo de Tempo Médio */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock size={20} />
                Tempo Médio de Entrega
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">{metricas.tempoMedioEntrega}</p>
                  <p className="text-sm text-muted-foreground">Dias em média</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">
                    {formatarPorcentagem(metricas.taxaEntrega)}
                  </p>
                  <p className="text-sm text-muted-foreground">Taxa de sucesso</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-orange-600">
                    {formatarNumero(metricas.pendentes)}
                  </p>
                  <p className="text-sm text-muted-foreground">Entregas pendentes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

