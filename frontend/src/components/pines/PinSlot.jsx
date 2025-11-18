import React from "react";
import "../../styles/ProduccionPines.css";

const PinSlot = ({ image, onAdd, onClickImage }) => {
  const handleClick = () => {
    if (image) {
      // Si ya hay imagen, usamos la acción de click sobre imagen
      if (onClickImage) onClickImage();
    } else {
      // Si está vacío, usamos la acción de agregar
      if (onAdd) onAdd();
    }
  };

  return (
    <button
      type="button"
      className="pin-slot"
      onClick={handleClick}
    >
      {image ? (
        <img
          src={image}
          alt="pin"
          className="pin-img"
        />
      ) : (
        <span className="pin-slot-plus">+</span>
      )}
    </button>
  );
};

export default PinSlot;
