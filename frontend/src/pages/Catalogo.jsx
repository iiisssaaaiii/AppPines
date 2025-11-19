// src/pages/Catalogo.jsx

import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const Catalogo = () => {
  const [pines, setPines] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [showTemplate, setShowTemplate] = useState(false);
  const [pinSeleccionado, setPinSeleccionado] = useState(null);

  const generarPDF = async () => {
    if (!pinSeleccionado) return;

    const element = document.querySelector(".grid-plantilla");

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "letter",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 20;
    const imgWidth = pageWidth - margin * 2;

    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", margin, margin, imgWidth, imgHeight);
    pdf.save(`plantilla_${pinSeleccionado.id}.pdf`);
  };

  const abrirPlantilla = async (pin) => {
  try {
    const res = await fetch(`http://localhost:4000/api/plantilla/${pin.id}`);
    const data = await res.json();

    setPinSeleccionado(data);
    setShowTemplate(true);
  } catch (error) {
    console.error("Error cargando plantilla:", error);
  }
};


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
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pines.map((p) => (
                <tr key={p.id}>
                  <td>
                    <img
                      src={p.url_imagen}
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
                  <td>
                    <button
                      className="btn-ver"
                      onClick={() => abrirPlantilla(p)}
                    >
                      Ver Plantilla
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showTemplate && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Vista de Plantilla</h2>

            {pinSeleccionado && (
              <>
                <p>
                  <strong>Etiqueta:</strong> {pinSeleccionado.etiquetas}
                </p>
                <p>
                  <strong>Tamaño:</strong> {pinSeleccionado.tamano}
                </p>
                <p>
                  <strong>Cantidad:</strong> {pinSeleccionado.cantidad}
                </p>

                <div className="grid-plantilla">
                  {pinSeleccionado.pines.map((url, i)=> (
                    <img
                      key={i}
                      src={url}
                      alt={`pin-${i}`}
                      className="pin-mini"
                    />
                  ))}
                </div>
              </>
            )}
            <button className="btn-generar" onClick={generarPDF}>
              Descargar PDF
            </button>
            <button
              className="btn-cerrar"
              onClick={() => setShowTemplate(false)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Catalogo;
