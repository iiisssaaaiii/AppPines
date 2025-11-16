import React, { useState, useEffect } from "react";
import "../styles/Inicio.css";
import logo from "../assets/icons/logo.png";
import imgImagenes from "../assets/icons/imagens.png";
import imgProduccion from "../assets/icons/produccionpines.png";
import imgInventario from "../assets/icons/inventario.png";
import imgReportes from "../assets/icons/reportes.png";
import imgCatalogo from "../assets/icons/catalogo.png";

const Inicio = () => {
  const [theme, setTheme] = useState("light");

  // 🔥 Afecta al <body>, no solo al div
  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <div className="inicio-body">
      <header className="inicio-header">
        <div className="logo-section">
          <img src={logo} alt="Logo PinesApp" />
          <h1>PinesApp - Panel de Administración</h1>
        </div>

        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === "light" ? "🌙" : "☀️"}
        </button>
      </header>

      <div className="welcome-container">
        <h2>¡Bienvenido!</h2>
        <p>Gestiona imágenes, producción, inventario y más desde un solo lugar.</p>
      </div>

      <div className="container">
        <a href="/gestion-imagenes" className="cardInicio">
          <img src={imgImagenes} alt="Gestión de Imágenes" />
          <h3>Gestión de Imágenes</h3>
          <p>Sube, edita y organiza las imágenes para los pines.</p>
        </a>

        <a href="/produccion" className="cardInicio">
          <img src={imgProduccion} alt="Producción de Pines" />
          <h3>Producción de Pines</h3>
          <p>Controla el proceso de producción y fabricación de los pines.</p>
        </a>

        <a href="/inventario" className="cardInicio">
          <img src={imgInventario} alt="Inventario" />
          <h3>Inventario</h3>
          <p>Gestiona el stock de pines y materiales.</p>
        </a>

        <a href="/reportes" className="cardInicio">
          <img src={imgReportes} alt="Reportes" />
          <h3>Reportes</h3>
          <p>Genera reportes de producción y ventas.</p>
        </a>

        <a href="/catalogo" className="cardInicio">
          <img src={imgCatalogo} alt="Catálogo" />
          <h3>Catálogo</h3>
          <p>Explora todos los diseños de pines disponibles.</p>
        </a>
      </div>
    </div>
  );
};

export default Inicio;
