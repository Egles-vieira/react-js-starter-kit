import ReactDOM from "react-dom";

const Modal = ({ open, onClose, children }) => {
  if (!open) return null;

  return ReactDOM.createPortal(
    <div className="modal-global-backdrop" onClick={onClose}>
      <div className="modal-global-container" onClick={e => e.stopPropagation()}>
        {children}
      </div>
      <style>{`
        .modal-global-backdrop {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.27);
          z-index: 30000;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .modal-global-container {
          background: #fff;
          padding: 24px;
          border-radius: 10px;
          width: 90vw;
          max-width: 800px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 4px 18px rgba(0,0,0,0.25);
          z-index: 30001; /* Adicional, para garantir acima do backdrop */
          position: relative;
        }
      `}</style>
    </div>,
    document.body
  );
};

export default Modal;
