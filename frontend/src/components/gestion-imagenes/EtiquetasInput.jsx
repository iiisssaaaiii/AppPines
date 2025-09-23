import React, { useState } from 'react';

const EtiquetasInput = ({ etiquetas, setEtiquetas }) => {
  const [inputValue, setInputValue] = useState('');

  const agregarEtiqueta = () => {
    if (inputValue.trim() && !etiquetas.includes(inputValue.trim())) {
      setEtiquetas([...etiquetas, inputValue.trim()]);
      setInputValue('');
    }
  };

  const eliminarEtiqueta = (index) => {
    setEtiquetas(etiquetas.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      agregarEtiqueta();
    }
  };

  return (
    <div className="etiquetas-input-container">
      {/* Input para nueva etiqueta */}
      <div className="etiqueta-input-group">
        <input 
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Escribe una etiqueta..."
        />
        <button type="button" onClick={agregarEtiqueta}>+</button>
      </div>

      {/* Lista de etiquetas */}
      <div className="etiquetas-list">
        {etiquetas.map((etiqueta, index) => (
          <span key={index} className="etiqueta-tag">
            {etiqueta}
            <button onClick={() => eliminarEtiqueta(index)}>×</button>
          </span>
        ))}
      </div>
    </div>
  );
};

export default EtiquetasInput;