import React, { useEffect, useState } from "react";
import "../styles/Inventario.css";

import {
  obtenerInventario,
  obtenerMateriaPrima,
  registrarVenta,
} from "../services/inventarioService";

import { eliminarPin, actualizarPin } from "../services/pinesService";

import EditPinModal from "../components/pines/EditPinModal";
import ConfirmDialog from "../components/common/ConfirmDialog";
import RegistrarVentaModal from "../components/pines/RegistrarVentaModal";

const PLACEHOLDER_IMG =
  "https://via.placeholder.com/120?text=Sin+Imagen";

function formatearTamano(t) {
  if (!t) return "Sin definir";
  if (t === "pequeno") return "Pequeño";
  if (t === "grande") return "Grande";
  return t;
}

function evaluarEstado(stock, minimo) {
  if (stock <= 0) return "danger";
  if (stock <= minimo) return "warn";
  return "ok";
}

function obtenerColorEtiqueta(tag = "") {
  const t = tag.toLowerCase();

  if (t.includes("azul") || t.includes("corporativo")) return "tag-blue";
  if (t.includes("especial") || t.includes("limitada")) return "tag-purple";
  return "tag-navy";
}

export default function Inventario() {
  const [pines, setPines] = useState([]);
  const [materiaPrima, setMateriaPrima] = useState([]);

  const [tabActiva, setTabActiva] = useState("pines");

  const [pinSeleccionado, setPinSeleccionado] = useState(null);
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
  const [mostrarConfirmEliminar, setMostrarConfirmEliminar] = useState(false);

  const [mostrarVenta, setMostrarVenta] = useState(false);
  const [pinParaVenta, setPinParaVenta] = useState(null);

  // 🔵 ESTADOS NUEVOS PARA FILTRO
  const [etiquetaSeleccionada, setEtiquetaSeleccionada] = useState("Todas");
  const [dropdownAbierto, setDropdownAbierto] = useState(false);

  const cargarDatos = async () => {
    try {
      const dataPines = await obtenerInventario();
      const dataMateria = await obtenerMateriaPrima();

      setPines(dataPines);
      setMateriaPrima(dataMateria);
    } catch (err) {
      console.error("Error cargando inventario:", err);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const guardarCambiosPin = async (datos) => {
    try {
      await actualizarPin(pinSeleccionado.id_pin, datos);
      setMostrarModalEditar(false);
      setPinSeleccionado(null);
      await cargarDatos();
    } catch (error) {
      console.error("Error actualizando pin:", error);
      alert("❌ No se pudieron guardar los cambios del pin");
    }
  };

  const eliminarPinSeleccionado = async () => {
    try {
      await eliminarPin(pinSeleccionado.id_pin);
      setMostrarConfirmEliminar(false);
      setPinSeleccionado(null);
      await cargarDatos();
    } catch (error) {
      console.error("Error eliminando pin:", error);
      const mensaje =
        error?.response?.data?.error ||
        "No se pudo eliminar el pin. Intenta de nuevo más tarde.";
      alert(`❌ ${mensaje}`);
    }
  };

  // 🔵 OBTENER TODAS LAS ETIQUETAS
  const todasEtiquetas = [
    ...new Set(
      pines
        .flatMap(p => p.etiquetas ? p.etiquetas.split(",") : [])
        .map(e => e.trim())
        .filter(e => e !== "")
    ),
  ];

  // 🔵 FILTRADO DE PINES
  const pinesFiltrados =
    etiquetaSeleccionada === "Todas"
      ? pines
      : pines.filter(pin =>
          pin.etiquetas?.split(",")
            .map(t => t.trim())
            .includes(etiquetaSeleccionada)
        );

  return (
    <main className="page inventario-page">
      <h1 className="page-title">INVENTARIO</h1>

      <div className="app">
        <nav className="tabs">
          <button
            className={`tab-btn ${tabActiva === "pines" ? "active" : ""}`}
            onClick={() => setTabActiva("pines")}
          >
            Stock de pines
          </button>
          <button
            className={`tab-btn ${tabActiva === "materia" ? "active" : ""}`}
            onClick={() => setTabActiva("materia")}
          >
            Materia prima
          </button>
        </nav>

        {/* TAB PINES */}
        <section
          className={`tab-panel ${tabActiva === "pines" ? "active" : ""}`}
        >
          <div className="panel-header">
            <div>
              <h2>Inventario de pines disponibles</h2>
              <p>Listado de pines terminados listos para venta o entrega.</p>
            </div>

            {/* 🔵 DROPDOWN DE FILTRO */}
            <div className="filter" style={{ position: "relative" }}>
              <span>Filtrar por etiqueta</span>

              <div
                className="fake-select"
                onClick={() => setDropdownAbierto(!dropdownAbierto)}
              >
                <span className="value">
                  {etiquetaSeleccionada === "Todas"
                    ? "-- Todas --"
                    : etiquetaSeleccionada}
                </span>
                <span className="caret">▾</span>
              </div>

              {dropdownAbierto && (
                <div className="dropdown">
                  <div
                    className="dropdown-item"
                    onClick={() => {
                      setEtiquetaSeleccionada("Todas");
                      setDropdownAbierto(false);
                    }}
                  >
                    Todas
                  </div>

                  {todasEtiquetas.map((tag, i) => (
                    <div
                      key={i}
                      className="dropdown-item"
                      onClick={() => {
                        setEtiquetaSeleccionada(tag);
                        setDropdownAbierto(false);
                      }}
                    >
                      {tag}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="pin-layout">
            {pinesFiltrados.map((pin) => {
              const estado = evaluarEstado(pin.stock_actual, 5);

              const badgeClass =
                estado === "ok"
                  ? "badge badge-ok"
                  : estado === "warn"
                  ? "badge badge-warn"
                  : "badge badge-danger";

              return (
                <article key={pin.id_pin} className="pin-card">
                  <div className="pin-image-wrap">
                    <img
                      src={pin.url_imagen || PLACEHOLDER_IMG}
                      alt={pin.nombre_pin}
                      className="pin-image"
                    />
                  </div>

                  <div className="pin-header-row">
                    <div>
                      <h3 className="pin-name">{pin.nombre_pin}</h3>

                      <div className="pin-tags">
                        {pin.etiquetas &&
                          pin.etiquetas
                            .split(",")
                            .filter((t) => t.trim() !== "")
                            .map((tag, i) => (
                              <span
                                key={i}
                                className={`tag-chip ${obtenerColorEtiqueta(
                                  tag
                                )}`}
                              >
                                {tag.trim()}
                              </span>
                            ))}
                      </div>
                    </div>

                    <span className={badgeClass}>
                      {estado === "ok"
                        ? "Stock saludable"
                        : estado === "warn"
                        ? "Stock bajo"
                        : "Agotado"}
                    </span>
                  </div>

                  <ul className="pin-meta">
                    <li>
                      <span className="label">Stock:</span>{" "}
                      {pin.stock_actual} piezas
                    </li>
                    <li>
                      <span className="label">Tamaño:</span>{" "}
                      {formatearTamano(pin.tamano ?? pin.tamaño)}
                    </li>
                    <li>
                      <span className="label">Precio:</span>{" "}
                      ${pin.precio != null ? Number(pin.precio).toFixed(2) : "0.00"}
                    </li>
                    <li>
                      <span className="label">Tiempo en stock:</span>{" "}
                      {pin.tiempo_en_stock != null
                        ? `${pin.tiempo_en_stock} días`
                        : "—"}
                    </li>
                  </ul>

                  <div className="pin-actions">
                    <button
                      className="btn btn-sale"
                      onClick={() => {
                        setPinParaVenta(pin);
                        setMostrarVenta(true);
                      }}
                    >
                      Registrar venta
                    </button>

                    <button
                      className="btn btn-edit"
                      onClick={() => {
                        setPinSeleccionado(pin);
                        setMostrarModalEditar(true);
                      }}
                    >
                      Modificar
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* TAB MATERIA PRIMA */}
        <section
          className={`tab-panel ${tabActiva === "materia" ? "active" : ""}`}
        >
          <div className="panel-header">
            <div>
              <h2>Inventario de materia prima</h2>
              <p>Material base para producir nuevos pines.</p>
            </div>

            <button className="btn-add">➕ Agregar</button>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Material</th>
                  <th>Descripción</th>
                  <th className="numeric">Stock</th>
                  <th>Unidad</th>
                  <th>Estado</th>
                  <th style={{ textAlign: "center" }}>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {materiaPrima.map((mat) => {
                  const estado = evaluarEstado(
                    mat.stock_actual,
                    mat.stock_minimo
                  );

                  const badgeClass =
                    estado === "ok"
                      ? "badge badge-ok"
                      : estado === "warn"
                      ? "badge badge-warn"
                      : "badge badge-danger";

                  return (
                    <tr key={mat.id_materia_prima}>
                      <td>{mat.id_materia_prima}</td>
                      <td>{mat.nombre}</td>
                      <td>{mat.descripcion}</td>
                      <td className="numeric">{mat.stock_actual}</td>
                      <td>{mat.unidad}</td>
                      <td>
                        <span className={badgeClass}>
                          {estado === "ok"
                            ? "OK"
                            : estado === "warn"
                            ? "Revisar pronto"
                            : "Sin existencias"}
                        </span>
                      </td>

                      <td className="actions-cell">
                        <div className="icon-actions">
                          <button className="icon-btn">✏️</button>
                          <button className="icon-btn">🗑️</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {mostrarModalEditar && (
        <EditPinModal
          open={mostrarModalEditar}
          pin={pinSeleccionado}
          onClose={() => {
            setMostrarModalEditar(false);
            setPinSeleccionado(null);
          }}
          onSave={guardarCambiosPin}
        />
      )}

      {mostrarConfirmEliminar && (
        <ConfirmDialog
          title="Eliminar pin"
          message="¿Estás seguro de que deseas eliminar este pin?"
          onConfirm={eliminarPinSeleccionado}
          onCancel={() => setMostrarConfirmEliminar(false)}
        />
      )}

      {mostrarVenta && (
        <RegistrarVentaModal
          pin={pinParaVenta}
          onClose={() => setMostrarVenta(false)}
          onConfirm={async ({ cantidad, descripcion }) => {
            await registrarVenta({
              id_pin: pinParaVenta.id_pin,
              cantidad,
              descripcion,
            });

            setMostrarVenta(false);
            cargarDatos();
          }}
        />
      )}
    </main>
  );
}
