import express from 'express';
import db from '../config/db.js';

const router = express.Router();

/**
 * ✅ GET /api/reportes/top-tags
 * Genera un reporte con el top de tags más vendidos.
 */
router.get("/top-tags", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        t.nombre AS tag,
        COUNT(*) AS cantidad_ventas
      FROM venta_detalle vd
      JOIN pin_tags pt ON vd.pin_id = pt.id_pin
      JOIN tags t ON pt.id_tag = t.id_tag
      GROUP BY t.id_tag
      ORDER BY cantidad_ventas DESC
      LIMIT 10;
    `);
    
    res.json({ reporte: rows });
  } catch (error) {
    console.error("❌ Error en el reporte de top-tags:", error.message);
    res.status(500).json({ error: "Error generando el reporte de tags más vendidos" });
  }
});

export default router;
