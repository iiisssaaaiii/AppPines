// src/components/pines/EditPinModal.jsx
import React, { useEffect, useState } from "react";

const EditPinModal = ({ open, pin, onClose, onSave }) => {
  const [tamano, setTamano] = useState("pequeno");
  const [precio, setPrecio] = useState(0);
  const [cantidad, setCantidad] = useState(0);

  useEffect(() => {
    if (pin) {
      setTamano(pin.tamano || "pequeno");
      setPrecio(pin.precio != null ? Number(pin.precio) : 0);
      setCantidad(pin.stock_actual != null ? Number(pin.stock_actual) : 0);
    }
  }, [pin]);

  if (!open || !pin) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    onSave({
      tamano,
      precio: Number(precio) || 0,
      cantidad: Number(cantidad) || 0,
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: 480 }}>
        <h3 style={{ marginTop: 0 }}>Editar pin #{pin.id_pin}</h3>

        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-row">
            <label className="form-label">Tamaño</label>
            <select
              className="form-input"
              value={tamano}
              onChange={(e) => setTamano(e.target.value)}
            >
              <option value="pequeno">Pequeño</option>
              <option value="grande">Grande</option>
            </select>
          </div>

          <div className="form-row">
            <label className="form-label">Precio</label>
            <input
              type="number"
              className="form-input"
              value={precio}
              min="0"
              step="0.01"
              onChange={(e) => setPrecio(e.target.value)}
            />
          </div>

          <div className="form-row">
            <label className="form-label">Stock actual</label>
            <input
              type="number"
              className="form-input"
              value={cantidad}
              min="0"
              step="1"
              onChange={(e) => setCantidad(e.target.value)}
            />
          </div>
        </form>

        <div className="modal-actions" style={{ marginTop: 16 }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPinModal;
