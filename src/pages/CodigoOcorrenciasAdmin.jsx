import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const API_URL = process.env.REACT_APP_API_URL || 'https://app.roadweb.com.br';

export default function CodigoOcorrenciasAdmin() {
  const [codigos, setCodigos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    codigo: '',
    descricao: '',
    status_normalizado: '',
    ativo: true
  });

  useEffect(() => {
    loadCodigos();
  }, []);

  const loadCodigos = async () => {
    try {
      const response = await fetch(`${API_URL}/api/cadastros/admin/codigo-ocorrencias`);
      const data = await response.json();
      setCodigos(data);
    } catch (error) {
      console.error('Erro ao carregar códigos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingItem 
        ? `${API_URL}/api/cadastros/admin/codigo-ocorrencias/${editingItem.id}`
        : `${API_URL}/api/cadastros/admin/codigo-ocorrencias`;
      
      const method = editingItem ? 'PUT' : 'POST';
      
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      setShowModal(false);
      setEditingItem(null);
      setFormData({ codigo: '', descricao: '', status_normalizado: '', ativo: true });
      loadCodigos();
    } catch (error) {
      console.error('Erro ao salvar:', error);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData(item);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Tem certeza que deseja excluir?')) {
      try {
        await fetch(`${API_URL}/api/cadastros/admin/codigo-ocorrencias/${id}`, {
          method: 'DELETE'
        });
        loadCodigos();
      } catch (error) {
        console.error('Erro ao excluir:', error);
      }
    }
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Códigos de Ocorrências</h1>
        <Button onClick={() => setShowModal(true)}>
          Novo Código
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="p-4 text-left">Código</th>
                  <th className="p-4 text-left">Descrição</th>
                  <th className="p-4 text-left">Status Normalizado</th>
                  <th className="p-4 text-left">Status</th>
                  <th className="p-4 text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {codigos.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="p-4 font-mono">{item.codigo}</td>
                    <td className="p-4">{item.descricao}</td>
                    <td className="p-4">
                      <Badge variant="outline">{item.status_normalizado}</Badge>
                    </td>
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
                {editingItem ? 'Editar Código' : 'Novo Código'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="codigo">Código</Label>
                  <Input
                    id="codigo"
                    value={formData.codigo}
                    onChange={(e) => setFormData({...formData, codigo: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="descricao">Descrição</Label>
                  <Input
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="status_normalizado">Status Normalizado</Label>
                  <Input
                    id="status_normalizado"
                    value={formData.status_normalizado}
                    onChange={(e) => setFormData({...formData, status_normalizado: e.target.value})}
                    required
                  />
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
