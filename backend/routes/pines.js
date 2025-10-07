// backend/routes/pines.js
import express from "express";
import db from "../config/db.js";

const router = express.Router();

/**
 * ✅ GET /api/pines
 * Lista pines. Soporta:
 *  - ?id=123  → obtiene un pin específico
 *  - ?tag=anime → filtra por etiqueta (LIKE %tag%)
 * Devuelve también 'tiempo_en_stock' (días desde fecha_creacion)
 */
router.get("/", async (req, res) => {
  try {
    const { id, tag } = req.query;

    let query = `
      SELECT 
        p.id_pin,
        p.nombre,
        p.url_imagen,
        p.etiquetas,
        p.tamano,
        IFNULL(i.cantidad, 0) AS cantidad,
        p.fecha_creacion,
        DATEDIFF(CURDATE(), DATE(p.fecha_creacion)) AS tiempo_en_stock
      FROM pines p
      LEFT JOIN inventario_pines i ON i.id_pin = p.id_pin
    `;
    const params = [];

    if (id) {
      query += " WHERE p.id_pin = ? ";
      params.push(Number(id));
    } else if (tag) {
      query += " WHERE p.etiquetas LIKE ? ";
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
 * Crea un nuevo pin y su inventario inicial.
 * Body esperado: { url_imagen, etiquetas?, tamano, cantidad, fecha_creacion?, nombre? }
 */
router.post("/", async (req, res) => {
  try {
    const { url_imagen, etiquetas, tamano, cantidad, fecha_creacion, nombre } = req.body;

    if (!url_imagen || !tamano || typeof cantidad === "undefined") {
      return res.status(400).json({ error: "Faltan datos obligatorios (url_imagen, tamano, cantidad)" });
    }

    // Validar tamaño (opcional)
    const TAMANOS = new Set(["pequeno", "grande"]);
    if (!TAMANOS.has(tamano)) {
      return res.status(400).json({ error: "Tamaño inválido (usa 'pequeno' o 'grande')" });
    }

    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const [result] = await conn.query(
        "INSERT INTO pines (nombre, url_imagen, etiquetas, tamano, fecha_creacion) VALUES (?, ?, ?, ?, ?)",
        [nombre || null, url_imagen, etiquetas || "", tamano, fecha_creacion || new Date()]
      );

      await conn.query(
        "INSERT INTO inventario_pines (id_pin, cantidad) VALUES (?, ?)",
        [result.insertId, Number(cantidad) || 0]
      );

      await conn.commit();

      res.json({ mensaje: "Pin creado con éxito", id_pin: result.insertId });
    } catch (err) {
      await conn.rollback();
      console.error("❌ Error en transacción POST /pines:", err.message);
      res.status(500).json({ error: "Error creando pin" });
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error("❌ Error en POST /pines:", error.message);
    res.status(500).json({ error: "Error creando pin" });
  }
});

/**
 * ✅ PUT /api/pines/:id
 * Edita un pin existente. Campos opcionales:
 * { nombre?, etiquetas?, tamano?, url_imagen?, cantidad? }
 * - Si viene 'cantidad', actualiza/crea su inventario.
 */
router.put("/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "ID inválido" });
  }

  const { nombre, etiquetas, tamano, url_imagen, cantidad } = req.body;

  // Validar tamaño si vino
  if (typeof tamano !== "undefined") {
    const TAMANOS = new Set(["pequeno", "grande"]);
    if (!TAMANOS.has(tamano)) {
      return res.status(400).json({ error: "Tamaño inválido (usa 'pequeno' o 'grande')" });
    }
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Construcción dinámica del UPDATE pines
    const fields = [];
    const values = [];
    if (typeof nombre !== "undefined") { fields.push("nombre = ?"); values.push(nombre || null); }
    if (typeof etiquetas !== "undefined") { fields.push("etiquetas = ?"); values.push(etiquetas || ""); }
    if (typeof tamano !== "undefined") { fields.push("tamano = ?"); values.push(tamano); }
    if (typeof url_imagen !== "undefined") { fields.push("url_imagen = ?"); values.push(url_imagen); }

    if (fields.length) {
      const sql = `UPDATE pines SET ${fields.join(", ")} WHERE id_pin = ?`;
      values.push(id);
      const [up] = await conn.query(sql, values);
      if (up.affectedRows === 0) {
        await conn.rollback();
        return res.status(404).json({ error: "Pin no encontrado" });
      }
    } else {
      // Si no vino ningún campo de pines, igual validaremos existencia si se va a tocar inventario
      const [exists] = await conn.query("SELECT id_pin FROM pines WHERE id_pin = ?", [id]);
      if (!exists.length) {
        await conn.rollback();
        return res.status(404).json({ error: "Pin no encontrado" });
      }
    }

    // Actualizar inventario si vino 'cantidad'
    if (typeof cantidad !== "undefined") {
      const [existInv] = await conn.query(
        "SELECT id_inventario FROM inventario_pines WHERE id_pin = ?",
        [id]
      );
      if (existInv.length) {
        await conn.query(
          "UPDATE inventario_pines SET cantidad = ? WHERE id_pin = ?",
          [Number(cantidad) || 0, id]
        );
      } else {
        await conn.query(
          "INSERT INTO inventario_pines (id_pin, cantidad) VALUES (?, ?)",
          [id, Number(cantidad) || 0]
        );
      }
    }

    await conn.commit();

    // Devolver el pin actualizado
    const [rows] = await db.query(
      `SELECT 
         p.id_pin,
         p.nombre,
         p.url_imagen,
         p.etiquetas,
         p.tamano,
         IFNULL(i.cantidad, 0) AS cantidad,
         p.fecha_creacion,
         DATEDIFF(CURDATE(), DATE(p.fecha_creacion)) AS tiempo_en_stock
       FROM pines p
       LEFT JOIN inventario_pines i ON i.id_pin = p.id_pin
       WHERE p.id_pin = ?`,
      [id]
    );

    res.json(rows[0] || { mensaje: "Actualizado" });
  } catch (err) {
    await conn.rollback();
    console.error("❌ Error PUT /pines/:id:", err.message);
    res.status(500).json({ error: "No se pudo actualizar el pin" });
  } finally {
    conn.release();
  }
});

/**
 * ✅ DELETE /api/pines/:id
 * Elimina un pin y su inventario asociado.
 * (Si tu FK no tiene ON DELETE CASCADE, eliminamos inventario manualmente)
 */
router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "ID inválido" });
  }

  try {
    // Borrar inventario primero (idempotente)
    await db.query("DELETE FROM inventario_pines WHERE id_pin = ?", [id]);

    const [result] = await db.query("DELETE FROM pines WHERE id_pin = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Pin no encontrado" });
    }

    // 204 No Content para éxito sin cuerpo
    res.status(204).send();
  } catch (err) {
    console.error("❌ Error DELETE /pines/:id:", err.message);
    res.status(500).json({ error: "No se pudo eliminar el pin" });
  }
});

export default router;