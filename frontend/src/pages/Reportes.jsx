// src/pages/Reportes.jsx
import React, { useEffect, useState } from "react";
import { obtenerMovimientos } from "../services/movimientosService";
import {
  obtenerCategoriasMasVendidas,
  obtenerVentas,
} from "../services/reportesService";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { Bar, Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);


const Reportes = () => {
  const [tipoReporte, setTipoReporte] = useState("movimientos"); 
  const [movimientos, setMovimientos] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [filtroTamano, setFiltroTamano] = useState("");
  const [filtroTipoMovimiento, setFiltroTipoMovimiento] = useState("");


  // ==============================================
  // 🔹 Cargar datos dinámicamente
  // ==============================================
const cargarDatos = async () => {
  setLoading(true);
  try {
    const params = {};

    if (fechaInicio && fechaFin) {
      params.fecha_inicio = fechaInicio;
      params.fecha_fin = fechaFin;
    }

    if (filtroTamano) {
      params.tamano = filtroTamano;
    }

    if (filtroTipoMovimiento) {
      params.tipo = filtroTipoMovimiento;
    }

    if (tipoReporte === "movimientos") {
      const data = await obtenerMovimientos(params);
      setMovimientos(data);
    }
    else if (tipoReporte === "ventas") {
      const data = await obtenerVentas(params);
      setVentas(data);
    }
    else if (tipoReporte === "categorias") {
      const data = await obtenerCategoriasMasVendidas(params);
      setCategorias(data);
    }

  } catch (error) {
    alert("Error cargando datos");
  }
  setLoading(false);
};


  useEffect(() => {
    cargarDatos();
    // eslint-disable-next-line
  }, [tipoReporte]);

  const handleFiltrar = () => {
    if ((fechaInicio && !fechaFin) || (!fechaInicio && fechaFin)) {
      alert("Selecciona ambas fechas para filtrar");
      return;
    }
    cargarDatos();
  };

  // ==============================================
  // 🔹 Gráficas para Categorías
  // ==============================================
  const dataCategoriasBar = {
    labels: categorias.map(c => c.categoria),
    datasets: [
      {
        label: "Total vendidos",
        data: categorias.map(c => c.total_vendidos),
        backgroundColor: ["#4f46e5", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444"],
      },
    ],
  };

  const dataCategoriasPie = {
    labels: categorias.map(c => c.categoria),
    datasets: [
      {
        data: categorias.map(c => c.total_vendidos),
        backgroundColor: ["#4f46e5", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444"],
      },
    ],
  };

  // ==============================================
  // 🔹 Gráfica de Ventas (línea)
  // ==============================================
  const dataVentasLine = {
    labels: ventas.map(v => new Date(v.fecha).toLocaleDateString("es-MX")),
    datasets: [
      {
        label: "Total vendido",
        data: ventas.map(v => v.total),
        borderColor: "#4f46e5",
        borderWidth: 3,
        fill: false,
      },
    ],
  };

  // ==============================================
  // 🔹 Exportar PDF
  // ==============================================
  const handleExportarPDF = () => {
    const doc = new jsPDF();
    let titulo = "Reporte";
    let head = [];
    let body = [];

    if (tipoReporte === "movimientos") {
      titulo = "Reporte de Movimientos de Inventario";
      head = [["ID", "Pin", "Tamaño", "Tipo", "Cantidad", "Motivo", "Usuario", "Fecha"]];
      body = movimientos.map((m) => [
        m.id_movimiento,
        m.id_pin,
        m.tamano,
        m.tipo,
        m.cantidad,
        m.motivo,
        m.usuario || "Desconocido",
        new Date(m.fecha_movimiento).toLocaleString(),
      ]);

    } else if (tipoReporte === "ventas") {
      titulo = "Reporte de Ventas";
      head = [["ID", "Fecha", "Usuario", "Total", "Total pines"]];
      body = ventas.map((v) => [
        v.id_venta,
        new Date(v.fecha).toLocaleString(),
        v.usuario || "Desconocido",
        `$${v.total}`,
        v.total_pines,
      ]);

    } else if (tipoReporte === "categorias") {
      titulo = "Categorías Más Vendidas";
      head = [["Categoría", "Vendidos"]];
      body = categorias.map((c) => [
        c.categoria,
        c.total_vendidos,
      ]);
    }

    doc.text(titulo, 14, 20);
    autoTable(doc, { startY: 30, head, body });
    doc.save(`${titulo}.pdf`);
  };

  // ==============================================
  // 🔹 UI
  // ==============================================
  if (loading) return <p>Cargando reportes...</p>;

  return (
    <div className="reportes-container">
      <h1 className="titulo">GENERAR REPORTE</h1>

      <div className="reportes-contenido">
        
        {/* ====================================
              PANEL IZQUIERDO (FILTROS)
        ====================================== */}
        <div className="panel-filtros">
          <h2>SELECCIONAR PERIODO</h2>

          <label className="label">Fecha inicio</label>
          <input
            type="date"
            className="input"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
          />

          <label className="label">Fecha fin</label>
          <input
            type="date"
            className="input"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
          />

          <label className="label">Tamaño del pin</label>
<select
  className="select"
  value={filtroTamano}
  onChange={(e) => setFiltroTamano(e.target.value)}
>
  <option value="">Todos</option>
  <option value="pequeno">Pequeño</option>
  <option value="grande">Grande</option>
</select>

<label className="label">Tipo de movimiento</label>
<select
  className="select"
  value={filtroTipoMovimiento}
  onChange={(e) => setFiltroTipoMovimiento(e.target.value)}
>
  <option value="">Todos</option>
  <option value="entrada">Entrada</option>
  <option value="salida">Salida</option>
</select>


          <button className="btn-buscar" onClick={handleFiltrar}>
            Buscar
          </button>

          <label className="label" style={{ marginTop: "25px" }}>
            Filtrar por
          </label>
          <select
            className="select"
            value={tipoReporte}
            onChange={(e) => setTipoReporte(e.target.value)}
          >
            <option value="movimientos">Movimientos</option>
            <option value="ventas">Ventas</option>
            <option value="categorias">Categorías más vendidas</option>
          </select>
        </div>

        {/* ====================================
              PANEL DERECHO (REPORTE)
        ====================================== */}
        <div className="panel-reporte">

          {/* ====== MOVIMIENTOS ====== */}
          {tipoReporte === "movimientos" && (
            <>
              <h2 className="subtitulo">Movimientos de Inventario</h2>

              {movimientos.length === 0 ? (
                <p>No hay movimientos.</p>
              ) : (
                <table className="tabla">
                  <thead>
                    <tr>
                      <th>ID</th><th>Pin</th><th>Tamaño</th><th>Tipo</th>
                      <th>Cantidad</th><th>Motivo</th><th>Usuario</th><th>Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movimientos.map((m) => (
                      <tr key={m.id_movimiento}>
                        <td>{m.id_movimiento}</td>
                        <td>{m.id_pin}</td>
                        <td>{m.tamano}</td>
                        <td>{m.tipo}</td>
                        <td>{m.cantidad}</td>
                        <td>{m.motivo}</td>
                        <td>{m.usuario || "Desconocido"}</td>
                        <td>{new Date(m.fecha_movimiento).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}

          {/* ====== VENTAS ====== */}
          {tipoReporte === "ventas" && (
            <>
              <h2 className="subtitulo">Reporte de Ventas</h2>

              {/* Gráfica de línea */}
              {ventas.length > 0 && (
                <div className="grafica-contenedor">
                  <h3 className="grafica-titulo">Tendencia de Ventas</h3>
                  <Line data={dataVentasLine} />
                </div>
              )}

              {ventas.length === 0 ? (
                <p>No hay ventas.</p>
              ) : (
                <table className="tabla">
                  <thead>
                    <tr>
                      <th>ID</th><th>Fecha</th><th>Usuario</th><th>Total</th><th>Pines</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ventas.map((v) => (
                      <tr key={v.id_venta}>
                        <td>{v.id_venta}</td>
                        <td>{new Date(v.fecha).toLocaleString()}</td>
                        <td>{v.usuario || "Desconocido"}</td>
                        <td>${v.total}</td>
                        <td>{v.total_pines}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}

          {/* ====== CATEGORÍAS ====== */}
          {tipoReporte === "categorias" && (
            <>
              <h2 className="subtitulo">Categorías Más Vendidas</h2>

              {/* Gráfica de barras */}
              {categorias.length > 0 && (
                <div className="grafica-contenedor">
                  <Bar data={dataCategoriasBar} />
                </div>
              )}

              {/* Gráfica de pastel */}
              {categorias.length > 0 && (
                <div className="grafica-contenedor">
                  <Pie data={dataCategoriasPie} />
                </div>
              )}

              {/* Tabla */}
              {categorias.length === 0 ? (
                <p>No hay datos</p>
              ) : (
                <table className="tabla">
                  <thead>
                    <tr>
                      <th>Categoría</th>
                      <th>Vendidos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categorias.map((c, i) => (
                      <tr key={i}>
                        <td>{c.categoria}</td>
                        <td>{c.total_vendidos}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}

          {/* BOTÓN PDF */}
          <button className="btn-pdf" onClick={handleExportarPDF}>
            PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reportes;
