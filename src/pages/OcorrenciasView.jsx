import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const API_URL = process.env.REACT_APP_API_URL || 'https://app.roadweb.com.br';

export default function OcorrenciasView() {
  const [ocorrencias, setOcorrencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    nota_fiscal_id: '',
    transportadora_id: '',
    status_normalizado: ''
  });
  const [transportadoras, setTransportadoras] = useState([]);

  useEffect(() => {
    loadTransportadoras();
    loadOcorrencias();
  }, []);

  const loadTransportadoras = async () => {
    try {
      const response = await fetch(`${API_URL}/api/transportadoras`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setTransportadoras(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao carregar transportadoras:', error);
      setTransportadoras([]);
    }
  };

  const loadOcorrencias = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.nota_fiscal_id) params.append('nota_fiscal_id', filters.nota_fiscal_id);
      if (filters.transportadora_id) params.append('transportadora_id', filters.transportadora_id);
      if (filters.status_normalizado) params.append('status_normalizado', filters.status_normalizado);

      const response = await fetch(`${API_URL}/api/ocorrencias?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setOcorrencias(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao carregar ocorrências:', error);
      setOcorrencias([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    setLoading(true);
    loadOcorrencias();
  };

  const clearFilters = () => {
    setFilters({ nota_fiscal_id: '', transportadora_id: '', status_normalizado: '' });
    setLoading(true);
    loadOcorrencias();
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'entregue': return 'default';
      case 'em_transito': return 'secondary';
      case 'unknown': return 'destructive';
      default: return 'outline';
    }
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Ocorrências</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="nota_fiscal_id">ID da Nota Fiscal</Label>
              <Input
                id="nota_fiscal_id"
                type="number"
                value={filters.nota_fiscal_id}
                onChange={(e) => handleFilterChange('nota_fiscal_id', e.target.value)}
                placeholder="ID da NF"
              />
            </div>
            <div>
              <Label htmlFor="transportadora_id">Transportadora</Label>
              <Select 
                value={filters.transportadora_id} 
                onValueChange={(value) => handleFilterChange('transportadora_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas</SelectItem>
                  {transportadoras.map((t) => (
                    <SelectItem key={t.id} value={t.id.toString()}>
                      {t.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status_normalizado">Status</Label>
              <Select 
                value={filters.status_normalizado} 
                onValueChange={(value) => handleFilterChange('status_normalizado', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="entregue">Entregue</SelectItem>
                  <SelectItem value="em_transito">Em Trânsito</SelectItem>
                  <SelectItem value="unknown">Desconhecido</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end space-x-2">
              <Button onClick={applyFilters}>Filtrar</Button>
              <Button variant="outline" onClick={clearFilters}>Limpar</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="p-4 text-left">Data/Hora</th>
                  <th className="p-4 text-left">Nota Fiscal</th>
                  <th className="p-4 text-left">Transportadora</th>
                  <th className="p-4 text-left">Código Externo</th>
                  <th className="p-4 text-left">Código Interno</th>
                  <th className="p-4 text-left">Status</th>
                  <th className="p-4 text-left">Descrição</th>
                </tr>
              </thead>
              <tbody>
                {ocorrencias.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="p-4">
                      {new Date(item.processado_em).toLocaleString('pt-BR')}
                    </td>
                    <td className="p-4">
                      <div>
                        <div className="font-mono text-sm">{item.chave_nf}</div>
                        <div className="text-sm text-muted-foreground">
                          NF: {item.nro}/{item.ser}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">{item.transportadora_nome}</td>
                    <td className="p-4 font-mono">{item.codigo_externo}</td>
                    <td className="p-4 font-mono">{item.codigo || '-'}</td>
                    <td className="p-4">
                      <Badge variant={getStatusBadgeVariant(item.status_normalizado)}>
                        {item.status_normalizado}
                      </Badge>
                    </td>
                    <td className="p-4">{item.descricao || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {ocorrencias.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                Nenhuma ocorrência encontrada
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
