// src/services/api.js
import API_URL from './Config';

export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // 🔁 Se token expirou, redireciona para login
  if (res.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login'; // ou outra rota de login
    return;
  }

  return res.json();
}
