// src/pages/Inventario.jsx
import React, { useEffect, useState } from "react";
import { obtenerInventario } from "../services/inventarioService";
import { actualizarPin, eliminarPin } from "../services/pinesService";
import EditPinModal from "../components/pines/EditPinModal";
import ConfirmDialog from "../components/common/ConfirmDialog";

const Inventario = () => {
  const [pines, setPines] = useState([]);
  const [materiaPrima, setMateriaPrima] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [loading, setLoading] = useState(true);

  // Modales
  const [editingPin, setEditingPin] = useState(null);
  const [deletingPin, setDeletingPin] = useState(null);

  const cargarInventario = async () => {
    setLoading(true);
    try {
      const data = await obtenerInventario();
      setPines(data.inventario || []);
      setMateriaPrima(data.materiaPrima || []);
    } catch (err) {
      console.error("Error al obtener inventario:", err);
      alert("No se pudo cargar el inventario");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarInventario(); }, []);

  // Etiquetas únicas
  const etiquetasDisponibles = [
    ...new Set((pines || []).flatMap((p) => (p.etiquetas ? p.etiquetas.split(",").map(s => s.trim()).filter(Boolean) : [])))
  ];

  // Filtrar por etiqueta
  const pinesFiltrados = filtro ? pines.filter((p) => (p.etiquetas || "").includes(filtro)) : pines;

  // Guardar edición
  const handleSaveEdit = async (data) => {
    if (!editingPin) return;
    try {
      const actualizado = await actualizarPin(editingPin.id_pin, data);
      setPines((prev) =>
        prev.map((pin) => (pin.id_pin === editingPin.id_pin ? { ...pin, ...actualizado } : pin))
      );
      setEditingPin(null);
    } catch (err) {
      console.error(err);
      alert("No se pudo actualizar el pin");
    }
  };

  // Confirmar eliminación
  const handleConfirmDelete = async () => {
    if (!deletingPin) return;
    try {
      await eliminarPin(deletingPin.id_pin);
      setPines((prev) => prev.filter((p) => p.id_pin !== deletingPin.id_pin));
      setDeletingPin(null);
    } catch (err) {
      console.error(err);
      alert("No se pudo eliminar el pin");
    }
  };

  if (loading) {
    return (
      <div className="inventario-page">
        <div className="skeleton-card">Cargando inventario…</div>
      </div>
    );
  }

  return (
    <div className="inventario-page">
      {/* Encabezado + filtro */}
      <div className="inventario-header">
        <h1 className="section-title">📦 STOCK DE PINES</h1>

        <div className="filter-bar">
          <label className="filter-label">Filtrar por etiqueta</label>
          <div className="pretty-select">
            <select value={filtro} onChange={(e) => setFiltro(e.target.value)}>
              <option value="">-- Todas --</option>
              {etiquetasDisponibles.map((et, i) => (
                <option key={i} value={et}>{et}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid de Pines */}
      <div className="inventario-grid">
        {pinesFiltrados?.length ? (
          pinesFiltrados.map((pin) => (
            <div key={pin.id_pin} className="inventario-panel">
              <div className="pin-image">
                <img
                  src={pin.url_imagen}
                  alt={pin.etiquetas || "pin"}
                />
              </div>

              <div className="pin-info">
                <p><strong>Nombre:</strong> {pin.nombre || `Pin #${pin.id_pin}`}</p>
                <p><strong>Cantidad:</strong> {pin.cantidad}</p>
                <p><strong>Etiquetas:</strong> {pin.etiquetas || "Sin etiquetas"}</p>
                <p><strong>Tamaño:</strong> {pin.tamano}</p>
                <p><strong>Tiempo en stock:</strong>{" "}
                  {typeof pin.tiempo_en_stock !== "undefined" ? `${pin.tiempo_en_stock} días` : "Sin datos"}
                </p>
              </div>

              {/* Acciones — solo en Stock de pines */}
              <div className="pin-actions">
                <button
                  className="btn btn-primary btn-full"
                  onClick={() => setEditingPin(pin)}
                >
                  Modificar
                </button>
                <button
                  className="btn btn-danger btn-full"
                  onClick={() => setDeletingPin(pin)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">No hay pines en inventario</div>
        )}
      </div>

      {/* Materia prima */}
      <div className="materia-card">
        <h2 className="section-subtitle">📦 STOCK DE MATERIA PRIMA</h2>
        <div className="table-wrapper">
          <table className="materia-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Material</th>
                <th>Cantidad</th>
                <th>Stock mínimo</th>
                <th>Unidad</th>
              </tr>
            </thead>
            <tbody>
              {materiaPrima.map((mat) => (
                <tr key={mat.id_material}>
                  <td>{mat.id_material}</td>
                  <td>{mat.nombre}</td>
                  <td>{mat.cantidad}</td>
                  <td>{mat.stock_minimo}</td>
                  <td>{mat.unidad}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Editar */}
      <EditPinModal
        open={!!editingPin}
        pin={editingPin}
        onClose={() => setEditingPin(null)}
        onSave={handleSaveEdit}
      />

      {/* Confirmación Eliminar */}
      <ConfirmDialog
        open={!!deletingPin}
        title="Eliminar pin"
        message={
          deletingPin
            ? `¿Seguro que quieres eliminar el pin ${deletingPin.nombre || `#${deletingPin.id_pin}`}? Esta acción no se puede deshacer.`
            : ""
        }
        onCancel={() => setDeletingPin(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default Inventario;
