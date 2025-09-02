import React from "react";
import { Link, useLocation } from "react-router-dom";

// Mapeamento para nomes amigáveis das rotas:
const breadcrumbNameMap = {
  dashboard: "Dashboard",
  monitoramento: "Monitoramento",
  cadastro: "Cadastro",
  historico: "Histórico",
  romaneios: "Romaneios",
  usuarios: "Usuários",
  monitoradm: "Monitor Adm",
  crons: "Crons",
  listaEmbarcadores: "Embarcadores",
  listaClientes: "Clientes",
  listaTransportadoras: "Transportadoras",
  listaMotoristas: "Motoristas",
  parametros: "Parâmetros",
  codigoOcorrencias: "Código Ocorrências",
  visualizar: "Visualizar",
  // Adicione mais conforme sua estrutura
};

function capitalizeFirst(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter(x => x);

  return (
    <nav className="breadcrumb-nav">
      {pathnames.length === 0 ? (
        <span>Início</span>
      ) : (
        <>
          <Link to="/">Início</Link>
          {pathnames.map((value, index) => {
            const to = "/" + pathnames.slice(0, index + 1).join("/");
            const isLast = index === pathnames.length - 1;
            const label =
              breadcrumbNameMap[value] || capitalizeFirst(decodeURIComponent(value));
            return (
              <span key={to}>
                <span className="breadcrumb-sep">{'>'}</span>
                {isLast ? (
                  <span className="breadcrumb-current">{label}</span>
                ) : (
                  <Link to={to} className="breadcrumb-link">{label}</Link>
                )}
              </span>
            );
          })}
        </>
      )}
      <style>{`
        .breadcrumb-nav {
          font-size: 16px;
          color: #4b5563;
          display: flex;
          align-items: center;
          gap: 4px;
          margin-bottom: 18px;
          margin-left: 4px;
        }
        .breadcrumb-link {
          color: #377dca;
          text-decoration: none;
          transition: color 0.2s;
        }
        .breadcrumb-link:hover {
          color: #174978;
          text-decoration: underline;
        }
        .breadcrumb-sep {
          margin: 0 8px;
          color: #b0b0b0;
        }
        .breadcrumb-current {
          font-weight: 500;
          color: #222;
        }
      `}</style>
    </nav>
  );
};

export default Breadcrumb;
