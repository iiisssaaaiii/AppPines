import React, { useState } from 'react';

const EtiquetasInput = ({ etiquetas, setEtiquetas }) => {
  const [nuevaEtiqueta, setNuevaEtiqueta] = useState('');

  const agregarEtiqueta = () => {
    if (nuevaEtiqueta.trim() && !etiquetas.includes(nuevaEtiqueta.trim())) {
      setEtiquetas([...etiquetas, nuevaEtiqueta.trim()]);
      setNuevaEtiqueta('');
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
    <div className="etiquetas-container">
      {/* Input para agregar etiquetas */}
      <div className="etiqueta-input-group">
        <input 
          type="text"
          value={nuevaEtiqueta}
          onChange={(e) => setNuevaEtiqueta(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Escribe una etiqueta..."
          className="etiqueta-input"
        />
        <button 
          type="button" 
          onClick={agregarEtiqueta}
          className="btn-agregar-etiqueta"
        >
          +
        </button>
      </div>

      {/* Lista de etiquetas existentes */}
      <div className="etiquetas-list">
        {etiquetas.map((etiqueta, index) => (
          <div key={index} className="etiqueta-item">
            <span className="etiqueta-text">- {etiqueta}</span>
            <button 
              onClick={() => eliminarEtiqueta(index)}
              className="btn-eliminar-etiqueta"
            >
              ×
            </button>
          </div>
        ))}
        
        {etiquetas.length === 0 && (
          <div className="etiqueta-vacia">- ETIQUETAS</div>
        )}
      </div>
    </div>
  );
};

export default EtiquetasInput;