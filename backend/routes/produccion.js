import express from "express";
import db from "../config/db.js";

const router = express.Router();

/**
 * POST /api/produccion
 * Registra la producción de pines
 * Body esperado:
 * {
 *   "url_imagen": "http://localhost/uploads/spiderman.png",
 *   "etiquetas": "superheroes",
 *   "tamano": "grande",
 *   "cantidad": 12,
 *   "id_usuario": 1
 * }
 */
router.post("/", async (req, res) => {
  const { url_imagen, etiquetas, tamano, cantidad, id_usuario } = req.body;

  if (!url_imagen || !tamano || !cantidad) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }

  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    // 1. Insertar pin o reutilizar si ya existe con misma url + tamaño
    const [existingPin] = await connection.query(
      "SELECT id_pin FROM pines WHERE url_imagen = ? AND tamano = ?",
      [url_imagen, tamano]
    );

    let pinId;
    if (existingPin.length > 0) {
      pinId = existingPin[0].id_pin;
    } else {
      const [insertPin] = await connection.query(
        "INSERT INTO pines (url_imagen, etiquetas, tamano) VALUES (?, ?, ?)",
        [url_imagen, etiquetas || "", tamano]
      );
      pinId = insertPin.insertId;
    }

    // 2. Actualizar inventario de pines
    await connection.query(
      `INSERT INTO inventario_pines (id_pin, cantidad)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE cantidad = cantidad + VALUES(cantidad)`,
      [pinId, cantidad]
    );

    // 3. Descontar materia prima según consumo definido
    const [consumos] = await connection.query(
      "SELECT id_material, cantidad_por_pin FROM consumo_materia WHERE tamano = ?",
      [tamano]
    );

    for (const consumo of consumos) {
      await connection.query(
        "UPDATE materia_prima SET cantidad = cantidad - (? * ?) WHERE id_material = ?",
        [consumo.cantidad_por_pin, cantidad, consumo.id_material]
      );
    }

    // 4. (Opcional) Registrar movimiento como venta interna o log
    await connection.query(
      "INSERT INTO ventas (id_usuario, total) VALUES (?, ?)",
      [id_usuario || 1, 0] // total 0 porque es producción, no venta
    );

    await connection.commit();
    res.json({ mensaje: "Producción registrada con éxito", id_pin: pinId });
  } catch (error) {
    await connection.rollback();
    console.error("Error registrando producción:", error);
    res.status(500).json({ error: "Error al registrar producción" });
  } finally {
    connection.release();
  }
});

export default router;
