import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoadScript } from '@react-google-maps/api';
import './index.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { SidebarProvider } from './contexts/SidebarContext.jsx';


import Layout from './components/Layout.jsx';
import Cadastro from './pages/Cadastro';
import Monitoramento from './pages/Monitoramento';
import Dashboard from './pages/Dashboard';
import Historico from './pages/Historico.jsx';
import Login from './pages/Login.jsx';
import Romaneios from './pages/ListaRomaneios';
import Usuarios from './pages/Usuarios.jsx';
import Monitoradm from './pages/Monitoradm.jsx';
import Crons from './pages/Crons';
import ListaEmbarcadores from './pages/ListaEmbarcadores';
import ListaClientes from './pages/ListaClientes';
import ListaTransportadoras from './pages/ListaTransportadoras';
import ListaMotoristas from './pages/ListaMotoristas';
import ListaNotasFiscais from './pages/ListaNotasFiscais';
import EmManutencao from './components/EmManutencao';
import ListaUsuarios from './pages/ListaUsuarios.jsx';
import Financeiro from './pages/Financeiro.jsx';

function RotaProtegida({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <SidebarProvider>
      <LoadScript
        googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
        libraries={['visualization']}
      >
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<RotaProtegida><Layout><Dashboard /></Layout></RotaProtegida>} />
            <Route path="/monitoramento" element={<RotaProtegida><Layout><Monitoramento /></Layout></RotaProtegida>} />
            <Route path="/cadastro" element={<RotaProtegida><Layout><Cadastro /></Layout></RotaProtegida>} />
            <Route path="/cadastro/:id" element={<RotaProtegida><Layout><Cadastro /></Layout></RotaProtegida>} />
            <Route path="/historico" element={<RotaProtegida><Layout><Historico /></Layout></RotaProtegida>} />
            <Route path="/romaneios" element={<RotaProtegida><Layout><Romaneios /></Layout></RotaProtegida>} />
            <Route path="/usuarios" element={<RotaProtegida><Layout><ListaUsuarios /></Layout></RotaProtegida>} />
            <Route path="/monitoradm" element={<RotaProtegida><Layout><Monitoradm /></Layout></RotaProtegida>} />
            <Route path="/crons" element={<RotaProtegida><Layout><Crons /></Layout></RotaProtegida>} />
            <Route path="/listaembarcadores" element={<RotaProtegida><Layout><ListaEmbarcadores /></Layout></RotaProtegida>} />
            <Route path="/listaclientes" element={<RotaProtegida><Layout><ListaClientes /></Layout></RotaProtegida>} />
            <Route path="/listatransportadoras" element={<RotaProtegida><Layout><ListaTransportadoras /></Layout></RotaProtegida>} />
            <Route path="/listamotoristas" element={<RotaProtegida><Layout><ListaMotoristas /></Layout></RotaProtegida>} />
            <Route path="/emmanutencao" element={<RotaProtegida><Layout><EmManutencao /></Layout></RotaProtegida>} />
            <Route path="/listanotasfiscais" element={<RotaProtegida><Layout><ListaNotasFiscais /></Layout></RotaProtegida>} />
            <Route path="/financeiro" element={<RotaProtegida><Layout><Financeiro /></Layout></RotaProtegida>} />
            
            <Route path="*" element={
              <RotaProtegida>
                <Navigate to="/dashboard" replace />
              </RotaProtegida>
            } />
          </Routes>
          <ToastContainer autoClose={3000} position="top-right" />
        </BrowserRouter>
      </LoadScript>
    </SidebarProvider>
  );
}
