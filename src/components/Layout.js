import React from "react";
import { useLocation } from "react-router-dom";
import MenuLateral from "./MenuLateral";
import Header from "./Header";



const pageTitles: Record<string, string> = {
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
  '/financeiro': 'Financeiro',
};

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const basePath = "/" + location.pathname.split("/")[1];
  const pageTitle = pageTitles[basePath] || "";

  return (
        <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <MenuLateral />
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        minWidth: 0 // Prevents flex item from overflowing
      }}>
        <Header title={pageTitle} />
        <main style={{ 
          flex: 1, 
          padding: '24px', 
          backgroundColor: '#f3f4f6',
          overflow: 'auto'
        }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;