// backend/server.js
import express from "express";
import testRoutes from "./routes/testdb.js";
import inventarioRoutes from "./routes/inventario.js";
import produccionRoutes from "./routes/produccion.js";
import pinesRoutes from "./routes/pines.js";
import catalogoRoutes from "./routes/catalogo.js";
// import ventasRoutes from "./routes/ventas.js";  // Importa las rutas de ventas

// ⭐ NUEVA RUTA PARA IMÁGENES
import imagenesRoutes from "./routes/imagenes.js";

import path from "path";
import fs from "fs";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000", // frontend React
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  })
);

// 📂 Servir imágenes
app.use(
  "/uploads",
  express.static("uploads", {
    setHeaders: (res) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
    },
  })
);

// 📂 Asegurar existencia de uploads/
const uploadsPath = path.resolve("uploads");
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
  console.log("📂 Carpeta 'uploads' creada automáticamente.");
}

// 📌 Middleware JSON
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// 📌 Servir archivos estáticos
app.use("/uploads", express.static(uploadsPath));

// 📌 Bienvenida
app.get("/", (req, res) => {
  res.send("🎉 API Pines lista y corriendo en http://localhost:4000 🚀");
});

// 📌 Rutas activas
app.use("/api/testdb", testRoutes);
app.use("/api/inventario", inventarioRoutes);
app.use("/api/produccion", produccionRoutes);
app.use("/api/pines", pinesRoutes);
app.use("/api/catalogo", catalogoRoutes);

// ⭐ Activar rutas de gestión de imágenes
app.use("/api/imagenes", imagenesRoutes);

// app.use("/api/ventas", ventasRoutes);  // Usa las rutas de ventas si luego las activas

// 📌 Servidor
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});