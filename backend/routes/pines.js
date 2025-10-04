// routes/pines.js
import express from "express";
import db from "../config/db.js";

const router = express.Router();

/**
 * ✅ GET /api/pines
 * Lista los pines con fecha_produccion y días en stock
 * Permite filtrar por etiqueta (?tag=)
 */
router.get("/", async (req, res) => {
  try {
    const { tag } = req.query;

    let query = `
      SELECT 
        p.id_pin, 
        p.url_imagen, 
        p.etiquetas, 
        p.tamano,
        IFNULL(i.cantidad, 0) AS cantidad, 
        p.fecha_creacion,
        DATEDIFF(CURDATE(), p.fecha_creacion) AS dias_en_stock
      FROM pines p
      LEFT JOIN inventario_pines i ON p.id_pin = i.id_pin
    `;

    const params = [];

    if (tag) {
      query += " WHERE p.etiquetas LIKE ?";
      params.push(`%${tag}%`);
    }
    
    query += " ORDER BY p.fecha_creacion DESC;";

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error("❌ Error en GET /pines:", error.message);
    res.status(500).json({ error: "Error obteniendo pines" });
  }
});

/**
 * ✅ POST /api/pines
 * Crea un nuevo pin registrando su fecha_produccion
 */
router.post("/", async (req, res) => {
  try { 
    const { url_imagen, etiquetas, tamano, cantidad, fecha_creacion } = req.body;

    if (!url_imagen || !tamano || !cantidad) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    // Insertar el nuevo pin
    const [result] = await db.query(
      "INSERT INTO pines (url_imagen, etiquetas, tamano, fecha_creacion) VALUES (?, ?, ?, ?)",
      [url_imagen, etiquetas || "", tamano, fecha_creacion || new Date()]
    );

    // Registrar inventario inicial
    await db.query(
      "INSERT INTO inventario_pines (id_pin, cantidad) VALUES (?, ?)",
      [result.insertId, cantidad]
    );

    res.json({ mensaje: "Pin creado con éxito", id_pin: result.insertId });
  } catch (error) {
    console.error("❌ Error en POST /pines:", error.message);
    res.status(500).json({ error: "Error creando pin" });
  }
});

export default router;
