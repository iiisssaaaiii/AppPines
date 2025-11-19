// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import "./App.css";

// Páginas
import Inicio from "./pages/Inicio";
import GestionImagenes from "./pages/GestionImagenes";
import NuevaImagen from "./pages/NuevaImagen";
import EditarImagen from "./pages/EditarImagen";
import ProduccionPines from "./pages/ProduccionPines";
import Inventario from "./pages/Inventario";
import Reportes from "./pages/Reportes";
import Catalogo from "./pages/Catalogo";

// Componentes
import Navbar from "./components/Navbar";

// ✅ Envolvemos las rutas en un componente para poder usar `useLocation`
function AppContent() {
  const location = useLocation();
  const isInicio = location.pathname === "/";

  // Solo mostramos el Navbar si no estamos en la ruta raíz ("/")
  const showNavbar = !isInicio;

  return (
    <div className={isInicio ? "App App-inicio" : "App"}>
      {showNavbar && <Navbar />}

      <main className={isInicio ? "App-main inicio-main" : "App-main"}>
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/inventario" element={<Inventario />} />
          <Route path="/gestion-imagenes" element={<GestionImagenes />} />
          <Route path="/editar-imagen/:id" element={<EditarImagen />} />
          <Route path="/nueva-imagen" element={<NuevaImagen />} />
          <Route path="/produccion" element={<ProduccionPines />} />
          <Route path="/inventario" element={<Inventario />} />
          <Route path="/reportes" element={<Reportes />} />
          <Route path="/catalogo" element={<Catalogo />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
