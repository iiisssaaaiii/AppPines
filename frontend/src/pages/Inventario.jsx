// src/pages/Inventario.jsx
import React, { useEffect, useState } from "react";
import { obtenerInventario } from "../services/inventarioService";

const Inventario = () => {
  const [pines, setPines] = useState([]);
  const [materiaPrima, setMateriaPrima] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await obtenerInventario();
        setPines(data.inventario || []); // 👈 usa inventario
        setMateriaPrima(data.materiaPrima || []); // 👈 usa materiaPrima
      } catch (error) {
        console.error("Error cargando inventario:", error);
        alert("Error cargando inventario");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <p>Cargando inventario...</p>;

  // etiquetas únicas
  const etiquetasDisponibles = [
    ...new Set(
      (pines || []).flatMap((p) => p.etiquetas?.split(",") || [])
    ),
  ];

  // filtrar
  const pinesFiltrados = filtro
    ? pines.filter((p) => p.etiquetas?.includes(filtro))
    : pines;

  return (
    <div className="inventario-page">
      <h1>📦 STOCK DE PINES</h1>

      <div style={{ marginBottom: "1rem" }}>
        <label style={{ marginRight: "0.5rem" }}>Filtrar por etiqueta:</label>
        <select value={filtro} onChange={(e) => setFiltro(e.target.value)}>
          <option value="">-- Todas --</option>
          {etiquetasDisponibles.map((et, i) => (
            <option key={i} value={et}>
              {et}
            </option>
          ))}
        </select>
      </div>

      {/* Pines */}
      <div className="inventario-grid">
        {pinesFiltrados.length > 0 ? (
          pinesFiltrados.map((pin) => (
            <div key={pin.id_pin} className="pin-card">
              <div className="pin-image">
                <img
                  src={pin.url_imagen}
                  alt={pin.etiquetas || "pin"}
                  style={{
                    width: "100px",
                    height: "100px",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              </div>
              <p><strong>Nombre:</strong> Pin #{pin.id_pin}</p>
              <p><strong>Cantidad:</strong> {pin.cantidad}</p>
              <p><strong>Etiquetas:</strong> {pin.etiquetas || "Sin etiquetas"}</p>
              <p><strong>Tamaño:</strong> {pin.tamano}</p>
              <p><strong>Tiempo en stock:</strong>{" "}{pin.tiempo_en_stock !== null && pin.tiempo_en_stock !== undefined? `${pin.tiempo_en_stock} días`: "Sin datos"}</p>
            </div>
          ))
        ) : (
          <p>No hay pines en inventario</p>
        )}
      </div>

      {/* Materia prima */}
      <h2>📦 STOCK DE MATERIA PRIMA</h2>
      <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
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
  );
};

export default Inventario;
