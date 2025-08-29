import React, { useEffect, useState } from 'react';
import { apiFetch } from '../services/api';

export default function Agendamentos() {
  const [schedules, setSchedules] = useState([]);
  const [form, setForm] = useState({ id: null, name: '', schedule: '' });

  const load = () => {
    apiFetch('/schedules').then((data) => setSchedules(data || []));
  };

  useEffect(() => {
    load();
  }, []);

  const submit = (e) => {
    e.preventDefault();
    const method = form.id ? 'PUT' : 'POST';
    const url = form.id ? `/schedules/${form.id}` : '/schedules';
    apiFetch(url, {
      method,
      body: JSON.stringify(form)
    }).then(() => {
      setForm({ id: null, name: '', schedule: '' });
      load();
    });
  };

  const edit = (item) => setForm(item);
  const toggle = (id) => {
    apiFetch(`/schedules/${id}/toggle`, { method: 'POST' }).then(load);
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Agendamentos</h1>
      <form onSubmit={submit} className="space-x-2">
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Nome"
        />
        <input
          value={form.schedule}
          onChange={(e) => setForm({ ...form, schedule: e.target.value })}
          placeholder="Cron"
        />
        <button type="submit">
          {form.id ? 'Atualizar' : 'Criar'}
        </button>
      </form>
      <ul className="space-y-1">
        {schedules.map((item) => (
          <li key={item.id} className="flex items-center gap-2">
            <span>{item.name}</span>
            <span className="text-sm text-gray-500">{item.schedule}</span>
            <button onClick={() => edit(item)}>Editar</button>
            <button onClick={() => toggle(item.id)}>
              {item.active ? 'Desativar' : 'Ativar'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
