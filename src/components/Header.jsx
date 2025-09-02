import React, { useState } from "react";
import { FiSearch, FiPlus, FiBell, FiHelpCircle, FiSettings, FiUser } from "react-icons/fi";

const Header = ({ title }) => {
  const [searchValue, setSearchValue] = useState("");
  const [notificationsCount, setNotificationsCount] = useState(3);

  return (
    <>
      <header className="modern-header">
        {/* Left section */}
        <div className="header-left">
          <div className="brand-section">
            <img
              src="https://road-guard-audios.sfo3.cdn.digitaloceanspaces.com/image-removebg-preview.png"
              className="brand-logo"
              alt="RoadWise Logo"
            />
            <div className="brand-info">
              <h1 className="page-title">{title || "Dashboard"}</h1>
              <span className="page-subtitle">Sistema de Monitoramento</span>
            </div>
          </div>
        </div>

        {/* Center section - Search */}
        <div className="header-center">
          <div className="search-container">
            <FiSearch className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Pesquisar veículos, motoristas..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
            {searchValue && (
              <button 
                className="clear-search"
                onClick={() => setSearchValue("")}
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Right section */}
        <div className="header-right">
          <button className="action-btn" title="Adicionar">
            <FiPlus />
          </button>
          
          <button className="action-btn notification-btn" title="Notificações">
            <FiBell />
            {notificationsCount > 0 && (
              <span className="notification-badge">{notificationsCount}</span>
            )}
          </button>
          
          <button className="action-btn" title="Ajuda">
            <FiHelpCircle />
          </button>
          
          <button className="action-btn" title="Configurações">
            <FiSettings />
          </button>
          
          <div className="user-profile">
            <img
              src="https://api.dicebear.com/7.x/bottts/svg?seed=Admin"
              alt="User Avatar"
              className="user-avatar"
            />
            <div className="user-info">
              <span className="user-name">Administrador</span>
              <span className="user-role">Admin</span>
            </div>
          </div>
        </div>
      </header>

      <style>{`
        .modern-header {
          height: 72px;
          background: linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--muted)) 100%);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid hsl(var(--border));
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          position: sticky;
          top: 0;
          z-index: 50;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .header-left {
          flex: 0 0 auto;
        }

        .brand-section {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .brand-logo {
          width: 44px;
          height: 44px;
          border-radius: 8px;
          object-fit: cover;
        }

        .brand-info {
          display: flex;
          flex-direction: column;
        }

        .page-title {
          font-size: 20px;
          font-weight: 600;
          color: hsl(var(--foreground));
          margin: 0;
          line-height: 1.2;
        }

        .page-subtitle {
          font-size: 12px;
          color: hsl(var(--muted-foreground));
          margin-top: 2px;
        }

        .header-center {
          flex: 1;
          display: flex;
          justify-content: center;
          max-width: 600px;
          margin: 0 auto;
        }

        .search-container {
          position: relative;
          width: 100%;
          max-width: 400px;
        }

        .search-input {
          width: 100%;
          height: 42px;
          padding: 0 16px 0 44px;
          border: 1px solid hsl(var(--border));
          border-radius: 21px;
          background: hsl(var(--background));
          color: hsl(var(--foreground));
          font-size: 14px;
          outline: none;
          transition: all 0.2s ease;
        }

        .search-input:focus {
          border-color: hsl(var(--primary));
          box-shadow: 0 0 0 3px hsl(var(--primary) / 0.1);
        }

        .search-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: hsl(var(--muted-foreground));
          width: 18px;
          height: 18px;
        }

        .clear-search {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: hsl(var(--muted-foreground));
          cursor: pointer;
          font-size: 18px;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.2s ease;
        }

        .clear-search:hover {
          background: hsl(var(--muted));
          color: hsl(var(--foreground));
        }

        .header-right {
          flex: 0 0 auto;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .action-btn {
          width: 40px;
          height: 40px;
          border: none;
          background: none;
          color: hsl(var(--muted-foreground));
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }

        .action-btn:hover {
          background: hsl(var(--muted));
          color: hsl(var(--foreground));
        }

        .notification-btn {
          position: relative;
        }

        .notification-badge {
          position: absolute;
          top: 6px;
          right: 6px;
          background: hsl(var(--destructive));
          color: hsl(var(--destructive-foreground));
          border-radius: 50%;
          width: 18px;
          height: 18px;
          font-size: 10px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 12px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-left: 8px;
        }

        .user-profile:hover {
          background: hsl(var(--muted));
        }

        .user-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 2px solid hsl(var(--border));
          object-fit: cover;
        }

        .user-info {
          display: flex;
          flex-direction: column;
        }

        .user-name {
          font-size: 14px;
          font-weight: 500;
          color: hsl(var(--foreground));
          line-height: 1.2;
        }

        .user-role {
          font-size: 12px;
          color: hsl(var(--muted-foreground));
        }

        /* Responsive design */
        @media (max-width: 1024px) {
          .header-center {
            max-width: 300px;
          }
          
          .page-subtitle {
            display: none;
          }
        }

        @media (max-width: 768px) {
          .modern-header {
            height: 64px;
            padding: 0 16px;
          }

          .brand-info {
            display: none;
          }

          .header-center {
            max-width: 200px;
          }

          .search-input {
            height: 36px;
            padding: 0 12px 0 36px;
            font-size: 13px;
          }

          .search-icon {
            left: 12px;
            width: 16px;
            height: 16px;
          }

          .action-btn {
            width: 36px;
            height: 36px;
          }

          .user-info {
            display: none;
          }

          .user-profile {
            padding: 4px;
            margin-left: 4px;
          }
        }

        @media (max-width: 480px) {
          .header-center {
            display: none;
          }

          .action-btn:not(.notification-btn) {
            display: none;
          }
        }
      `}</style>
    </>
  );
};

export default Header;
