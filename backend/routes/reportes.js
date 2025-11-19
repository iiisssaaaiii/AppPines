// backend/routes/reportes.js
import express from "express";
import db from "../config/db.js";

const router = express.Router();

/**
 * GET /api/reportes/categorias-mas-vendidas
 * Regresa las etiquetas de pines más vendidas (basado en movimientos de tipo 'salida')
 */
router.get("/categorias-mas-vendidas", async (req, res) => {
  try {
    const [rows] = await db.query(
      `
      SELECT 
        p.etiquetas,
        SUM(m.cantidad) AS total_vendido
      FROM movimientos_inventario m
      JOIN pines p ON m.id_pin = p.id_pin
      WHERE m.tipo = 'salida'
      GROUP BY p.etiquetas
      ORDER BY total_vendido DESC;
      `
    );

    res.json(rows);
  } catch (error) {
    console.error("❌ Error obteniendo categorías más vendidas:", error.message);
    res.status(500).json({ error: "Error al obtener categorías más vendidas" });
  }
});

export default router;
