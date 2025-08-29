// src/pages/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiMail, FiLock } from 'react-icons/fi';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const navigate = useNavigate();

  const fazerLogin = async () => {
    if (!email || !senha) {
      setErro('Preencha o email e a senha.');
      return;
    }

    setErro('');
    setLoading(true);

    try {
      const res = await axios.post('https://app.roadweb.com.br/api/login', { email, senha });

      if (res.data.token) {
        const { token, usuario } = res.data;

        localStorage.setItem('token', token);
        localStorage.setItem('nome', usuario.nome);
        localStorage.setItem('email', usuario.email);
        localStorage.setItem('perfil_id', usuario.perfil.id);
        localStorage.setItem('perfil_nome', usuario.perfil.nome);
        localStorage.setItem('perfil_descricao', usuario.perfil.descricao);

        setShowSplash(true);
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        setErro('Token não recebido. Verifique o servidor.');
        console.log('Resposta do servidor:', res.data);
      }
    } catch (err) {
      console.error('Erro ao fazer login:', err.response?.data || err.message);
      setErro(err.response?.data?.mensagem || 'Email ou senha inválidos.');
    } finally {
      setLoading(false);
    }
  };

  if (showSplash) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
        <img
          src="https://road-guard-audios.sfo3.cdn.digitaloceanspaces.com/no-removebg-preview.png"
          alt="Splash"
          style={{ width: 120, animation: 'pulse 2s infinite' }}
        />
        <div style={{ height: 3, width: 180, background: '#eee', borderRadius: 10, overflow: 'hidden', marginTop: 20 }}>
          <div style={{ width: '100%', height: '100%', background: '#FF612B', animation: 'progressBar 2s linear forwards' }}></div>
        </div>
        <style>
          {`
            @keyframes pulse {
              0% { transform: scale(1); opacity: 1; }
              50% { transform: scale(1.1); opacity: 0.8; }
              100% { transform: scale(1); opacity: 1; }
            }
            @keyframes progressBar {
              0% { width: 0; }
              100% { width: 100%; }
            }
          `}
        </style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
      {/* Lado esquerdo com imagem */}
<div style={{ flex: 1.6, background: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

        <img src="https://heavycomprovante.nyc3.cdn.digitaloceanspaces.com/img/logo-road-removebg-preview.png" alt="Illustration" style={{ maxWidth: '90%', height: 'auto' }} />
      </div>

      {/* Lado direito com formulário */}
      <div style={{ flex: 1, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: 460, width: '90%', padding: 40 }}>
          <img
            src="https://road-guard-audios.sfo3.cdn.digitaloceanspaces.com/no-removebg-preview.png"
            alt="Logo"
            style={{ height: 50, objectFit: 'contain', marginBottom: 20 }}
          />
          <h2 style={{ fontSize: 22, fontWeight: '600', color: '#1d1d1d', marginBottom: 20 }}>Bem vindo de volta!</h2>

          {erro && <div style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '10px 16px', borderRadius: 6, fontSize: 14, marginBottom: 12 }}>{erro}</div>}

          <div style={{ position: 'relative', marginBottom: 16 }}>
            <FiMail style={{ position: 'absolute', top: 12, left: 12, color: '#888' }} />
            <input
              type="email"
              placeholder="Usuário"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px 10px 36px',
                borderRadius: 6,
                fontSize: 14,
                border: '1px solid #ccc',
                outline: 'none',
              }}
                onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px #00bfff'}
                onBlur={(e) => e.target.style.boxShadow = '0 0 0 2px transparent'}
            />
          </div>

          <div style={{ position: 'relative', marginBottom: 16 }}>
            <FiLock style={{ position: 'absolute', top: 12, left: 12, color: '#888' }} />
            <input
              type="password"
              placeholder="Senha"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px 10px 36px',
                borderRadius: 6,
       
                fontSize: 14,
                border: '1px solid #ccc',
                outline: 'none',
              }}
                onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px #00bfff'}
                onBlur={(e) => e.target.style.boxShadow = '0 0 0 2px transparent'}
            />
          </div>

          <button
            onClick={fazerLogin}
            disabled={loading}
            style={{
              width: '100%',
              padding: 12,
              borderRadius: 6,
              border: 'none',
              backgroundColor: '#FF612B',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: 16,
              cursor: 'pointer',
              marginBottom: 12
            }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>

          <p style={{ fontSize: 13, textAlign: 'center' }}>
            Ainda não tem uma conta? <a href="#" style={{ color: '#FF612B', textDecoration: 'none' }}>Criar conta</a>
          </p>

          <div style={{ textAlign: 'center', margin: '20px 0' }}>or</div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
            <button style={{ flex: 1, border: '1px solid #ccc', borderRadius: 6, padding: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <img src="https://img.icons8.com/color/48/000000/google-logo.png" alt="Google" style={{ width: 20 }} /> Google
            </button>
            <button style={{ flex: 1, border: '1px solid #ccc', borderRadius: 6, padding: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <img src="https://img.icons8.com/ios-glyphs/30/000000/github.png" alt="GitHub" style={{ width: 20 }} /> GitHub
            </button>
          </div>

          <p style={{ fontSize: 12, textAlign: 'center', marginTop: 20 }}>
            <a href="#" style={{ color: '#aaa', marginRight: 10 }}>Aviso de privacidade</a>
            |
            <a href="#" style={{ color: '#aaa', marginLeft: 10 }}>Termos de serviço</a>
          </p>
        </div>
      </div>
    </div>
  );
}
