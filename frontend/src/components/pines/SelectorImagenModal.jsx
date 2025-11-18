// src/components/pines/SelectorImagenModal.jsx
import React from "react";
import "../../styles/ProduccionPines.css";

const SelectorImagenModal = ({
  isOpen,
  onClose,
  imagenes,
  cargando,
  onSelect,
  onSubirNueva,
}) => {
  if (!isOpen) return null;

  return (
    <div className="si-modal-backdrop">
      <div className="si-modal">
        <header className="si-modal__header">
          <h3 className="si-modal__title">Seleccionar imagen</h3>
          <button
            type="button"
            className="si-modal__close-btn"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </header>

        <section className="si-modal__body">
          {cargando ? (
            <p className="si-modal__helper">Cargando imágenes...</p>
          ) : imagenes.length === 0 ? (
            <p className="si-modal__helper">
              No hay imágenes guardadas. Puedes subir una nueva.
            </p>
          ) : (
            <div className="si-modal__grid">
              {imagenes.map((img) => {
                const url =
                  img.url_publica ||
                  `http://localhost:4000${img.ruta}${img.archivo}`;

                return (
                  <button
                    key={img.id_imagen}
                    type="button"
                    className="si-img-item"
                    onClick={() => onSelect(img)}
                  >
                    <div className="si-img-item__thumb">
                      <img src={url} alt={img.nombre} />
                    </div>
                    <span className="si-img-item__name">{img.nombre}</span>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <footer className="si-modal__footer">
          <button
            type="button"
            className="si-modal__btn si-modal__btn--primary"
            onClick={onSubirNueva}
          >
            📤 Subir nueva imagen
          </button>
          <button
            type="button"
            className="si-modal__btn si-modal__btn--secondary"
            onClick={onClose}
          >
            Cancelar
          </button>
        </footer>
      </div>
    </div>
  );
};

export default SelectorImagenModal;