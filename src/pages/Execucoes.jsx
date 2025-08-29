import React, { useEffect, useState } from 'react';
import { apiFetch } from '../services/api';

export default function Execucoes() {
  const [execs, setExecs] = useState([]);

  useEffect(() => {
    apiFetch('/executions').then((data) => setExecs(data || []));
  }, []);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Execuções</h1>
      <table className="min-w-full text-left">
        <thead>
          <tr>
            <th>Status</th>
            <th>Tempo</th>
            <th>Trace ID</th>
            <th>Detalhe</th>
          </tr>
        </thead>
        <tbody>
          {execs.map((e) => (
            <tr key={e.id} className="border-t">
              <td>{e.status}</td>
              <td>{e.duration}</td>
              <td>{e.trace_id}</td>
              <td>
                <button onClick={() => alert(JSON.stringify(e, null, 2))}>Ver</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
