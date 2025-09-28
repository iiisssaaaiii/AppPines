import express from "express";
import db from "../config/db.js";

const router = express.Router();

// Endpoint de prueba: obtener todos los usuarios
router.get("/usuarios", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT id_usuario, nombre, email, rol FROM usuarios");
    res.json(rows);
  } catch (error) {
    console.error("Error en la conexión:", error);
    res.status(500).json({ error: "Error al conectar con la base de datos" });
  }
});

export default router;
