import React, { useState, useRef } from "react";
import PinSlot from "../components/pines/PinSlot";
import ImageOptionsModal from "../components/pines/ImageOptionsModal";
import ConfirmationModal from "../components/pines/ConfirmationModal";
import { subirImagen, procesarProduccion, obtenerImagenesDisponibles, imprimirPines } from "../services/produccionService";
import SelectorImagenModal from "../components/pines/SelectorImagenModal";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "../styles/ProduccionPines.css";

const ProduccionPines = () => {
  const [tamano, setTamano] = useState("pequeno");
  const getInitialPines = (size) =>
    size === "pequeno" ? Array(35).fill(null) : Array(12).fill(null);

  const [pines, setPines] = useState(getInitialPines("pequeno")); // guarda URLs
  const [imagenesMap, setImagenesMap] = useState({}); // url -> id_imagen

  // 👇 nuevos
  const [imagenesDisponibles, setImagenesDisponibles] = useState([]);
  const [cargandoImagenes, setCargandoImagenes] = useState(false);
  const [mostrarSelectorImagen, setMostrarSelectorImagen] = useState(false);
  const [slotSeleccionado, setSlotSeleccionado] = useState(null);

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
      const { url, id_imagen } = response;

      if (!url || !id_imagen) {
        alert("❌ Respuesta inesperada al subir la imagen");
        return;
      }

      // map url -> id_imagen (para producción)
      setImagenesMap((prev) => ({
        ...prev,
        [url]: id_imagen,
      }));

      // si estamos en modo "llenar todos los vacíos" (botón CARGAR IMAGEN)
      if (slotSeleccionado == null) {
        const nuevosPines = pines.map((pin) => (pin ? pin : url));
        setPines(nuevosPines);
      } else {
        // si venimos desde el selector para un slot específico
        const nuevosPines = [...pines];
        nuevosPines[slotSeleccionado] = url;
        setPines(nuevosPines);
      }

      // agregarla también a la galería en memoria
      setImagenesDisponibles((prev) => [
        ...prev,
        {
          id_imagen,
          nombre: file.name,
          ruta: "/uploads/",
          archivo: url.split("/").pop(),
          url_publica: url,
        },
      ]);

      setMostrarSelectorImagen(false);
      setSlotSeleccionado(null);
    } catch (error) {
      console.error("Error subiendo imagen:", error);
      alert("❌ No se pudo subir la imagen");
    }
  };

  const abrirSelectorImagen = async (index) => {
    setSlotSeleccionado(index);

    if (imagenesDisponibles.length === 0) {
      try {
        setCargandoImagenes(true);
        const data = await obtenerImagenesDisponibles();
        setImagenesDisponibles(data);
      } catch (error) {
        console.error("Error obteniendo imágenes:", error);
        alert("❌ No se pudieron cargar las imágenes disponibles.");
      } finally {
        setCargandoImagenes(false);
      }
    }

    setMostrarSelectorImagen(true);
  };

  const manejarSeleccionImagen = (img) => {
    if (!img) return;

    const url =
      img.url_publica || `http://localhost:4000${img.ruta}${img.archivo}`;

    if (slotSeleccionado == null) {
      // Modo "CARGAR IMAGEN": rellenar todos los huecos vacíos
      const nuevosPines = [...pines];
      for (let i = 0; i < nuevosPines.length; i++) {
        if (!nuevosPines[i]) {
          nuevosPines[i] = url;
        }
      }
      setPines(nuevosPines);
    } else {
      // Modo click en un slot específico
      const nuevosPines = [...pines];
      nuevosPines[slotSeleccionado] = url;
      setPines(nuevosPines);
    }

    // mapear url -> id_imagen para producción
    setImagenesMap((prev) => ({
      ...prev,
      [url]: img.id_imagen,
    }));

    setMostrarSelectorImagen(false);
    setSlotSeleccionado(null);
  };

  const handlePrint = async () => {
    const cantidad = pines.filter((p) => p !== null).length;
    if (cantidad === 0) {
      alert("❌ Debes cargar al menos una imagen");
      return;
    }

    const produccionData = await procesarProduccionBackend();
    if (!produccionData) return; // si falló, no imprimimos

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

  // función reutilizable: arma slots y llama al backend
  const procesarProduccionBackend = async () => {
    const cantidad = pines.filter((p) => p !== null).length;
    if (cantidad === 0) {
      alert("❌ Debes cargar al menos una imagen antes de producir");
      return null;
    }

    const slots = [];
    pines.forEach((pinUrl, index) => {
      if (!pinUrl) return;
      const id_imagen = imagenesMap[pinUrl];
      if (!id_imagen) return;
      slots.push({ id_imagen, posicion: index });
    });

    if (slots.length === 0) {
      alert("❌ No se pudieron asociar imágenes a la producción");
      return null;
    }

    try {
      const data = await procesarProduccion({
        tamano,
        slots,
        idUsuario: 1, // por ahora fijo; luego puedes usar el usuario logueado
      });
      console.log("Producción registrada:", data);
      return data;
    } catch (error) {
      console.error("Error procesando producción:", error);
      alert("❌ Ocurrió un error al registrar la producción.");
      return null;
    }
  };

  const confirmExportPdf = async () => {
    const input = printRef.current;
    if (!input) {
      alert("No se encontró el área para exportar");
      return;
    }

    // 1️⃣ Registrar producción en backend
    const produccionData = await procesarProduccionBackend();
    if (!produccionData) return;

    // 2️⃣ Generar PDF
    try {
      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("l", "mm", "letter");
      const pdfWidth = 279.4;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("pines.pdf");

      setIsConfirmationModalOpen(false);
      alert("✅ Producción registrada y PDF generado correctamente.");
    } catch (error) {
      console.error("Error generando PDF:", error);
      alert("❌ Ocurrió un error al generar el PDF.");
    }
  };

  const handleGuardarPlantilla = async () => {
    const produccionData = await procesarProduccionBackend();
    if (!produccionData) return;
    alert("✅ Plantilla guardada y producción registrada correctamente.");
  };

  const changeTamano = (newTamano) => {
    setTamano(newTamano);
    setPines(getInitialPines(newTamano));
    setImagenesMap({});
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
        <button
          className="btn-cargar"
          onClick={() => abrirSelectorImagen(null)} // modo "llenar huecos"
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

      <div className="hoja-carta" ref={printRef}>
        <div className={gridClassName}>
          {pines.map((pin, index) => (
            <PinSlot
              key={index}
              image={pin}
              onAdd={() => abrirSelectorImagen(index)} // si PinSlot usa onAdd para "añadir"
              onClickImage={() => abrirSelectorImagen(index)} // si hace clic en la imagen
            />
          ))}
        </div>
      </div>

      <div className="acciones">
        <button
          className="btn-limpiar"
          onClick={() => setPines(getInitialPines(tamano))}
        >
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
        message="¿Estás seguro de que quieres exportar este diseño a PDF y registrar la producción?"
      />

      <SelectorImagenModal
        isOpen={mostrarSelectorImagen}
        onClose={() => {
          setMostrarSelectorImagen(false);
          setSlotSeleccionado(null);
        }}
        imagenes={imagenesDisponibles}
        cargando={cargandoImagenes}
        onSelect={manejarSeleccionImagen}
        onSubirNueva={() => fileInputRef.current.click()}
      />
    </div>
  );
};

export default ProduccionPines;
