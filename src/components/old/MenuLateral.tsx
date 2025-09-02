import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FiUsers,
  FiBarChart2,
  FiMapPin,
  FiLogOut,
  FiChevronRight,
  FiChevronLeft,
  FiSettings,
  FiMenu,
  FiPackage,
  FiClipboard,
  FiDownloadCloud,
  FiDollarSign,
  FiClock,
  FiGitPullRequest,
} from 'react-icons/fi';

const perfil = localStorage.getItem('perfil');  // ← isso precisa estar aqui

const menuSections = [
  {
    title: 'Dashboard',
    items: [
      {
        name: 'Dashboard',
        icon: <FiBarChart2 />,
        to: '/dashboard'
      }
    ]
  },
  {
    title: 'Operações!',
    items: [
      {
        name: 'Operações',
        icon: <FiPackage />,
        children: [
          { name: 'Entregas em geral', to: '/emmanutencao', icon: <FiClipboard /> },
          { name: 'Notas fiscais',      to: '/listanotasfiscais', icon: <FiDownloadCloud /> },
          { name: 'Romaneios',         to: '/romaneios',          icon: <FiGitPullRequest /> }
        ]
      }
    ]
    
  },
    {   
    items: [
      {
        name: 'Financeiro',
        icon: <FiDollarSign />,
        to: '/financeiro',

      }
    ]
    
  },
  
  {
    items: [
      {
        name: 'Tempo real',
        icon: <FiMapPin />,
        to: '/monitoramento',
        children: [
          { name: 'Histórico de rotas', to: '/historico' }
        ]
      }
    ]
  },

  {
    title: 'Cadastro',
    items: [
      {
        name: 'Cadastro',
        icon: <FiClipboard />,
        children: [
          { name: 'Embarcadores', to: '/listaembarcadores' },
          { name: 'Clientes', to: '/listaclientes' },
          { name: 'Motoristas', to: '/Listamotoristas' },
          { name: 'Veículos', to: '/emmanutencao' },
          { name: 'Transportadoras', to: '/ListaTransportadoras' },
          { name: 'Vendedores', to: '/emmanutencao' }
        ]
      }
    ]
  },
{
  title: 'Configurações',
  items: [
    {
      name: 'Configuração',
      icon: <FiSettings />,
      children: [
        { name: 'Usuários sistema', to: '/usuarios' },
        { name: 'Ações agendadas', to: '/crons' }
      ]
    }
  ]
},
  {
    title: 'Integração',
    items: [
      {
        name: 'Integração',
        icon: <FiDownloadCloud />,
        children: [
          { name: 'APIs', to: '/emmanutencao' },
          { name: 'Logs', to: '/emmanutencao' }
        ]
      }
    ]
  }
].filter(Boolean);

const logoutItem = {
  name: 'Sair',
  icon: <FiLogOut />,
  to: '/logout'
};

const fazerLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('nome');
  window.location.href = '/login';
};

export default function MenuLateral() {
  const [collapsed, setCollapsed] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeHover, setActiveHover] = useState(null);
  const location = useLocation();

  const isMobile = window.innerWidth < 768;
  const shouldShow = isMobile ? mobileOpen : true;

  return (
    <>
      {isMobile && mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.3)',
            zIndex: 998
          }}
        />
      )}

      {shouldShow && (
        <aside
          style={{
            width: collapsed ? 75 : 240,
            backgroundColor: '#1F2D3D',
            color: '#212B36',
            height: '100vh',
            transition: 'width 0.3s',
            position: isMobile ? 'fixed' : 'relative',
            zIndex: 999,
            display: 'flex',
            flexDirection: 'column',
            borderRight: '1px solid #e0e0e0',
            top: 0,
            left: 0
          }}
        >
         

          <nav style={{ paddingTop: 12, flexGrow: 1 }}>
            {menuSections.map((section, sIdx) => (
              <div key={sIdx} style={{ marginBottom: 24 }}>
                {!collapsed && (
                  <div
                    style={{
                      padding: '2px 10px',
                      fontSize: 9,
                      fontWeight: 'bold',
                      color: '#919EAB',
                      textTransform: 'uppercase'
                    }}
                  >
                    {section.title}
                  </div>
                )}
                {section.items.map((item, index) => {
                  const isActive =
                    location.pathname === item.to ||
                    (item.children &&
                      item.children.some((c) => c.to === location.pathname));
                  const isHovered = activeHover === `${sIdx}-${index}`;

                  return (
                    <div
                      key={`${sIdx}-${index}`}
                      onMouseEnter={() => setActiveHover(`${sIdx}-${index}`)}
                      onMouseLeave={() => setActiveHover(null)}
                      style={{ position: 'relative' }}
                    >
                      <Link
                        to={item.to || '#'}
                        style={{
                          display: 'flex',
                          flexDirection: collapsed ? 'column' : 'row',
                          alignItems: 'center',
                          gap: 3,
                          padding: '5px 5px',
                          color: isActive ? '#FF612B' : '#637381',
                          textDecoration: 'none',
                          backgroundColor: isActive ? '#ffffffff' : 'transparent',
                          fontWeight: isActive ? 'bold' : 'normal',
                          justifyContent: collapsed ? 'center' : 'flex-start',
                          position: 'relative',
                          borderRadius: 3,
                          transition: 'all 0.3s'
                        }}
                      >
                        <span style={{ fontSize: 25 }}>{item.icon}</span>
                        <span
                          style={{
                            fontSize: 11,
                            marginTop: collapsed ? 2 : 0,
                            textAlign: 'center',
                            display: 'block',
                            width: '100%'
                          }}
                        >
                          {item.name}
                        </span>
                        {item.children && !collapsed && (
                          <FiChevronRight style={{ marginLeft: 'auto' }} />
                        )}
                      </Link>

                      {item.children && isHovered && (
                        <div
                          style={{
                            position: 'absolute',
                            left: '100%',
                            top: 0,
                            background: '#fff',
                            padding: 8,
                            borderRadius: 8,
                            zIndex: 1000,
                            minWidth: 230,
                            boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
                          }}
                        >
                          {item.children.map((child, idx) => (
                            <Link
                              key={idx}
                              to={child.to}
                              style={{
                                display: 'block',
                                color: '#212b36',
                                padding: '8px 12px',
                                textDecoration: 'none',
                                borderRadius: 4,
                                fontSize: 13,
                                backgroundColor:
                                  location.pathname === child.to
                                    ? '#f1f1f1'
                                    : 'transparent'
                              }}
                          >
                              {/* Renderiza o ícone, se existir */}
                              {child.icon && (
                                <span style={{ fontSize: 16, padding: 8,  }}>
                                  {child.icon}
                                </span>
                              )}
                              <span>{child.name}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </nav>

          <div style={{ paddingBottom: 16 }}>
            <Link
              to="#"
              onClick={fazerLogout}
              style={{
                display: 'flex',
                flexDirection: collapsed ? 'column' : 'row',
                alignItems: 'center',
                gap: 10,
                padding: '12px 16px',
                color:
                  location.pathname === logoutItem.to ? '#FF612B' : '#637381',
                backgroundColor:
                  location.pathname === logoutItem.to ? '#e8f5e9' : 'transparent',
                textDecoration: 'none',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: 8
              }}
            >
              <span style={{ fontSize: 20 }}>{logoutItem.icon}</span>
              <span
                style={{
                  fontSize: 13,
                  marginTop: collapsed ? 4 : 0,
                  textAlign: 'center',
                  display: 'block',
                  width: '100%'
                }}
              >
                {logoutItem.name}
              </span>
            </Link>
          </div>
        </aside>
      )}

      {/* Botão de toggle (desktop ou mobile) */}
      <button
        onClick={() => (isMobile ? setMobileOpen(!mobileOpen) : setCollapsed(!collapsed))}
        style={{
          background: '#fff',
          color: '#FF612B',
          border: '1px solid #e0e0e0',
          height: 50,
          width: 30,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'fixed',
          top: 16,
          left: shouldShow ? (collapsed ? 75 : 240) : 10,
          borderRadius: 4,
          cursor: 'pointer',
          zIndex: 1000
        }}
      >
        {isMobile ? <FiMenu /> : collapsed ? <FiChevronRight /> : <FiChevronLeft />}
      </button>
    </>
  );
}