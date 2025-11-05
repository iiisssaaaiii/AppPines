// src/pages/Catalogo.jsx
import React, { useEffect, useState } from "react";

const Catalogo = () => {
  const [pines, setPines] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    fetch("http://localhost:4000/api/catalogo")
      .then((res) => res.json())
      .then((data) => {
        setPines(data);
        setCargando(false);
      })
      .catch((err) => {
        console.error("Error al cargar el catálogo:", err);
        setCargando(false);
      });
  }, []);

  if (cargando) {
    return <div className="page-container">Cargando catálogo...</div>;
  }

  return (
    <div className="page-container">
      <h1 className="section-title">📔 Catálogo de Pines</h1>

      {pines.length === 0 ? (
        <p className="empty-state">No hay plantillas guardadas todavía.</p>
      ) : (
        <div className="table-wrapper">
          <table className="catalogo-table">
            <thead>
              <tr>
                <th>Imagen</th>
                <th>Etiqueta</th>
                <th>Tamaño</th>
                <th>Cantidad</th>
                <th>Fecha guardado</th>
              </tr>
            </thead>
            <tbody>
              {pines.map((p) => (
                <tr key={p.id}>
                  <td>
                    <img
                      src={`http://localhost:4000${p.url_imagen}`}
                      alt={p.etiquetas}
                      className="pin-preview"
                    />
                  </td>
                  <td>{p.etiquetas}</td>
                  <td>{p.tamano}</td>
                  <td>{p.cantidad}</td>
                  <td>
                    {new Date(p.fecha_guardado).toLocaleString("es-MX", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Catalogo;
