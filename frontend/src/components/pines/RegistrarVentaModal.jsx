import React, { useState } from "react";
import "../../styles/Inventario.css";

export default function RegistrarVentaModal({
  pin,
  onClose,
  onConfirm,
}) {
  const [cantidad, setCantidad] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const precio = Number(pin.precio || 0);
  const total = cantidad > 0 ? cantidad * precio : 0;

  const validar = () => {
    if (!cantidad || cantidad <= 0) return false;
    if (cantidad > pin.stock_actual) return false;
    return true;
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Registrar venta</h2>

        <p><strong>Pin:</strong> {pin.nombre_pin}</p>
        <p><strong>Stock disponible:</strong> {pin.stock_actual}</p>
        <p><strong>Precio unitario:</strong> ${precio.toFixed(2)}</p>

        <label className="modal-label">Cantidad vendida</label>
        <input
          type="number"
          className="modal-input"
          min="1"
          value={cantidad}
          onChange={(e) => setCantidad(Number(e.target.value))}
          placeholder="Ej: 5"
        />

        {cantidad > pin.stock_actual && (
          <p className="error-text">
            La cantidad supera el stock disponible.
          </p>
        )}

        {/* Total dinámico */}
        <div className="venta-total-box">
          <p><strong>Total:</strong> ${total.toFixed(2)}</p>
        </div>

        <label className="modal-label">Descripción (opcional)</label>
        <textarea
          className="modal-textarea"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Ej: Venta mostrador"
        />

        <div className="modal-buttons">
          <button className="btn btn-blue" onClick={onClose}>Cancelar</button>

          <button
            className="btn btn-green"
            disabled={!validar()}
            onClick={() =>
              onConfirm({
                cantidad,
                descripcion,
              })
            }
          >
            Registrar venta
          </button>
        </div>
      </div>
    </div>
  );
}
