import React from "react";
import { FiSettings } from "react-icons/fi";

export default function EmManutencao() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(120deg, #E9E9E9 0%, #E9E9E9 100%)"
    }}>
      <div style={{
        background: "#fff",
        padding: "48px 32px",
        borderRadius: 16,
        boxShadow: "0 6px 28px rgba(0,0,0,0.10)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        maxWidth: 380
      }}>
        <FiSettings size={68} color="#FF612B" style={{ marginBottom: 18, animation: "spin 2s linear infinite" }} />
        <h1 style={{ color: "#FF612B", marginBottom: 12 }}>Em Manutenção</h1>
        <p style={{ color: "#444", fontSize: 18, textAlign: "center", marginBottom: 26 }}>
          Estamos realizando melhorias.<br />
          Por favor, volte mais tarde.<br />
          <span style={{ fontSize: 13, color: "#888" }}>
            Se precisar, entre em contato com o suporte.
          </span>
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            background: "#FF612B",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "10px 28px",
            fontSize: 16,
            fontWeight: "bold",
            cursor: "pointer",
            marginTop: 4
          }}
        >
          Tentar Novamente
        </button>
      </div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg);}
          100% { transform: rotate(360deg);}
        }
      `}</style>
    </div>
  );
}
