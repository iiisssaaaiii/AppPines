// backend/routes/plantillas.js
import express from "express";
import db from "../config/db.js";

const router = express.Router();

// Obtener todas las plantillas
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM plantilla ORDER BY fecha_guardado DESC");
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener catálogo:", error);
    res.status(500).json({ error: "Error al obtener el catálogo" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      "SELECT * FROM plantilla WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Plantilla no encontrada" });
    }

    const plantilla = rows[0];

    // Generar array repetido de imagenes (35 pines)
    const pines = Array(35).fill(plantilla.url_imagen);

    res.json({
      id: plantilla.id,
      etiquetas: plantilla.etiquetas,
      tamano: plantilla.tamano,
      cantidad: plantilla.cantidad,
      url_imagen: plantilla.url_imagen,
      fecha_guardado: plantilla.fecha_guardado,
      pines
    });

  } catch (error) {
    console.error("❌ Error al obtener plantilla:", error);
    res.status(500).json({ error: "Error al obtener la plantilla" });
  }
});

export default router;
