import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/GestionImagenes.css";
import { obtenerImagenes, eliminarImagen } from "../services/imagenesService";

const PLACEHOLDER_IMG = "https://i.imgur.com/EPhuF5p.png";

// --------------------------------------------------
// Función para construir la URL real de la imagen
// --------------------------------------------------
function construirUrlImagen(img) {
  if (img.url) return img.url; 
  if (img.ruta && img.archivo) return `${img.ruta}${img.archivo}`;
  if (img.archivo) return `/uploads/${img.archivo}`;
  return PLACEHOLDER_IMG;
}

// --------------------------------------------------
// Extraer tags correctamente del objeto que devuelve el backend
// --------------------------------------------------
function extraerTags(img) {
  // Formato correcto: tags = [{label, color}, ...]
  if (Array.isArray(img.tags)) return img.tags;

  // Compatibilidad con sistemas viejos (no aplica pero por si acaso)
  if (img.tags_csv) {
    return img.tags_csv
      .split(",")
      .map((t) => ({
        label: t.trim(),
        color: "#243b53",
      }))
      .filter((t) => t.label !== "");
  }

  return [];
}

// --------------------------------------------------
// Componente principal
// --------------------------------------------------
export default function GestionImagenes() {
  const [imagenes, setImagenes] = useState([]);
  const [tagFiltro, setTagFiltro] = useState("todos");
  const navigate = useNavigate();

  // --------------------------------------------------
  // Cargar imágenes desde backend
  // --------------------------------------------------
  const cargarImagenes = async () => {
    try {
      const data = await obtenerImagenes();
      console.log("IMÁGENES RECIBIDAS DESDE BACKEND:", data);
      setImagenes(data);
    } catch (error) {
      console.error("Error al cargar imágenes:", error);
    }
  };

  useEffect(() => {
    cargarImagenes();
  }, []);

  // --------------------------------------------------
  // Obtener lista única de etiquetas para el filtro
  // --------------------------------------------------
  const tagsDisponibles = useMemo(() => {
    const set = new Set();
    imagenes.forEach((img) => {
      extraerTags(img).forEach((tag) => set.add(tag.label));
    });
    return Array.from(set);
  }, [imagenes]);

  console.log("Imagenes recibidas:", imagenes);

  // --------------------------------------------------
  // Filtrar imágenes por etiqueta seleccionada
  // --------------------------------------------------
  const listaFiltrada = useMemo(() => {
    if (tagFiltro === "todos") return imagenes;

    return imagenes.filter((img) =>
      extraerTags(img).some((tag) => tag.label === tagFiltro)
    );
  }, [imagenes, tagFiltro]);

  // --------------------------------------------------
  // Eliminar imagen
  // --------------------------------------------------
  const handleEliminar = async (id_imagen) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta imagen?")) return;
    try {
      await eliminarImagen(id_imagen);
      await cargarImagenes();
    } catch (error) {
      console.error("Error eliminando imagen:", error);
    }
  };

  // --------------------------------------------------
  // Render
  // --------------------------------------------------
  return (
    <div className="gestion-page">
      <div className="gestion-container">
        <h2>IMÁGENES GUARDADAS</h2>

        <div className="top-actions">
          {/* FILTRO */}
          <div>
            <label className="label-filter">FILTRAR POR:</label>

            <div className="select-wrapper">
              <select
                value={tagFiltro}
                onChange={(e) => setTagFiltro(e.target.value)}
              >
                <option value="todos">-- TODAS LAS ETIQUETAS --</option>

                {tagsDisponibles.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* BOTÓN AGREGAR */}
          <button
            className="btn-agregar"
            onClick={() => navigate("/nueva-imagen")}
          >
            AGREGAR
          </button>
        </div>

        {/* GRID */}
        {listaFiltrada.length === 0 ? (
          <p className="empty-state">
            No hay imágenes guardadas todavía o no hay resultados para este filtro.
          </p>
        ) : (
          <div className="grid">
            {listaFiltrada.map((img) => {
              const url = construirUrlImagen(img);
              const tags = extraerTags(img);

              return (
                <div className="card" key={img.id_imagen}>
                  {/* PREVIEW */}
                  <div
                    className="image-preview-gi"
                    style={{ backgroundImage: `url(${url})` }}
                  />

                  {/* NOMBRE */}
                  <p>Nombre: {img.nombre}</p>

                  {/* TAGS */}
                  {tags.length > 0 && (
                    <div className="tag-container">
                      {tags.map((tag) => (
                        <span
                          key={tag.label}
                          className="tag"
                          style={{ backgroundColor: tag.color }}
                        >
                          {tag.label}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* BOTONES */}
                  <button
                    className="btn-modif"
                    onClick={() => navigate(`/editar-imagen/${img.id_imagen}`)}
                  >
                    Modificar
                  </button>

                  <button
                    className="btn-elim"
                    onClick={() => handleEliminar(img.id_imagen)}
                  >
                    Eliminar
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
