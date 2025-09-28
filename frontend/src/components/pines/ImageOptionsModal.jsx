import React from "react";
import "../../styles/ProduccionPines.css";

const ImageOptionsModal = ({ isOpen, onClose, onEdit, onDelete }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Opciones de imagen</h3>
        <button className="btn-editar" onClick={onEdit}>✏️ Editar</button>
        <button className="btn-eliminar" onClick={onDelete}>❌ Eliminar</button>
        <button className="btn-cancelar" onClick={onClose}>Cancelar</button>
      </div>
    </div>
  );
};

export default ImageOptionsModal;
