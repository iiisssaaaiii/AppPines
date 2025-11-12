import express from "express";
import db from "../config/db.js";

const router = express.Router();

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

      // Crear el pin en la tabla pines
      const [result] = await conn.query(
        "INSERT INTO pines (nombre, url_imagen, etiquetas, tamano, fecha_creacion) VALUES (?, ?, ?, ?, ?)",
        [nombre || null, url_imagen, etiquetas || "", tamano, fecha_creacion || new Date()]
      );

      // Crear inventario
      await conn.query(
        "INSERT INTO inventario_pines (id_pin, cantidad) VALUES (?, ?)",
        [result.insertId, Number(cantidad) || 0]
      );

      // Asociar etiquetas al pin (si existen)
      for (let tag of etiquetas) {
        // Verificar si la etiqueta ya existe
        const [tagResult] = await conn.query('SELECT id_tag FROM tags WHERE nombre = ?', [tag]);

        if (tagResult.length > 0) {
          // Si la etiqueta existe, asociarla
          await conn.query('INSERT INTO pin_tags (id_pin, id_tag) VALUES (?, ?)', [result.insertId, tagResult[0].id_tag]);
        } else {
          // Si la etiqueta no existe, crearla y asociarla
          const [newTagResult] = await conn.query('INSERT INTO tags (nombre) VALUES (?)', [tag]);
          await conn.query('INSERT INTO pin_tags (id_pin, id_tag) VALUES (?, ?)', [result.insertId, newTagResult.insertId]);
        }
      }

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

    // Asociar las etiquetas actualizadas al pin
    if (etiquetas) {
      // Borrar las etiquetas existentes
      await conn.query("DELETE FROM pin_tags WHERE id_pin = ?", [id]);

      // Asociar las nuevas etiquetas
      for (let tag of etiquetas) {
        const [tagResult] = await conn.query('SELECT id_tag FROM tags WHERE nombre = ?', [tag]);

        if (tagResult.length > 0) {
          // Si la etiqueta existe, asociarla
          await conn.query('INSERT INTO pin_tags (id_pin, id_tag) VALUES (?, ?)', [id, tagResult[0].id_tag]);
        } else {
          // Si la etiqueta no existe, crearla y asociarla
          const [newTagResult] = await conn.query('INSERT INTO tags (nombre) VALUES (?)', [tag]);
          await conn.query('INSERT INTO pin_tags (id_pin, id_tag) VALUES (?, ?)', [id, newTagResult.insertId]);
        }
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
 * ✅ GET /api/pines/:id/tags
 * Obtiene las etiquetas asociadas a un pin.
 * Devuelve un array de etiquetas (nombre).
 */
router.get("/:id/tags", async (req, res) => {
  const id_pin = parseInt(req.params.id, 10);
  
  if (Number.isNaN(id_pin)) {
    return res.status(400).json({ error: "ID de pin inválido" });
  }

  try {
    // Obtener las etiquetas asociadas al pin usando JOIN entre pin_tags y tags
    const [tags] = await db.query(
      `SELECT t.nombre 
       FROM tags t 
       JOIN pin_tags pt ON t.id_tag = pt.id_tag 
       WHERE pt.id_pin = ?`,
      [id_pin]
    );

    if (tags.length === 0) {
      return res.status(404).json({ error: "No se encontraron etiquetas para este pin" });
    }

    // Devuelve las etiquetas encontradas
    res.json(tags);
  } catch (error) {
    console.error("❌ Error GET /pines/:id/tags:", error.message);
    res.status(500).json({ error: "Error obteniendo etiquetas del pin" });
  }
});

export default router;
