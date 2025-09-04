import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSidebar } from '../contexts/SidebarContext.jsx';
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
  FiHome,
  FiTruck,
  FiNavigation,
  FiDatabase,
  FiActivity,
  FiX,
  FiMessageCircle
} from 'react-icons/fi';

const menuSections = [
  {
    title: 'Principal',
    items: [
      {
        name: 'Dashboard',
        icon: <FiHome />,
        to: '/dashboard'
      }
    ]
  },
  {
    title: 'Operações',
    items: [
      {
        name: 'Monitoramento',
        icon: <FiActivity />,
        to: '/monitoramento',
        description: 'Rastreamento em tempo real'
      },
      {
        name: 'Agente IA',
        icon: <FiMessageCircle />,
        to: '/agente-ia',
        description: 'Assistente inteligente'
      },
      {
        name: 'Entregas',
        icon: <FiPackage />,
        children: [
          { name: 'Dashboard Entregas', to: '/dashboard-entregas', icon: <FiBarChart2 /> },
          { name: 'Rastreamento', to: '/rastreamento-entregas', icon: <FiMapPin /> },
          { name: 'Gestão Ocorrências', to: '/gestao-ocorrencias', icon: <FiActivity /> },
          { name: 'Notas fiscais', to: '/listanotasfiscais', icon: <FiDownloadCloud /> },
          { name: 'Romaneios', to: '/romaneios', icon: <FiGitPullRequest /> }
        ]
      },
      {
        name: 'Histórico',
        icon: <FiClock />,
        to: '/historico',
        description: 'Histórico de rotas'
      }
    ]
  },
  {
    title: 'Financeiro',
    items: [
      {
        name: 'Financeiro',
        icon: <FiDollarSign />,
        to: '/financeiro',
        description: 'Gestão financeira'
      }
    ]
  },
  {
    title: 'Cadastros',
    items: [
      {
        name: 'Cadastros',
        icon: <FiDatabase />,
        children: [
          { name: 'Embarcadores', to: '/listaembarcadores', icon: <FiUsers /> },
          { name: 'Clientes', to: '/listaclientes', icon: <FiUsers /> },
          { name: 'Motoristas', to: '/listamotoristas', icon: <FiTruck /> },
          { name: 'Veículos', to: '/emmanutencao', icon: <FiNavigation /> },
          { name: 'Transportadoras', to: '/listatransportadoras', icon: <FiPackage /> },
          { name: 'Vendedores', to: '/emmanutencao', icon: <FiUsers /> }
        ]
      }
    ]
  },
  {
    title: 'Sistema',
    items: [
      {
        name: 'Configurações',
        icon: <FiSettings />,
        children: [
          { name: 'Usuários sistema', to: '/usuarios', icon: <FiUsers /> },
          { name: 'Agendamentos', to: '/AdminSchedulerSuite', icon: <FiClock /> },
          { name: 'Execucoes', to: '/execucoes', icon: <FiClock /> },
          { name: 'Processados', to: '/arquivos-processados', icon: <FiClock /> },
          { name: 'erros', to: '/erros', icon: <FiClock /> }

        ]
      }
    ]
  }
];

export default function MenuLateral() {
  const [openGroups, setOpenGroups] = useState({});
  const location = useLocation();
  const { 
    collapsed, 
    setCollapsed, 
    mobileOpen, 
    setMobileOpen, 
    isMobile, 
    toggleSidebar,
    sidebarWidth
  } = useSidebar();

  // Auto-open groups that contain the active route
  useEffect(() => {
    const newOpenGroups = {};
    menuSections.forEach((section, sectionIndex) => {
      section.items.forEach((item, itemIndex) => {
        if (item.children && item.children.some(child => child.to === location.pathname)) {
          newOpenGroups[`${sectionIndex}-${itemIndex}`] = true;
        }
      });
    });
    setOpenGroups(newOpenGroups);
  }, [location.pathname]);

  const toggleGroup = (key) => {
    if (collapsed) return;
    setOpenGroups(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const fazerLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('nome');
    window.location.href = '/login';
  };

  const isActiveRoute = (to) => location.pathname === to;
  const hasActiveChild = (children) => children?.some(child => isActiveRoute(child.to));

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && mobileOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`modern-sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Header */}
        <div className="sidebar-header">
          {!collapsed && (
            <div className="brand">
              <img
                src="https://road-guard-audios.sfo3.cdn.digitaloceanspaces.com/image-removebg-preview.png"
                alt="RoadWise"
                className="brand-icon"
              />
              <span className="brand-text">RoadWeb</span>
            </div>
          )}
          
          {isMobile && (
            <button
              className="close-btn"
              onClick={() => setMobileOpen(false)}
            >
              <FiX />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {menuSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="nav-section">
              {!collapsed && section.title && (
                <h3 className="section-title">{section.title}</h3>
              )}
              
              {section.items.map((item, itemIndex) => {
                const key = `${sectionIndex}-${itemIndex}`;
                const isActive = isActiveRoute(item.to) || hasActiveChild(item.children);
                const isOpen = openGroups[key];
                
                return (
                  <div key={key} className="nav-item">
                    {item.children ? (
                      <>
                        <button
                          className={`nav-link group-trigger ${isActive ? 'active' : ''}`}
                          onClick={() => toggleGroup(key)}
                        >
                          <span className="nav-icon">{item.icon}</span>
                          {!collapsed && (
                            <>
                              <div className="nav-content">
                                <span className="nav-text">{item.name}</span>
                                {item.description && (
                                  <span className="nav-description">{item.description}</span>
                                )}
                              </div>
                              <FiChevronRight className={`chevron ${isOpen ? 'rotated' : ''}`} />
                            </>
                          )}
                        </button>
                        
                        {!collapsed && isOpen && (
                          <div className="submenu">
                            {item.children.map((child, childIndex) => (
                              <Link
                                key={childIndex}
                                to={child.to}
                                className={`submenu-link ${isActiveRoute(child.to) ? 'active' : ''}`}
                              >
                                {child.icon && <span className="submenu-icon">{child.icon}</span>}
                                <span className="submenu-text">{child.name}</span>
                              </Link>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <Link
                        to={item.to}
                        className={`nav-link ${isActive ? 'active' : ''}`}
                      >
                        <span className="nav-icon">{item.icon}</span>
                        {!collapsed && (
                          <div className="nav-content">
                            <span className="nav-text">{item.name}</span>
                            {item.description && (
                              <span className="nav-description">{item.description}</span>
                            )}
                          </div>
                        )}
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <button
            className="nav-link logout-btn"
            onClick={fazerLogout}
          >
            <span className="nav-icon"><FiLogOut /></span>
            {!collapsed && <span className="nav-text">Sair</span>}
          </button>
        </div>
      </aside>

      {/* Toggle Button */}
      {!isMobile && (
        <button
          className="sidebar-toggle"
          onClick={toggleSidebar}
          title={collapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
        </button>
      )}

      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          className="mobile-menu-btn"
          onClick={toggleSidebar}
        >
          <FiMenu />
        </button>
      )}

      <style>{`
        .modern-sidebar {
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh;
          width: ${sidebarWidth}px;
          background: linear-gradient(180deg, hsl(var(--sidebar-background)) 0%, hsl(224 71% 6%) 100%);
          border-right: 1px solid hsl(var(--sidebar-border));
          display: flex;
          flex-direction: column;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 100;
          backdrop-filter: blur(10px);
        }

        .modern-sidebar.collapsed {
          width: 70px;
        }

        .modern-sidebar.mobile-open {
          transform: translateX(0);
        }

        .mobile-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 99;
          animation: fadeIn 0.2s ease-out;
        }

        .sidebar-header {
          padding: 20px 16px;
          border-bottom: 1px solid hsl(var(--sidebar-border) / 0.5);
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-height: 72px;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .brand-icon {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          object-fit: cover;
        }

        .brand-text {
          font-size: 18px;
          font-weight: 700;
          color: hsl(var(--sidebar-foreground));
          letter-spacing: -0.02em;
        }

        .close-btn {
          background: none;
          border: none;
          color: hsl(var(--sidebar-foreground));
          cursor: pointer;
          padding: 8px;
          border-radius: 6px;
          transition: all 0.2s ease;
        }

        .close-btn:hover {
          background: hsl(var(--sidebar-accent) / 0.5);
        }

        .sidebar-nav {
          flex: 1;
          padding: 16px 0;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: hsl(var(--sidebar-accent)) transparent;
        }

        .nav-section {
          margin-bottom: 24px;
        }

        .section-title {
          font-size: 11px;
          font-weight: 600;
          color: hsl(var(--sidebar-foreground) / 0.6);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin: 0 0 8px 16px;
          padding: 0;
        }

        .nav-item {
          margin: 2px 8px;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          color: hsl(var(--sidebar-foreground) / 0.8);
          text-decoration: none;
          border-radius: 12px;
          transition: all 0.2s ease;
          cursor: pointer;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
          position: relative;
          min-height: 48px;
        }

        .nav-link:hover {
          background: hsl(var(--sidebar-accent) / 0.1);
          color: hsl(var(--sidebar-foreground));
        }

        .nav-link.active {
          background: hsl(var(--sidebar-primary) / 0.15);
          color: hsl(var(--sidebar-primary));
          font-weight: 500;
        }

        .nav-link.active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 20px;
          background: hsl(var(--sidebar-primary));
          border-radius: 0 2px 2px 0;
        }

        .nav-icon {
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .nav-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .nav-text {
          font-size: 14px;
          font-weight: 500;
          line-height: 1.2;
        }

        .nav-description {
          font-size: 11px;
          color: hsl(var(--sidebar-foreground) / 0.6);
          line-height: 1.2;
        }

        .chevron {
          width: 16px;
          height: 16px;
          transition: transform 0.2s ease;
          flex-shrink: 0;
        }

        .chevron.rotated {
          transform: rotate(90deg);
        }

        .submenu {
          margin-top: 4px;
          margin-left: 32px;
          border-left: 2px solid hsl(var(--sidebar-border) / 0.3);
          padding-left: 12px;
        }

        .submenu-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          color: hsl(var(--sidebar-foreground) / 0.7);
          text-decoration: none;
          border-radius: 8px;
          transition: all 0.2s ease;
          font-size: 13px;
          margin: 2px 0;
        }

        .submenu-link:hover {
          background: hsl(var(--sidebar-accent) / 0.08);
          color: hsl(var(--sidebar-foreground));
        }

        .submenu-link.active {
          background: hsl(var(--sidebar-primary) / 0.1);
          color: hsl(var(--sidebar-primary));
          font-weight: 500;
        }

        .submenu-icon {
          width: 16px;
          height: 16px;
          flex-shrink: 0;
        }

        .sidebar-footer {
          padding: 16px 8px;
          border-top: 1px solid hsl(var(--sidebar-border) / 0.5);
        }

        .logout-btn {
          color: hsl(var(--sidebar-foreground) / 0.8) !important;
        }

        .logout-btn:hover {
          background: hsl(var(--destructive) / 0.1) !important;
          color: hsl(var(--destructive)) !important;
        }

        .sidebar-toggle {
          position: fixed;
          top: 20px;
          left: ${sidebarWidth + 10}px;
          width: 32px;
          height: 32px;
          background: hsl(var(--background));
          border: 1px solid hsl(var(--border));
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          z-index: 101;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .modern-sidebar.collapsed + .sidebar-toggle {
          left: 80px;
        }

        .sidebar-toggle:hover {
          background: hsl(var(--muted));
        }

        .mobile-menu-btn {
          position: fixed;
          top: 16px;
          left: 16px;
          width: 40px;
          height: 40px;
          background: hsl(var(--background));
          border: 1px solid hsl(var(--border));
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 101;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .modern-sidebar {
            transform: translateX(-100%);
          }

          .sidebar-toggle {
            display: none;
          }
        }

        @media (min-width: 769px) {
          .mobile-menu-btn {
            display: none;
          }
        }

        /* Animations */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        /* Custom scrollbar */
        .sidebar-nav::-webkit-scrollbar {
          width: 4px;
        }

        .sidebar-nav::-webkit-scrollbar-track {
          background: transparent;
        }

        .sidebar-nav::-webkit-scrollbar-thumb {
          background: hsl(var(--sidebar-accent) / 0.3);
          border-radius: 2px;
        }

        .sidebar-nav::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--sidebar-accent) / 0.5);
        }
      `}</style>
    </>
  );
}