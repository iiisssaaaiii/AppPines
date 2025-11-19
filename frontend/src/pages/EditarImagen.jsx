import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/ImagenFormulario.css";
import ModalTags from "../components/gestion-imagenes/nuevaImagen/ModalTags";

import {
  obtenerImagenes,
  actualizarImagen,
  obtenerTags as obtenerTagsService,
} from "../services/imagenesService";

import placeholderImg from "../assets/icons/placeholder-image.png";

const PLACEHOLDER_PREVIEW = placeholderImg;

export default function EditarImagen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [nombreImagen, setNombreImagen] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(PLACEHOLDER_PREVIEW);

  const [selectedTags, setSelectedTags] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function init() {
      const imagenes = await obtenerImagenes();
      const img = imagenes.find((i) => i.id_imagen === Number(id));

      if (!img) {
        alert("Imagen no encontrada");
        navigate("/gestion-imagenes");
        return;
      }

      setNombreImagen(img.nombre);
      setPreviewUrl(img.url);
      setSelectedTags(img.tags || []);

      const tagsBD = await obtenerTagsService();
      setAllTags(tagsBD);
    }

    init();
  }, [id, navigate]);

  const handleFileClick = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setArchivo(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleGuardar = async () => {
    if (!nombreImagen.trim()) {
      alert("Escribe un nombre");
      return;
    }

    const resp = await actualizarImagen(Number(id), {
      nombre: nombreImagen.trim(),
      archivo,
      tags: selectedTags,
    });

    if (resp.success) {
      alert("Imagen actualizada");
      navigate("/gestion-imagenes");
    } else {
      alert("Error guardando");
    }
  };

  return (
    <div className="imgf-page">

      {/* REGRESAR */}
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

      {/* CONTENEDOR */}
      <div className="imgf-container">
        <div className="imgf-title">Editar imagen</div>

        <div className="imgf-row">
          
          {/* IZQUIERDA */}
          <div className="imgf-left">
            <label>Nombre de la imagen</label>
            <input
              type="text"
              className="imgf-input"
              value={nombreImagen}
              onChange={(e) => setNombreImagen(e.target.value)}
            />

            <label style={{ marginTop: 15 }}>Etiquetas</label>
            <div className="imgf-tags-row">
              {selectedTags.map((tag) => (
                <span
                  key={tag.label}
                  className="imgf-tag-chip"
                  style={{ backgroundColor: tag.color }}
                >
                  {tag.label}
                </span>
              ))}

              <button className="imgf-add-tag" onClick={() => setIsModalOpen(true)}>+</button>
            </div>
          </div>

          {/* DERECHA */}
          <div className="imgf-right">
            <div
              className="imgf-preview"
              style={{ backgroundImage: `url(${previewUrl})` }}
            ></div>

            <button className="imgf-upload-btn" onClick={handleFileClick}>
              Cambiar imagen
            </button>

            <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: "none" }} />
          </div>
        </div>

        {/* BOTONES */}
        <div className="imgf-footer">
          <button className="imgf-btn imgf-btn-cancel" onClick={() => navigate("/gestion-imagenes")}>
            CANCELAR
          </button>

          <button className="imgf-btn imgf-btn-save" onClick={handleGuardar}>
            GUARDAR
          </button>
        </div>
      </div>

      {/* MODAL */}
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