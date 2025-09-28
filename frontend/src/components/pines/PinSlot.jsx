import React from "react";
import "../../styles/ProduccionPines.css";

const PinSlot = ({ image, onAdd, onClickImage }) => {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onAdd(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="pin-slot">
      {image ? (
        <img
          src={image}
          alt="pin"
          className="pin-img"
          onClick={onClickImage} // 🔹 Ahora abre modal
        />
      ) : (
        <>
          <label className="btn-add">
            +
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
          </label>
        </>
      )}
    </div>
  );
};

export default PinSlot;
