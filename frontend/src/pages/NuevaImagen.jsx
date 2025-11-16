import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/NuevaImagen.css";
import ModalTags from "../components/gestion-imagenes/nuevaImagen/ModalTags";
import {
  subirImagen,
  obtenerTags as obtenerTagsService,
} from "../services/imagenesService";
import placeholderImg from "../assets/icons/placeholder-image.png";

const PLACEHOLDER_PREVIEW = placeholderImg;

export default function NuevaImagen() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [nombreImagen, setNombreImagen] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(PLACEHOLDER_PREVIEW);
  const [fileInfo, setFileInfo] = useState({
    nombre: "—",
    tamano: "—",
    tipo: "—",
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Todas las tags disponibles (desde BD)
  const [allTags, setAllTags] = useState([]);

  // Tags seleccionadas para esta imagen
  const [selectedTags, setSelectedTags] = useState([]);

  // Cargar tags desde backend al montar
  useEffect(() => {
    const cargarTags = async () => {
      try {
        const tagsBD = await obtenerTagsService();
        // tagsBD viene como [{id_tag, label, color}, ...]
        // Lo usamos tal cual para el modal
        setAllTags(tagsBD);
      } catch (err) {
        console.error("Error cargando tags:", err);
      }
    };

    cargarTags();
  }, []);

  const handleFileClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setArchivo(file);

    // Preview
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Info
    const sizeMB = file.size / (1024 * 1024);
    setFileInfo({
      nombre: file.name,
      tamano: `${sizeMB.toFixed(2)} MB`,
      tipo: file.type || "—",
    });

    // Si el nombre está vacío, proponemos el nombre sin extensión
    if (!nombreImagen) {
      const nombreSinExt = file.name.replace(/\.[^/.]+$/, "");
      setNombreImagen(nombreSinExt);
    }
  };

  const handleCancelar = () => {
    navigate("/gestion-imagenes");
  };

  const handleAgregar = async () => {
    if (!archivo) {
      alert("Selecciona una imagen antes de continuar");
      return;
    }

    if (!nombreImagen.trim()) {
      alert("Ingresa un nombre para la imagen");
      return;
    }

    try {
      const resp = await subirImagen({
        nombre: nombreImagen.trim(),
        archivo,
        tags: selectedTags, // [{label,color}, ...]
      });

      if (resp.success) {
        alert("Imagen guardada correctamente 🎉");
        navigate("/gestion-imagenes");
      } else {
        alert("No se pudo guardar la imagen.");
      }
    } catch (error) {
      console.error("Error subiendo imagen:", error);
      alert("Ocurrió un error al subir la imagen.");
    }
    
    console.log("ENVIANDO TAGS:", selectedTags);
  };

  return (
    <div className="add-image-page">
      {/* Botón regresar */}
      <div
        className="back-container"
        onClick={() => navigate("/gestion-imagenes")}
      >
        <div className="back-circle">
          <svg viewBox="0 0 24 24">
            <path d="M15 6l-6 6 6 6"></path>
          </svg>
        </div>
        <div className="back-text">Regresar</div>
      </div>

      <div className="add-image-container">
        <div className="title">Agregar nueva imagen</div>

        <div className="row">
          {/* IZQUIERDA */}
          <div className="left-section">
            <label>Nombre de la imagen</label>
            <input
              type="text"
              className="input-text"
              placeholder="Ingresa el nombre de la imagen"
              value={nombreImagen}
              onChange={(e) => setNombreImagen(e.target.value)}
            />

            <div className="tags">
              <label style={{ marginTop: 15 }}>Etiquetas</label>
              <div className="tags-row">
                {selectedTags.map((tag) => (
                  <span
                    key={tag.label}
                    className="tag-chip"
                    style={{ backgroundColor: tag.color }}
                  >
                    {tag.label}
                  </span>
                ))}

                <button
                  type="button"
                  className="add-tag-main"
                  onClick={() => setIsModalOpen(true)}
                >
                  +
                </button>
              </div>
            </div>

            <div className="info">
              <div className="info-title">Información de la imagen:</div>
              <div className="info-item">
                <strong>Nombre:</strong> {fileInfo.nombre}
              </div>
              <div className="info-item">
                <strong>Tamaño:</strong> {fileInfo.tamano}
              </div>
              <div className="info-item">
                <strong>Tipo:</strong> {fileInfo.tipo}
              </div>
            </div>
          </div>

          {/* DERECHA */}
          <div className="right-section">
            <div
              className={
                previewUrl && previewUrl !== PLACEHOLDER_PREVIEW
                  ? "image-preview has-image"
                  : "image-preview"
              }
              style={
                previewUrl
                  ? { backgroundImage: `url(${previewUrl})` }
                  : undefined
              }
            ></div>

            <button
              type="button"
              className="upload-btn"
              onClick={handleFileClick}
            >
              Subir foto
            </button>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </div>
        </div>

        <div className="footer-buttons">
          <button
            type="button"
            className="imgf-btn imgf-btn-cancel"
            onClick={handleCancelar}
          >
            CANCELAR
          </button>
          <button
            type="button"
            className="imgf-btn imgf-btn-save"
            onClick={handleAgregar}
          >
            AGREGAR
          </button>
        </div>
      </div>

      {/* MODAL DE ETIQUETAS */}
      <ModalTags
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedTags={selectedTags}
        allTags={allTags}
        onSave={(tags) => {
          setSelectedTags(tags);
          setIsModalOpen(false);
        }}
      />
    </div>
  );
}
