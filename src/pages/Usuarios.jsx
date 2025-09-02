// ListaUsuarios.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ListaUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    axios.get('/api/usuarios', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      setUsuarios(response.data);
    }).catch(err => {
      console.error('Erro ao buscar usuários:', err);
    });
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Usuários</h2>
      <table className="min-w-full bg-white border">
        <thead>
          <tr>
            <th className="border px-4 py-2">ID</th>
            <th className="border px-4 py-2">Nome</th>
            <th className="border px-4 py-2">Email</th>
            <th className="border px-4 py-2">Perfil</th>
            <th className="border px-4 py-2">Ações</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map(usuario => (
            <tr key={usuario.id}>
              <td className="border px-4 py-2">{usuario.id}</td>
              <td className="border px-4 py-2">{usuario.nome}</td>
              <td className="border px-4 py-2">{usuario.email}</td>
              <td className="border px-4 py-2">{usuario.perfil_nome}</td>
              <td className="border px-4 py-2">
                <button className="text-blue-500 mr-2">Editar</button>
                <button className="text-red-500">Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ListaUsuarios;
