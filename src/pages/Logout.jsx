// src/pages/Logout.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    // Exemplo: remover token do localStorage
    localStorage.removeItem('authToken');
    // Depois redireciona para login ou dashboard público
    navigate('/login', { replace: true });
  }, [navigate]);

  return null; // não precisa renderizar nada
}
