import React, { useEffect, useRef, useState } from "react";
import "../../../styles/NuevaImagen.css";

const DEFAULT_COLOR = "#243b53";

export default function ModalTags({
  open,
  onClose,
  selectedTags,
  allTags,
  onSave,
}) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const [others, setOthers] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [currentColor, setCurrentColor] = useState(DEFAULT_COLOR);

  const [showPopover, setShowPopover] = useState(false);
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 });

  const colorInputRef = useRef(null);

  const paletteColors = [
    "#3498db",
    "#2ecc71",
    "#e74c3c",
    "#9b59b6",
    "#f1c40f",
    "#e67e22",
    "#1abc9c",
    "#34495e",
  ];

  useEffect(() => {
    if (open) {
      setSearch("");
      setNewTag("");
      setCurrentColor(DEFAULT_COLOR);
      setShowPopover(false);

      const safeSelected = Array.isArray(selectedTags) ? selectedTags : [];
      const safeAll = Array.isArray(allTags) ? allTags : [];

      const selectedSet = new Set(
        safeSelected
          .filter((t) => t && t.label) // quitamos nulls
          .map((t) => t.label)
      );

      setSelected(
        safeSelected.filter((t) => t && t.label) // limpiamos
      );

      const otherList = safeAll.filter(
        (t) => t && t.label && !selectedSet.has(t.label)
      );
      setOthers(otherList);
    }
  }, [open, selectedTags, allTags]);

  // 🔍 función de filtrado a prueba de nulls
  const filtrarLista = (lista) => {
    const textoBusqueda = (search || "").toLowerCase();

    if (!Array.isArray(lista)) return [];

    return lista
      .filter((t) => t && (t.label || t.nombre)) // quitamos nulls
      .filter((tag) => {
        const nombre = (tag.label || tag.nombre || "").toLowerCase();
        return nombre.includes(textoBusqueda);
      });
  };

  const agregarEtiqueta = () => {
    if (!newTag.trim()) return;

    const nombreNuevo = newTag.trim().toLowerCase();

    const existe =
      selected.some(
        (t) => (t.label || "").toLowerCase() === nombreNuevo
      ) ||
      others.some((t) => (t.label || "").toLowerCase() === nombreNuevo);

    if (existe) {
      alert("Ya existe una etiqueta con ese nombre");
      return;
    }

    const nueva = {
      label: newTag.trim(),
      color: currentColor || DEFAULT_COLOR,
    };

    setSelected([...selected, nueva]);
    setNewTag("");
  };

  const moverASeleccionadas = (tag) => {
    setOthers(others.filter((t) => t && t.label !== tag.label));
    setSelected([...selected, tag]);
  };

  const moverAOtras = (tag) => {
    setSelected(selected.filter((t) => t && t.label !== tag.label));
    setOthers([...others, tag]);
  };

  const openPopover = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setPopoverPos({
      top: rect.bottom + 8,
      left: rect.left,
    });
    setShowPopover(true);
  };

  const selectPaletteColor = (color) => {
    setCurrentColor(color);
    setShowPopover(false);
  };

  const openCustomColor = () => {
    if (colorInputRef.current) {
      colorInputRef.current.click();
    }
  };

  const handleCustomColorChange = (e) => {
    const val = e.target.value;
    if (val) setCurrentColor(val);
  };

  if (!open) return null;

  const seleccionadasFiltradas = filtrarLista(selected);
  const otrasFiltradas = filtrarLista(others);

  return (
    <div className="modal-bg">
      <div className="modal-tag">
        {/* HEADER */}
        <div className="modal-header">
          <strong>Etiquetas</strong>
          <span className="modal-close" onClick={onClose}>
            ✕
          </span>
        </div>

        {/* BUSCADOR */}
        <div className="search-wrapper">
          <input
            type="text"
            className="search-box"
            placeholder="🔍  Buscar etiquetas"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search.length > 0 && (
            <button className="search-clear" onClick={() => setSearch("")}>
              ×
            </button>
          )}
        </div>

        {/* AGREGAR ETIQUETA NUEVA */}
        <div className="tag-add-box">
          <div className="tag-add-edit">
            <span className="tag-add-plus">+</span>
            <input
              type="text"
              className="tag-add-input"
              placeholder="Nombre de la etiqueta"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && agregarEtiqueta()}
            />
            <button
              type="button"
              className="color-trigger"
              style={{ backgroundColor: currentColor }}
              onClick={openPopover}
            />
          </div>
        </div>

        {/* SELECCIONADAS */}
        <div className="modal-section-title">Seleccionadas</div>
        <hr className="hr-line" />

        <div id="modal-selected">
          {seleccionadasFiltradas.map((tag) => (
            <span
              key={tag.label}
              className="tag-option"
              style={{ backgroundColor: tag.color || DEFAULT_COLOR }}
              onClick={() => moverAOtras(tag)}
            >
              {tag.label}
            </span>
          ))}
          {seleccionadasFiltradas.length === 0 && (
            <p style={{ fontSize: 14, color: "#777" }}>Sin etiquetas</p>
          )}
        </div>

        {/* OTRAS */}
        <div className="modal-section-title" style={{ marginTop: 20 }}>
          Otras etiquetas
        </div>
        <hr className="hr-line" />

        <div id="modal-other">
          {otrasFiltradas.map((tag) => (
            <span
              key={tag.label}
              className="tag-option"
              style={{ backgroundColor: tag.color || DEFAULT_COLOR }}
              onClick={() => moverASeleccionadas(tag)}
            >
              {tag.label}
            </span>
          ))}
          {otrasFiltradas.length === 0 && (
            <p style={{ fontSize: 14, color: "#777" }}>
              No hay más etiquetas
            </p>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-save" onClick={() => onSave(selected)}>
            Guardar
          </button>
        </div>
      </div>

      {/* POPOVER DE COLORES */}
      {showPopover && (
        <div
          className="color-popover"
          style={{
            top: popoverPos.top,
            left: popoverPos.left,
          }}
        >
          <div className="color-popover-header">
            <span>Color</span>
            <span
              className="color-popover-close"
              onClick={() => setShowPopover(false)}
            >
              ×
            </span>
          </div>
          <div className="color-grid">
            {paletteColors.map((color) => (
              <div
                key={color}
                className={
                  "color-circle" +
                  (color.toLowerCase() === currentColor.toLowerCase()
                    ? " selected"
                    : "")
                }
                style={{ backgroundColor: color }}
                onClick={() => selectPaletteColor(color)}
              />
            ))}

            <div
              className="color-circle color-circle-add"
              onClick={openCustomColor}
            >
              +
            </div>
          </div>

          <input
            type="color"
            ref={colorInputRef}
            style={{ display: "none" }}
            onChange={handleCustomColorChange}
          />
        </div>
      )}
    </div>
  );
}
