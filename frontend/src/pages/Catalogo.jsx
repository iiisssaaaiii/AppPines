// src/pages/Catalogo.jsx

import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "../styles/CatalogoGrid.css";

const Catalogo = () => {
  const [plantillas, setPlantillas] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [showTemplate, setShowTemplate] = useState(false);
  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState(null);

  /* =====================================================
     🔵 Cargar listado de plantillas
     ===================================================== */
  useEffect(() => {
    fetch("http://localhost:4000/api/plantilla")
      .then((res) => res.json())
      .then((data) => {
        setPlantillas(data);
        setCargando(false);
      })
      .catch((err) => {
        console.error("Error al cargar plantillas:", err);
        setCargando(false);
      });
  }, []);

  /* =====================================================
     🔵 Abrir plantilla completa
     ===================================================== */
  const abrirPlantilla = async (item) => {
    try {
      const res = await fetch(`http://localhost:4000/api/plantilla/${item.id}`);
      const data = await res.json();

      setPlantillaSeleccionada(data);
      setShowTemplate(true);
    } catch (error) {
      console.error("Error cargando plantilla:", error);
    }
  };

  /* =====================================================
     🔵 Generar PDF
     ===================================================== */
  const generarPDF = async () => {
    if (!plantillaSeleccionada) return;

    const element = document.querySelector(".hoja-plantilla");

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("landscape", "pt", "letter");

    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    pdf.save(`plantilla_${plantillaSeleccionada.id}.pdf`);
  };

  /* =====================================================
     🔵 Pantalla de carga
     ===================================================== */
  if (cargando) {
    return <div className="page-container">Cargando catálogo...</div>;
  }

  return (
    <div className="page-container">
      <h1 className="section-title">📔 Catálogo de Pines</h1>

      {plantillas.length === 0 ? (
        <p className="empty-state">No hay plantillas guardadas todavía.</p>
      ) : (
        <div className="grid-catalogo">
          {plantillas.map((p) => (
            <div key={p.id} className="card-plantilla">

              {/* 🖼️ Miniatura circular */}
              <img
                src={
                  p.miniatura
                    ? `http://localhost:4000${p.miniatura}`
                    : "https://via.placeholder.com/200?text=Sin+imagen"
                }
                alt={`plantilla-${p.id}`}
                className="miniatura-pin"
              />

              <div className="info-plantilla">

                <p className="dato-plantilla">
                  <strong>Tamaño:</strong> {p.tamano}
                </p>

                <p className="dato-plantilla">
                  <strong>Cantidad:</strong> {p.cantidad}
                </p>

                <p className="dato-plantilla">
                  <strong>Guardado:</strong>{" "}
                  {new Date(p.fecha_guardado).toLocaleString("es-MX", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </p>

                <button
                  className="btn-ver-plantilla"
                  onClick={() => abrirPlantilla(p)}
                >
                  Ver Plantilla
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* =====================================================
         🔵 MODAL → Vista completa horizontal
         ===================================================== */}
      {showTemplate && plantillaSeleccionada && (
        <div className="overlay-modal">
          <div className="contenido-modal">

            <h2>Vista de Plantilla</h2>

            <p>
              <strong>Tamaño:</strong> {plantillaSeleccionada.tamano}
            </p>

            <p>
              <strong>Cantidad:</strong> {plantillaSeleccionada.cantidad}
            </p>

            {/* 🌟 HOJA HORIZONTAL */}
            <div className="hoja-plantilla">
              <div
                className={
                  plantillaSeleccionada.tamano === "pequeno"
                    ? "grid-pines-chicos"
                    : "grid-pines-grandes"
                }
              >
                {plantillaSeleccionada.pines.map((p, i) => (
                  <img
                    key={i}
                    src={`http://localhost:4000${p.url}`}
                    alt={`pin-${i}`}
                    className="pin-circular"
                  />
                ))}
              </div>
            </div>

            <button className="btn-descargar-pdf" onClick={generarPDF}>
              Descargar PDF
            </button>

            <button
              className="btn-cerrar-modal"
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
