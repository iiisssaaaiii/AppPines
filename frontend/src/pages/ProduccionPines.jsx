import React, { useState, useRef } from "react";
import PinSlot from "../components/pines/PinSlot";
import ImageOptionsModal from "../components/pines/ImageOptionsModal";
import ConfirmationModal from "../components/pines/ConfirmationModal";
import { subirImagen } from "../services/produccionService";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "../styles/ProduccionPines.css";

const ProduccionPines = () => {
  const [tamano, setTamano] = useState("pequeno");
  const getInitialPines = (size) =>
    size === "pequeno" ? Array(35).fill(null) : Array(12).fill(null);

  const [pines, setPines] = useState(getInitialPines("pequeno"));
  const fileInputRef = useRef(null);
  const printRef = useRef();
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);

  const handleFileUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append("imagen", file);
      const response = await subirImagen(formData);
      const urlSubida = response.url;
      const nuevosPines = pines.map((pin) => (pin ? pin : urlSubida));
      setPines(nuevosPines);
    } catch (error) {
      console.error("Error subiendo imagen:", error);
      alert("❌ No se pudo subir la imagen");
    }
  };

  const handlePrint = () => {
    const cantidad = pines.filter((p) => p !== null).length;
    if (cantidad === 0) {
      alert("❌ Debes cargar al menos una imagen");
      return;
    }
    window.print();
  };

  const handleExportPdf = () => {
    const cantidad = pines.filter((p) => p !== null).length;
    if (cantidad === 0) {
      alert("❌ Debes cargar al menos una imagen");
      return;
    }
    setIsConfirmationModalOpen(true);
  };

  const confirmExportPdf = async () => {
  const input = printRef.current;
  if (!input) {
    alert("No se encontró el área para exportar");
    return;
  }

  try {
    const canvas = await html2canvas(input, {
      scale: 2,
      useCORS: true, // permite cargar imágenes externas
      backgroundColor: "#ffffff"
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("l", "mm", "letter");
    const pdfWidth = 279.4;
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("pines.pdf");

    setIsConfirmationModalOpen(false);
    alert("✅ PDF generado correctamente.");
  } catch (error) {
    console.error("Error generando PDF:", error);
    alert("❌ Ocurrió un error al generar el PDF.");
  }
};


  const handleGuardarPlantilla = async () => {
    console.log("🧩 Click detectado en GUARDAR PLANTILLA");
    const cantidad = pines.filter((p) => p !== null).length;
    const primeraImagen = pines.find((p) => p !== null);

    if (cantidad === 0 || !primeraImagen) {
      alert("❌ Debes tener al menos una imagen antes de guardar");
      return;
    }

    try {
      const respuesta = await fetch("http://localhost:4000/api/produccion/guardarPlantilla", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          etiquetas: "Diseño de pines",
          tamano,
          cantidad,
          url_imagen: primeraImagen,
          id_usuario: 1,
        }),
      });

      const data = await respuesta.json();
      alert(data.mensaje || "✅ Plantilla guardada correctamente.");
    } catch (error){
      console.error("Error al guardar plantilla: ", error)
    } 
  }

  const changeTamano = (newTamano) => {
    setTamano(newTamano);
    setPines(getInitialPines(newTamano));
  };

  const gridClassName =
    tamano === "pequeno" ? "grid-pines-pequeno" : "grid-pines-grande";

  return (
    <div className="produccion-container">
      <h2 className="titulo">CREAR PINES</h2>

      <div className="botones-tamanos">
        <button
          className={`btn-tamano ${tamano === "pequeno" ? "active" : ""}`}
          onClick={() => changeTamano("pequeno")}
        >
          PEQUEÑOS
        </button>
        <button
          className={`btn-tamano ${tamano === "grande" ? "active" : ""}`}
          onClick={() => changeTamano("grande")}
        >
          GRANDES
        </button>
        <button className="btn-cargar" onClick={() => fileInputRef.current.click()}>
          CARGAR IMAGEN
        </button>
        <input
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          ref={fileInputRef}
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) handleFileUpload(file);
          }}
        />
      </div>

      <p className="subtitulo">ELEGIR EL TAMAÑO DE LOS PINES</p>

      {/* RECTÁNGULO DEL TAMAÑO DE HOJA CARTA */}
      <div className="hoja-carta" ref={printRef}>
        <div className={gridClassName}>
          {pines.map((pin, index) => (
            <PinSlot
              key={index}
              image={pin}
              onAdd={(url) => {
                const nuevosPines = [...pines];
                nuevosPines[index] = url;
                setPines(nuevosPines);
              }}
              onClickImage={() => {
                setSelectedIndex(index);
                setIsOptionsModalOpen(true);
              }}
            />
          ))}
        </div>
      </div>

      <div className="acciones">
        <button className="btn-limpiar" onClick={() => setPines(getInitialPines(tamano))}>
          LIMPIAR
        </button>
        <button className="btn-imprimir" onClick={handlePrint}>
          IMPRIMIR
        </button>
        <button className="btn-exportar-pdf" onClick={handleExportPdf}>
          EXPORTAR PDF
        </button>
        <button
          className="btn btn-primary btn-full"
          onClick={handleGuardarPlantilla}
        >
          Guardar Plantilla
        </button>

      </div>

      <ImageOptionsModal
        isOpen={isOptionsModalOpen}
        onClose={() => setIsOptionsModalOpen(false)}
        onEdit={() => {
          fileInputRef.current.click();
          setIsOptionsModalOpen(false);
        }}
        onDelete={() => {
          const nuevosPines = [...pines];
          nuevosPines[selectedIndex] = null;
          setPines(nuevosPines);
          setIsOptionsModalOpen(false);
        }}
      />

      <ConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={() => setIsConfirmationModalOpen(false)}
        onConfirm={confirmExportPdf}
        message="¿Estás seguro de que quieres exportar este diseño a PDF?"
      />
    </div>
  );
};

export default ProduccionPines;
