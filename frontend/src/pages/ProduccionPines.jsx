// src/pages/ProduccionPines.jsx
import React, { useState, useRef } from "react";
import PinSlot from "../components/pines/PinSlot";
import ImageOptionsModal from "../components/pines/ImageOptionsModal";
import { imprimirPines, subirImagen } from "../services/produccionService"; // 👈 importar ambos servicios
import "../styles/ProduccionPines.css";

const ProduccionPines = () => {
  const [pines, setPines] = useState(Array(12).fill(null));
  const [tamano, setTamano] = useState("pequeno");
  const fileInputRef = useRef(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Subir archivo y obtener la URL del backend
  const handleFileUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append("imagen", file);

      const response = await subirImagen(formData); // 👈 nuevo servicio
      const urlSubida = response.url; // ej: http://localhost:4000/uploads/imagen.png

      // Reemplazar slots vacíos con la URL de la imagen subida
      const nuevosPines = pines.map((pin) => (pin ? pin : urlSubida));
      setPines(nuevosPines);
    } catch (error) {
      console.error("Error subiendo imagen:", error);
      alert("❌ No se pudo subir la imagen");
    }
  };

  const handlePrint = async () => {
    const cantidad = pines.filter((p) => p !== null).length;

    if (cantidad === 0) {
      alert("❌ Debes cargar al menos una imagen");
      return;
    }

    try {
      const url_imagen = pines.find((p) => p !== null);

      const result = await imprimirPines({
        url_imagen,
        etiquetas: "default",
        tamano,
        cantidad,
        id_usuario: 1, // más adelante dinámico
      });

      alert("✅ " + result.mensaje);
    } catch (error) {
      console.error("Error guardando producción:", error);
      alert("❌ Error guardando producción: " + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div className="produccion-container">
      <h2 className="titulo">CREAR PINES</h2>

      <div className="botones-tamanos">
        <button className="btn-tamano" onClick={() => setTamano("pequeno")}>
          PEQUEÑOS
        </button>
        <button className="btn-tamano" onClick={() => setTamano("grande")}>
          GRANDES
        </button>

        <button
          className="btn-cargar"
          onClick={() => fileInputRef.current.click()}
        >
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

      <div className="grid-pines">
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
              setIsModalOpen(true);
            }}
          />
        ))}
      </div>

      <div className="acciones">
        <button className="btn-limpiar" onClick={() => setPines(Array(12).fill(null))}>
          LIMPIAR
        </button>
        <button className="btn-imprimir" onClick={handlePrint}>
          IMPRIMIR
        </button>
      </div>

      <ImageOptionsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onEdit={() => fileInputRef.current.click()}
        onDelete={() => {
          const nuevosPines = [...pines];
          nuevosPines[selectedIndex] = null;
          setPines(nuevosPines);
          setIsModalOpen(false);
        }}
      />
    </div>
  );
};

export default ProduccionPines;
