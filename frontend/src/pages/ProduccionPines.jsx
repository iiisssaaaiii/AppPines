import React, { useState, useRef } from "react";
import PinSlot from "../components/pines/PinSlot";
import ImageOptionsModal from "../components/pines/ImageOptionsModal";
import "../styles/ProduccionPines.css";

const ProduccionPines = () => {
  const [pines, setPines] = useState(Array(12).fill(null));
  const fileInputRef = useRef(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddImage = (index, imageUrl) => {
    const nuevosPines = [...pines];
    nuevosPines[index] = imageUrl;
    setPines(nuevosPines);
  };

  const handleRemoveImage = (index) => {
    const nuevosPines = [...pines];
    nuevosPines[index] = null;
    setPines(nuevosPines);
    setIsModalOpen(false);
  };

  const handleClear = () => {
    setPines(Array(12).fill(null));
  };

  const handlePrint = () => {
    window.print();
  };

  // Llenar solo los slots vacíos con la imagen cargada
  const handleFileChange = (e, indexToReplace = null) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (indexToReplace !== null) {
          handleAddImage(indexToReplace, reader.result); // Reemplaza uno
        } else {
          // Cargar en los vacíos
          const nuevaImagen = reader.result;
          const nuevosPines = pines.map((pin) => (pin ? pin : nuevaImagen));
          setPines(nuevosPines);
        }
        setIsModalOpen(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const openModal = (index) => {
    setSelectedIndex(index);
    setIsModalOpen(true);
  };

  return (
    <div className="produccion-container">
      <h2 className="titulo">CREAR PINES</h2>

      <div className="botones-tamanos">
        <button className="btn-tamano">PEQUEÑOS</button>
        <button className="btn-tamano">GRANDES</button>

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
          onChange={handleFileChange}
        />
      </div>

      <p className="subtitulo">ELEGIR EL TAMAÑO DE LOS PINES</p>

      <div className="grid-pines">
        {pines.map((pin, index) => (
          <PinSlot
            key={index}
            image={pin}
            onAdd={(url) => handleAddImage(index, url)}
            onClickImage={() => openModal(index)} // 🔹 Nuevo: click en imagen abre modal
          />
        ))}
      </div>

      <div className="acciones">
        <button className="btn-limpiar" onClick={handleClear}>
          LIMPIAR
        </button>
        <button className="btn-imprimir" onClick={handlePrint}>
          IMPRIMIR
        </button>
      </div>

      {/* Modal de opciones */}
      <ImageOptionsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onEdit={() => fileInputRef.current.click()}
        onDelete={() => handleRemoveImage(selectedIndex)}
      />

      {/* Input oculto para reemplazo individual */}
      <input
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        ref={fileInputRef}
        onChange={(e) => handleFileChange(e, selectedIndex)}
      />
    </div>
  );
};

export default ProduccionPines;
