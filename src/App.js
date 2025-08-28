import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LoadScript } from '@react-google-maps/api';
import './index.css'; // ou './index.css' dependendo do seu projeto
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


import MenuLateral from './components/MenuLateral';
import Cadastro from './pages/Cadastro';
import Monitoramento from './pages/Monitoramento';
import Dashboard from './pages/Dashboard';
import Historico from './pages/Historico';
import Login from './pages/Login';
import Romaneios from './pages/ListaRomaneios';
import Usuarios from './pages/Usuarios';
import Monitoradm from './pages/Monitoradm';
import Crons from './pages/Crons';
import ListaEmbarcadores from './pages/ListaEmbarcadores';
import ListaClientes from './pages/ListaClientes';
import ListaTransportadoras from './pages/ListaTransportadoras';
import ListaMotoristas from './pages/ListaMotoristas';
import ListaNotasFiscais from './pages/ListaNotasFiscais';
import Header from './components/Header';
import EmManutencao from './components/EmManutencao';
import ListaUsuarios from './pages/ListaUsuarios';
import Financeiro from './pages/Financeiro';

const SIDEBAR_WIDTH = 80;

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/monitoramento': 'Monitoramento',
  '/cadastro': 'Cadastro',
  '/historico': 'Histórico',
  '/romaneios': 'Romaneios',
  '/usuarios': 'Usuários',
  '/monitoradm': 'Monitor Adm',
  '/crons': 'Crons',
  '/listaEmbarcadores': 'Embarcadores',
  '/listaClientes': 'Clientes',
  '/listaTransportadoras': 'Transportadoras',
  '/listaMotoristas': 'Motoristas',
};

function RotaProtegida({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />
}

// O LayoutDashboard deve ser recriado para envolver só 1 página por vez:
function LayoutDashboard({ children }) {
  const location = useLocation();
  const hideSidebar = location.pathname === '/login';
  const basePath = '/' + location.pathname.split('/')[1];
  const pageTitle = pageTitles[basePath] || '';

  return (
    <>
      {!hideSidebar && (
        <div className="sidebar-fixed">
          <MenuLateral />
        </div>
      )}
      {!hideSidebar && (
        <div className="header-fixed">
          <Header title={pageTitle} />
        </div>
      )}
      <main className="main-content">
        {children}
      </main>
      <style>{`
        .sidebar-fixed {
          position: fixed;
          top: 0;
          left: 0;
          width: 85;
          height: 100vh;
          background: #102b4e;
          z-index: 1100;
        }
        .header-fixed {
          position: fixed;
          top: 0;
          left: ${SIDEBAR_WIDTH}px;
          width: calc(100% - ${SIDEBAR_WIDTH}px);
          z-index: 1000;
        }
        .main-content {
          margin-left: 76px;
          margin-top: 60px; /* mesma altura do header */
          min-height: calc(100vh - 60px);
          background:hsla(0, 0.00%, 91.00%, 0.99);
          padding: 0px;
        }
        @media (max-width: 900px) {
          .main-content { padding: 5px; }
        }
      `}
      
      </style>
    </>
  );
}

export default function App() {
  return (
   <LoadScript
      googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
      libraries={['visualization']}   // ← necessário para o Heatmap
    >
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<RotaProtegida><LayoutDashboard><Dashboard /></LayoutDashboard></RotaProtegida>} />
          <Route path="/monitoramento" element={<RotaProtegida><LayoutDashboard><Monitoramento /></LayoutDashboard></RotaProtegida>} />
          <Route path="/cadastro" element={<RotaProtegida><LayoutDashboard><Cadastro /></LayoutDashboard></RotaProtegida>} />
          <Route path="/cadastro/:id" element={<RotaProtegida><LayoutDashboard><Cadastro /></LayoutDashboard></RotaProtegida>} />
          <Route path="/historico" element={<RotaProtegida><LayoutDashboard><Historico /></LayoutDashboard></RotaProtegida>} />
          <Route path="/romaneios" element={<RotaProtegida><LayoutDashboard><Romaneios /></LayoutDashboard></RotaProtegida>} />
          <Route path="/usuarios" element={<RotaProtegida><LayoutDashboard><ListaUsuarios /></LayoutDashboard></RotaProtegida>} />
          <Route path="/monitoradm" element={<RotaProtegida><LayoutDashboard><Monitoradm /></LayoutDashboard></RotaProtegida>} />
          <Route path="/crons" element={<RotaProtegida><LayoutDashboard><Crons /></LayoutDashboard></RotaProtegida>} />
          <Route path="/listaEmbarcadores" element={<RotaProtegida><LayoutDashboard><ListaEmbarcadores /></LayoutDashboard></RotaProtegida>} />
          <Route path="/listaClientes" element={<RotaProtegida><LayoutDashboard><ListaClientes /></LayoutDashboard></RotaProtegida>} />
          <Route path="/listaTransportadoras" element={<RotaProtegida><LayoutDashboard><ListaTransportadoras /></LayoutDashboard></RotaProtegida>} />
          <Route path="/listaMotoristas" element={<RotaProtegida><LayoutDashboard><ListaMotoristas /></LayoutDashboard></RotaProtegida>} />
          
          <Route path="/emManutencao" element={<RotaProtegida><LayoutDashboard><EmManutencao /></LayoutDashboard></RotaProtegida>} />
          <Route path="/listaNotasFiscais" element={<RotaProtegida><LayoutDashboard><ListaNotasFiscais /></LayoutDashboard></RotaProtegida>} />
          <Route path="/financeiro" element={<RotaProtegida><LayoutDashboard><Financeiro /></LayoutDashboard></RotaProtegida>} />
          
          
          <Route path="*" element={
            <RotaProtegida>
              <Navigate to="/dashboard" replace />
            </RotaProtegida>
          } />
          
        </Routes>
        <ToastContainer autoClose={3000} position="top-right" />
      </BrowserRouter>
    </LoadScript>
  );
}
