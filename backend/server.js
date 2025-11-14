// backend/server.js
import express from "express";
import testRoutes from "./routes/testdb.js";
import inventarioRoutes from "./routes/inventario.js";
import produccionRoutes from "./routes/produccion.js";
import pinesRoutes from "./routes/pines.js";
import catalogoRoutes from "./routes/catalogo.js";
// import ventasRoutes from "./routes/ventas.js";  // Importa las rutas de ventas
import path from "path";
import fs from "fs";
import cors from "cors";

const app = express();

app.use(cors({
  origin: "http://localhost:3000", // el puerto donde corre tu app React
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type"],
  credentials: true,
}));

app.use("/uploads", express.static("uploads", {
  setHeaders: (res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
  },
}));


// 📂 Asegurar que la carpeta uploads exista
const uploadsPath = path.resolve("uploads");
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
  console.log("📂 Carpeta 'uploads' creada automáticamente.");
}

// 📌 Middleware para JSON
app.use(express.json({limit: "50mb"}));
app.use(express.urlencoded({extended: true, limit: "50mb"}));

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
app.use("/api/catalogo", catalogoRoutes);
// app.use("/api/ventas", ventasRoutes);  // Usa las rutas de ventas

// 📌 Servidor
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
