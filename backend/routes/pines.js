// backend/routes/pines.js
import express from "express";
import db from "../config/db.js";

const router = express.Router();

/* ============================================================
   PUT /api/pines/:id
   Actualiza tamaño, precio y stock del pin
   Body esperado: { tamano, precio, cantidad }
============================================================ */
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { tamano, precio, cantidad } = req.body;

  if (!tamano && precio == null && cantidad == null) {
    return res
      .status(400)
      .json({ error: "No se recibió ningún campo para actualizar" });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1️⃣ Verificar que el pin exista
    const [pinRows] = await connection.query(
      "SELECT id_pin FROM pines WHERE id_pin = ?",
      [id]
    );
    if (pinRows.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({ error: "Pin no encontrado" });
    }

    // 2️⃣ Actualizar tabla pines (tamaño y/o precio)
    const camposPines = [];
    const valoresPines = [];

    if (tamano) {
      camposPines.push("tamano = ?");
      valoresPines.push(tamano); // "pequeno" | "grande"
    }
    if (precio != null) {
      camposPines.push("precio = ?");
      valoresPines.push(precio);
    }

    if (camposPines.length > 0) {
      valoresPines.push(id);
      const sqlUpdatePines = `
        UPDATE pines
        SET ${camposPines.join(", ")}
        WHERE id_pin = ?
      `;
      await connection.query(sqlUpdatePines, valoresPines);
    }

    // 3️⃣ Actualizar stock en inventario_pines
    if (cantidad != null) {
      const [invRows] = await connection.query(
        "SELECT id_inventario FROM inventario_pines WHERE id_pin = ?",
        [id]
      );

      if (invRows.length > 0) {
        await connection.query(
          "UPDATE inventario_pines SET cantidad = ? WHERE id_pin = ?",
          [cantidad, id]
        );
      } else {
        await connection.query(
          "INSERT INTO inventario_pines (id_pin, cantidad) VALUES (?, ?)",
          [id, cantidad]
        );
      }

      // 4️⃣ Registrar movimiento de ajuste de inventario
      await connection.query(
        `INSERT INTO movimientos_inventario
         (id_pin, tipo, cantidad, motivo, id_usuario)
         VALUES (?, 'ajuste', ?, ?, ?)`,
        [id, cantidad, "ajuste desde inventario", 1] // id_usuario fijo por ahora
      );
    }

    await connection.commit();
    connection.release();

    return res.json({
      ok: true,
      mensaje: "Pin actualizado correctamente",
    });
  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error("❌ Error actualizando pin:", error);
    return res.status(500).json({ error: "Error actualizando pin" });
  }
});

/* ============================================================
   DELETE /api/pines/:id
   Elimina el pin y su inventario (ON DELETE CASCADE)
============================================================ */
router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "ID inválido" });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // 1️⃣ Borrar detalle de ventas de ese pin (si hay)
    await connection.query(
      "DELETE FROM venta_detalle WHERE id_pin = ?",
      [id]
    );

    // 2️⃣ Borrar el pin
    const [result] = await connection.query(
      "DELETE FROM pines WHERE id_pin = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({ error: "Pin no encontrado" });
    }

    await connection.commit();
    connection.release();

    return res.json({ ok: true, mensaje: "Pin eliminado correctamente" });
  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error("❌ Error DELETE /pines/:id:", error);
    return res.status(500).json({ error: "Error eliminando pin" });
  }
});

export default router;