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

export default function DashboardEntregasSimples() {
  const [metricas, setMetricas] = useState({
    totalNotas: 0,
    entregues: 0,
    emTransito: 0,
    pendentes: 0,
    problemas: 0,
    taxaEntrega: 0,
    tempoMedioEntrega: 0
  });
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState('7d');

  const carregarMetricas = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:4000/api/dashboard/metricas?periodo=${periodo}`);
      if (response.ok) {
        const data = await response.json();
        setMetricas(data);
      } else {
        toast.error('Erro ao carregar métricas');
      }
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
      toast.error('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarMetricas();
  }, [periodo]);

  const MetricCard = ({ title, value, subtitle, icon: Icon, trend, color = "text-foreground" }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className={`text-2xl font-bold ${color}`}>{loading ? '...' : value}</p>
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

  const handleRefresh = () => {
    carregarMetricas();
  };

  const handlePeriodoChange = (novoPeriodo) => {
    setPeriodo(novoPeriodo);
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
            onChange={(e) => handlePeriodoChange(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Últimos 90 dias</option>
          </select>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
            <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

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

      {/* Resumo de Tempo Médio */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock size={20} />
            Resumo de Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{loading ? '...' : metricas.tempoMedioEntrega}</p>
              <p className="text-sm text-muted-foreground">Dias em média</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">
                {loading ? '...' : formatarPorcentagem(metricas.taxaEntrega)}
              </p>
              <p className="text-sm text-muted-foreground">Taxa de sucesso</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-600">
                {loading ? '...' : formatarNumero(metricas.pendentes)}
              </p>
              <p className="text-sm text-muted-foreground">Entregas pendentes</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status das Entregas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 size={20} />
              Status das Entregas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-600" />
                  <span>Entregues</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{loading ? '...' : formatarNumero(metricas.entregues)}</span>
                  <Badge className="bg-green-100 text-green-800">
                    {loading ? '...' : formatarPorcentagem((metricas.entregues / metricas.totalNotas) * 100)}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Truck size={16} className="text-blue-600" />
                  <span>Em Trânsito</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{loading ? '...' : formatarNumero(metricas.emTransito)}</span>
                  <Badge className="bg-blue-100 text-blue-800">
                    {loading ? '...' : formatarPorcentagem((metricas.emTransito / metricas.totalNotas) * 100)}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-orange-600" />
                  <span>Pendentes</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{loading ? '...' : formatarNumero(metricas.pendentes)}</span>
                  <Badge className="bg-orange-100 text-orange-800">
                    {loading ? '...' : formatarPorcentagem((metricas.pendentes / metricas.totalNotas) * 100)}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} className="text-red-600" />
                  <span>Com Problemas</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{loading ? '...' : formatarNumero(metricas.problemas)}</span>
                  <Badge className="bg-red-100 text-red-800">
                    {loading ? '...' : formatarPorcentagem((metricas.problemas / metricas.totalNotas) * 100)}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity size={20} />
              Ações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <Package size={16} className="mr-2" />
                Ver Todas as Entregas
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <AlertTriangle size={16} className="mr-2" />
                Entregas com Problema
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Clock size={16} className="mr-2" />
                Entregas Atrasadas
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <BarChart3 size={16} className="mr-2" />
                Relatório Detalhado
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

