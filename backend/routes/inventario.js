import express from "express";
import db from "../config/db.js";

const router = express.Router();

// ✅ Inventario de pines
router.get("/pines", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.id_pin, p.url_imagen, p.etiquetas, p.tamano, 
             IFNULL(i.cantidad, 0) AS cantidad, 
             p.fecha_creacion
      FROM pines p
      LEFT JOIN inventario_pines i ON p.id_pin = i.id_pin
    `);
    res.json(rows);
  } catch (error) {
    console.error("Error obteniendo inventario de pines:", error);
    res.status(500).json({ error: "Error al obtener inventario de pines" });
  }
});

// ✅ Inventario de materia prima
router.get("/materia-prima", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT id_material, nombre, cantidad, stock_minimo, unidad
      FROM materia_prima
    `);
    res.json(rows);
  } catch (error) {
    console.error("Error obteniendo materia prima:", error);
    res.status(500).json({ error: "Error al obtener materia prima" });
  }
});

// ✅ Inventario combinado (pines + materia prima)
router.get("/", async (req, res) => {
  try {
    const [pines] = await db.query(`
      SELECT p.id_pin, p.url_imagen, p.etiquetas, p.tamano, 
             IFNULL(i.cantidad, 0) AS cantidad, 
             p.fecha_creacion
      FROM pines p
      LEFT JOIN inventario_pines i ON p.id_pin = i.id_pin
    `);

    const [materiaPrima] = await db.query(`
      SELECT id_material, nombre, cantidad, stock_minimo, unidad
      FROM materia_prima
    `);

    res.json({ pines, materiaPrima });
  } catch (error) {
    console.error("Error obteniendo inventario completo:", error);
    res.status(500).json({ error: "Error al obtener inventario completo" });
  }
});

export default router;
