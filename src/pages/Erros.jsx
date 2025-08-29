import React, { useEffect, useState } from 'react';
import { apiFetch } from '../services/api';

export default function Erros() {
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    apiFetch('/errors').then((data) => setErrors(data || []));
  }, []);

  const exportList = () => {
    window.location.href = '/api/errors/export';
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Erros</h1>
      <button onClick={exportList}>Exportar</button>
      <ul className="space-y-1">
        {errors.map((err) => (
          <li key={err.id}>{err.message}</li>
        ))}
      </ul>
    </div>
  );
}
