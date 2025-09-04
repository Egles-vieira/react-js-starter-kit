import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const API_URL = process.env.REACT_APP_API_URL || 'https://app.roadweb.com.br';

export default function TransportadoraCodigoOcorrenciaAdmin() {
  const [mapeamentos, setMapeamentos] = useState([]);
  const [transportadoras, setTransportadoras] = useState([]);
  const [codigosOcorrencias, setCodigosOcorrencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    transportadora_id: '',
    codigo_externo: '',
    codigo_ocorrencia_id: '',
    ativo: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [mapeamentosRes, transportadorasRes, codigosRes] = await Promise.all([
        fetch(`${API_URL}/api/cadastros/admin/transportadora-codigo-ocorrencia`),
        fetch(`${API_URL}/api/transportadoras`),
        fetch(`${API_URL}/api/cadastros/admin/codigo-ocorrencias`)
      ]);

      const [mapeamentosData, transportadorasData, codigosData] = await Promise.all([
        mapeamentosRes.json(),
        transportadorasRes.json(),
        codigosRes.json()
      ]);

      setMapeamentos(mapeamentosData);
      setTransportadoras(transportadorasData);
      setCodigosOcorrencias(codigosData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingItem 
        ? `${API_URL}/api/cadastros/admin/transportadora-codigo-ocorrencia/${editingItem.id}`
        : `${API_URL}/api/cadastros/admin/transportadora-codigo-ocorrencia`;
      
      const method = editingItem ? 'PUT' : 'POST';
      
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          transportadora_id: parseInt(formData.transportadora_id)
        })
      });
      
      setShowModal(false);
      setEditingItem(null);
      setFormData({ transportadora_id: '', codigo_externo: '', codigo_ocorrencia_id: '', ativo: true });
      loadData();
    } catch (error) {
      console.error('Erro ao salvar:', error);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      transportadora_id: item.transportadora_id.toString(),
      codigo_externo: item.codigo_externo,
      codigo_ocorrencia_id: item.codigo_ocorrencia_id,
      ativo: item.ativo
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Tem certeza que deseja excluir?')) {
      try {
        await fetch(`${API_URL}/api/cadastros/admin/transportadora-codigo-ocorrencia/${id}`, {
          method: 'DELETE'
        });
        loadData();
      } catch (error) {
        console.error('Erro ao excluir:', error);
      }
    }
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Mapeamento de Códigos por Transportadora</h1>
        <Button onClick={() => setShowModal(true)}>
          Novo Mapeamento
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="p-4 text-left">Transportadora</th>
                  <th className="p-4 text-left">Código Externo</th>
                  <th className="p-4 text-left">Código Interno</th>
                  <th className="p-4 text-left">Descrição</th>
                  <th className="p-4 text-left">Status</th>
                  <th className="p-4 text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {mapeamentos.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="p-4">{item.transportadora_nome}</td>
                    <td className="p-4 font-mono">{item.codigo_externo}</td>
                    <td className="p-4 font-mono">{item.codigo}</td>
                    <td className="p-4">{item.descricao}</td>
                    <td className="p-4">
                      <Badge variant={item.ativo ? "default" : "secondary"}>
                        {item.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </td>
                    <td className="p-4 space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                        Editar
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}>
                        Excluir
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>
                {editingItem ? 'Editar Mapeamento' : 'Novo Mapeamento'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="transportadora_id">Transportadora</Label>
                  <Select 
                    value={formData.transportadora_id} 
                    onValueChange={(value) => setFormData({...formData, transportadora_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma transportadora" />
                    </SelectTrigger>
                    <SelectContent>
                      {transportadoras.map((t) => (
                        <SelectItem key={t.id} value={t.id.toString()}>
                          {t.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="codigo_externo">Código Externo</Label>
                  <Input
                    id="codigo_externo"
                    value={formData.codigo_externo}
                    onChange={(e) => setFormData({...formData, codigo_externo: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="codigo_ocorrencia_id">Código Interno</Label>
                  <Select 
                    value={formData.codigo_ocorrencia_id} 
                    onValueChange={(value) => setFormData({...formData, codigo_ocorrencia_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um código interno" />
                    </SelectTrigger>
                    <SelectContent>
                      {codigosOcorrencias.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.codigo} - {c.descricao}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingItem ? 'Atualizar' : 'Criar'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
