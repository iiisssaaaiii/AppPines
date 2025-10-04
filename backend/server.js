// backend/server.js
import express from "express";
import testRoutes from "./routes/testdb.js";
import inventarioRoutes from "./routes/inventario.js";
import produccionRoutes from "./routes/produccion.js";
import pinesRoutes from "./routes/pines.js";
import path from "path";
import fs from "fs";

const app = express();

// 📂 Asegurar que la carpeta uploads exista
const uploadsPath = path.resolve("uploads");
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
  console.log("📂 Carpeta 'uploads' creada automáticamente.");
}

// 📌 Middleware para JSON
app.use(express.json());

// 📌 Servir archivos estáticos (imágenes en /uploads)
app.use("/uploads", express.static(uploadsPath));

// 📌 Bienvenida
app.get("/", (req, res) => {
  res.send("🎉 API Pines lista y corriendo en http://localhost:4000 🚀");
});

// 📌 Rutas
app.use("/api/testdb", testRoutes);
app.use("/api/inventario", inventarioRoutes);
app.use("/api/produccion", produccionRoutes);
app.use("/api/pines", pinesRoutes);

// 📌 Servidor
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
