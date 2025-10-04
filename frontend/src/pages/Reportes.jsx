// src/pages/Reportes.jsx
import React, { useEffect, useState } from "react";
import { obtenerMovimientos } from "../services/movimientosService";

const Reportes = () => {
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarMovimientos = async () => {
      try {
        const data = await obtenerMovimientos();
        setMovimientos(data);
      } catch (error) {
        alert("Error al cargar los movimientos");
      } finally {
        setLoading(false);
      }
    };
    cargarMovimientos();
  }, []);

  if (loading) return <p>Cargando reportes...</p>;

  return (
    <div className="reportes-page">
      <h1>📊 Reporte de Movimientos de Inventario</h1>

      {movimientos.length === 0 ? (
        <p>No hay movimientos registrados</p>
      ) : (
        <table className="reportes-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Pin</th>
              <th>Etiqueta</th>
              <th>Tamaño</th>
              <th>Tipo</th>
              <th>Cantidad</th>
              <th>Motivo</th>
              <th>Usuario</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {movimientos.map((mov) => (
              <tr key={mov.id_movimiento}>
                <td>{mov.id_movimiento}</td>
                <td>{mov.id_pin || "-"}</td>
                <td>{mov.etiquetas || "N/A"}</td>
                <td>{mov.tamano || "N/A"}</td>
                <td>{mov.tipo}</td>
                <td>{mov.cantidad}</td>
                <td>{mov.motivo || "Sin motivo"}</td>
                <td>{mov.usuario || "Desconocido"}</td>
                <td>{new Date(mov.fecha_movimiento).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Reportes;
