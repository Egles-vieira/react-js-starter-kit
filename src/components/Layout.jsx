import React from "react";
import { useLocation } from "react-router-dom";
import MenuLateral from "./MenuLateral.jsx";
import Header from "./Header.jsx";

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
  '/financeiro': 'Financeiro',
};

const Layout = ({ children }) => {
  const location = useLocation();
  const basePath = "/" + location.pathname.split("/")[1];
  const pageTitle = pageTitles[basePath] || "Dashboard";

  return (
    <>
      <div className="layout-container">
        <MenuLateral />
        <div className="main-wrapper">
          <Header title={pageTitle} />
          <main className="content-area">
            <div className="content-inner">
              {children}
            </div>
          </main>
        </div>
      </div>

      <style>{`
        .layout-container {
          display: flex;
          height: 100vh;
          width: 100vw;
          overflow: hidden;
          background: hsl(var(--background));
        }

        .main-wrapper {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
          margin-left: 280px;
          transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .content-area {
          flex: 1;
          background: linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--muted)) 100%);
          overflow: auto;
          position: relative;
        }

        .content-inner {
          padding: 24px;
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
          min-height: calc(100vh - 72px);
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .main-wrapper {
            margin-left: 0;
          }

          .content-inner {
            padding: 16px;
          }
        }

        @media (max-width: 480px) {
          .content-inner {
            padding: 12px;
          }
        }

        /* Smooth scrolling */
        .content-area {
          scroll-behavior: smooth;
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
      `}</style>
    </>
  );
};

export default Layout;