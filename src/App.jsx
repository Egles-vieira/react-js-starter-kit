import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LoadScript } from '@react-google-maps/api';
import './index.css'; // ou './index.css' dependendo do seu projeto
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


import MenuLateral from './components/MenuLateral.jsx';
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
import Header from './components/Header.jsx';
import EmManutencao from './components/EmManutencao';
import ListaUsuarios from './pages/ListaUsuarios';
import Financeiro from './pages/Financeiro';

const SIDEBAR_WIDTH_EXPANDED = 280;
const SIDEBAR_WIDTH_COLLAPSED = 70;
const HEADER_HEIGHT = 72;

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/monitoramento': 'Monitoramento',
  '/cadastro': 'Cadastro',
  '/historico': 'Histórico',
  '/romaneios': 'Romaneios',
  '/usuarios': 'Usuários',
  '/monitoradm': 'Monitor Adm',
  '/crons': 'Crons',
  '/listaembarcadores': 'Embarcadores',
  '/listaclientes': 'Clientes',
  '/listatransportadoras': 'Transportadoras',
  '/listamotoristas': 'Motoristas',
  '/listanotasfiscais': 'Notas Fiscais',
  '/financeiro': 'Financeiro'
};

function RotaProtegida({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />
}

function LayoutDashboard({ children }) {
  const location = useLocation();
  const hideSidebar = location.pathname === '/login';
  const basePath = '/' + location.pathname.split('/')[1];
  const pageTitle = pageTitles[basePath] || 'Dashboard';

  if (hideSidebar) {
    return children;
  }

  return (
    <div className="dashboard-layout">
      <MenuLateral />
      
      <div className="main-layout">
        <Header title={pageTitle} />
        
        <main className="main-content">
          <div className="content-container">
            {children}
          </div>
        </main>
      </div>

      <style>{`
        .dashboard-layout {
          display: flex;
          min-height: 100vh;
          background: hsl(var(--background));
        }

        .main-layout {
          flex: 1;
          display: flex;
          flex-direction: column;
          margin-left: ${SIDEBAR_WIDTH_EXPANDED}px;
          transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          min-height: 100vh;
        }

        .main-content {
          flex: 1;
          background: linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--muted)) 100%);
          overflow-x: hidden;
          min-height: calc(100vh - ${HEADER_HEIGHT}px);
        }

        .content-container {
          padding: 24px;
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
          min-height: calc(100vh - ${HEADER_HEIGHT}px - 48px);
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .main-layout {
            margin-left: 0;
          }

          .content-container {
            padding: 16px;
            min-height: calc(100vh - ${HEADER_HEIGHT}px - 32px);
          }
        }

        @media (max-width: 480px) {
          .content-container {
            padding: 12px;
          }
        }

        /* Loading states */
        .loading-skeleton {
          background: linear-gradient(90deg, hsl(var(--muted)) 25%, hsl(var(--muted-foreground) / 0.1) 50%, hsl(var(--muted)) 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
        }

        @keyframes loading {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }

        /* Smooth scrolling */
        .main-content {
          scroll-behavior: smooth;
        }

        /* Focus styles for accessibility */
        .main-content:focus-visible {
          outline: 2px solid hsl(var(--primary));
          outline-offset: 2px;
        }
      `}</style>
    </div>
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
