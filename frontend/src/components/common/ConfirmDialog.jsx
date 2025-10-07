// src/components/common/ConfirmDialog.jsx
import React from "react";

const ConfirmDialog = ({ open, title = "Confirmar", message, onCancel, onConfirm }) => {
  if (!open) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3 style={{ marginTop: 0 }}>{title}</h3>
        <p style={{ margin: "12px 0 20px" }}>{message}</p>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onCancel}>Cancelar</button>
          <button className="btn btn-danger" onClick={onConfirm}>Confirmar</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
