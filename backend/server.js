import express from "express";
import testRoutes from "./routes/testdb.js";
import inventarioRoutes from "./routes/inventario.js";
import produccionRoutes from "./routes/produccion.js";

const app = express();

app.use(express.json());

// Bienvenida
app.get("/", (req, res) => {
  res.send("🎉 API Pines lista y corriendo en http://localhost:4000 🚀");
});

// Rutas
app.use("/api/testdb", testRoutes);
app.use("/api/inventario", inventarioRoutes);
app.use("/api/produccion", produccionRoutes);

// Servidor
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
