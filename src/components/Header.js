import React from "react";

const Header = ({ title }) => {
  return (
    <>
      <div className="header-superior">
        {/* Logo */}
        <div className="header-left">
          <div className="logo">
            <img
              src="https://road-guard-audios.sfo3.cdn.digitaloceanspaces.com/image-removebg-preview.png"
              style={{ width: '40px', height: '40px' }}
              alt="Logo"
            />
          </div>
          <div className="header-titles">
            {/* Agora usa o título dinâmico */}
            <div className="main-title">{title || "Dashboard"}</div>
            
          </div>
        </div>

        {/* Search */}
        <div className="header-search">
          <input type="text" className="search-input" placeholder="Pesquisar..." />
        </div>

        {/* Right icons */}
        <div className="header-right">
          <button className="icon-btn" title="Add">
            <svg width="20" height="20" viewBox="0 0 20 20">
              <path d="M10 4v12M4 10h12" stroke="#444" strokeWidth="2" fill="none" strokeLinecap="round" />
            </svg>
          </button>
          <button className="icon-btn" title="Notification">
            <svg width="20" height="20" viewBox="0 0 20 20">
              <path d="M10 17a2 2 0 0 0 2-2H8a2 2 0 0 0 2 2zm6-3V9a6 6 0 1 0-12 0v5l-1 1v1h16v-1l-1-1z" fill="#444" />
            </svg>
          </button>
          <button className="icon-btn" title="Help">
            <svg width="20" height="20" viewBox="0 0 20 20">
              <circle cx="10" cy="10" r="9" stroke="#444" strokeWidth="2" fill="none" />
              <text x="10" y="15" textAnchor="middle" fontSize="12" fill="#444" fontFamily="Arial">?</text>
            </svg>
          </button>
          <button className="icon-btn" title="Settings">
            <svg width="20" height="20" viewBox="0 0 20 20">
              <circle cx="10" cy="10" r="8" stroke="#444" strokeWidth="2" fill="none" />
              <circle cx="10" cy="10" r="3" fill="#444" />
            </svg>
          </button>
          <div className="avatar">
            <img
              src="https://api.dicebear.com/7.x/bottts/svg?seed=Chat"
              alt="Avatar"
            />
          </div>
          <button className="icon-btn edit-btn" title="Edit">
            <svg width="18" height="18" viewBox="0 0 20 20">
              <path d="M2 14.5V18h3.5l10-10-3.5-3.5-10 10zM17.3 6.7a1 1 0 0 0 0-1.4l-2.6-2.6a1 1 0 0 0-1.4 0l-1.4 1.4 4 4 1.4-1.4z" fill="#FF612B" />
            </svg>
          </button>
        </div>
      </div>
      <style>{`
        .header-superior {
          height: 70px;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
          padding: 0 32px 0 24px;
          border-bottom: 2px solid #e5e7eb;
          position: relative;
          z-index: 9;
        }
        .header-left {
          display: flex;
          align-items: center;
        }
        .logo {
          margin-right: 20px;
          margin-left: 20px;
          width: 38px;
          height: 38px;
        }
        .header-titles {
          display: flex;
          flex-direction: column;
        }
        .main-title {
          font-size: 24px;
          font-weight: 500;
          color: #222;
          line-height: 1.2;
        }
        .tabs {
          margin-top: 2px;
          display: flex;
        }
        .tab {
          font-size: 16px;
          color: #606060;
          margin-right: 18px;
          padding-bottom: 2px;
          position: relative;
          cursor: pointer;
          display: flex;
          align-items: center;
        }
        .tab.active {
          color: #FF612B;
          font-weight: 500;
        }
        .tab.active::after {
          content: '';
          display: block;
          height: 3px;
          width: 80%;
          background: #FF612B;
          border-radius: 2px 2px 0 0;
          position: absolute;
          bottom: -4px;
          left: 10%;
        }
        .header-search {
          flex: 1;
          display: flex;
          justify-content: center;
        }
        .search-input {
          width: 320px;
          padding: 8px 16px;
          border-radius: 20px;
          border: 1px solid #e5e7eb;
          font-size: 15px;
          outline: none;
          background: #f7f7f7;
          transition: border 0.2s;
        }
        .search-input:focus {
          border-color: #FF612B;
          background: #fff;
        }
        .header-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .icon-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          border-radius: 50%;
          transition: background 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .icon-btn:hover {
          background: #f0f6fa;
        }
        .avatar img {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: 2px solid #e5e7eb;
        }
        .edit-btn {
          margin-left: 8px;
          background: none;
        }
        @media (max-width: 900px) {
          .header-superior { flex-direction: column; height: auto; padding: 8px; }
          .header-search { margin: 10px 0; }
          .search-input { width: 90vw; max-width: 320px; }
          .main-title { font-size: 19px; }
        }
      `}</style>
    </>
  );
};

export default Header;
