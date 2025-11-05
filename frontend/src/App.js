// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import NuevaImagen from "./pages/NuevaImagen";
import ProduccionPines from "./pages/ProduccionPines"; 
import Navbar from "./components/Navbar";
import Inventario from "./pages/Inventario";
import Reportes from "./pages/Reportes";
import Catalogo from "./pages/Catalogo";


const Ventas = () => (
  <div className="modulo-page">
    <h1>💰 Ventas</h1>
    <p>Módulo en desarrollo - Próximamente</p>
  </div>
);

const Administracion = () => (
  <div className="modulo-page">
    <h1>⚙️ Administración</h1>
    <p>Módulo en desarrollo - Próximamente</p>
  </div>
);

function App() {
  return (
    <Router>
      <div className="App min-h-screen bg-white">
        {/* Navbar arriba */}
        <Navbar />

        {/* Contenido dinámico con Routes */}
        <main className="App-main p-6">
          <Routes>
            <Route path="/" element={<NuevaImagen />} />
            <Route path="/produccion" element={<ProduccionPines />} /> {/* ✅ */}
            <Route path="/inventario" element={<Inventario />} />
            <Route path="/ventas" element={<Ventas />} />
            <Route path="/reportes" element={<Reportes />} />
            <Route path="/administracion" element={<Administracion />} />
            <Route path="/catalogo" element={<Catalogo />} />

          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
