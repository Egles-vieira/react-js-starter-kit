import React, { useEffect, useState } from 'react';
import { apiFetch } from '../services/api';

export default function ArquivosProcessados() {
  const [files, setFiles] = useState([]);
  const [filter, setFilter] = useState('');

  const load = () => {
    const q = filter ? `?q=${encodeURIComponent(filter)}` : '';
    apiFetch(`/processed-files${q}`).then((data) => setFiles(data || []));
  };

  useEffect(() => {
    load();
  }, [filter]);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Arquivos Processados</h1>
      <input
        placeholder="Filtro"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      <ul className="space-y-1">
        {files.map((file) => (
          <li key={file.id}>{file.name}</li>
        ))}
      </ul>
    </div>
  );
}
