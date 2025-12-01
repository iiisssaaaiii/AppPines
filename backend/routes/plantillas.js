import express from "express";
import db from "../config/db.js";

const router = express.Router();

/* ============================================================
   ⭐ 1. GUARDAR PLANTILLA COMPLETA (cabecera + detalle)
   ============================================================ */
router.post("/", async (req, res) => {
  try {
    const { tamano, cantidad, slots } = req.body;

    if (!slots || slots.length === 0) {
      return res.status(400).json({ error: "No se enviaron imágenes" });
    }

    // 1️⃣ Insertar cabecera en tabla plantilla
    const [result] = await db.query(
      "INSERT INTO plantilla (tamano, cantidad, id_usuario) VALUES (?, ?, ?)",
      [tamano, cantidad, 1] // usuario 1 temporal
    );

    const idPlantilla = result.insertId;

    // 2️⃣ Insertar detalle
    const valores = slots.map((s) => [idPlantilla, s.id_imagen, s.posicion]);

    await db.query(
      "INSERT INTO plantilla_detalle (id_plantilla, id_imagen, posicion) VALUES ?",
      [valores]
    );

    res.json({
      ok: true,
      id_plantilla: idPlantilla,
      cantidad_registros: valores.length,
    });

  } catch (error) {
    console.error("❌ Error guardando plantilla:", error);
    res.status(500).json({ error: "Error al guardar la plantilla" });
  }
});

/* ============================================================
   ⭐ 2. LISTAR PLANTILLAS CON MINIATURA CORRECTA
   ============================================================ */
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        p.*,
        (
          SELECT CONCAT(i.ruta, i.archivo)
          FROM plantilla_detalle pd
          JOIN imagenes i ON i.id_imagen = pd.id_imagen
          WHERE pd.id_plantilla = p.id
          ORDER BY pd.posicion ASC
          LIMIT 1
        ) AS miniatura
      FROM plantilla p
      ORDER BY p.fecha_guardado DESC
    `);

    res.json(rows);

  } catch (error) {
    console.error("❌ Error al obtener plantillas:", error);
    res.status(500).json({ error: "Error al obtener plantillas" });
  }
});

/* ============================================================
   ⭐ 3. OBTENER UNA PLANTILLA COMPLETA
   ============================================================ */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // 1️⃣ Cabecera
    const [plantilla] = await db.query(
      "SELECT * FROM plantilla WHERE id = ?",
      [id]
    );

    if (plantilla.length === 0) {
      return res.status(404).json({ error: "Plantilla no encontrada" });
    }

    // 2️⃣ Detalles con URL completa armada
    const [detalles] = await db.query(
      `SELECT 
          pd.posicion, 
          CONCAT(i.ruta, i.archivo) AS url 
       FROM plantilla_detalle pd
       JOIN imagenes i ON i.id_imagen = pd.id_imagen
       WHERE pd.id_plantilla = ?
       ORDER BY pd.posicion ASC`,
      [id]
    );

    res.json({
      ...plantilla[0],
      pines: detalles,
    });

  } catch (error) {
    console.error("❌ Error al obtener plantilla:", error);
    res.status(500).json({ error: "Error al obtener la plantilla" });
  }
});

export default router;
