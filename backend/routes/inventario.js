// backend/routes/inventario.js
import express from "express";
import db from "../config/db.js";

const router = express.Router();

/* ------------------------------------------------------------------
   📦 INVENTARIO DE PINES
------------------------------------------------------------------ */
router.get("/pines", async (req, res) => {
  try {
    const [rows] = await db.query(`
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
    `);
    res.json(rows);
  } catch (error) {
    console.error("❌ Error obteniendo inventario de pines:", error);
    res.status(500).json({ error: "Error al obtener inventario de pines" });
  }
});

/* ------------------------------------------------------------------
   🧱 INVENTARIO DE MATERIA PRIMA
------------------------------------------------------------------ */
router.get("/materia-prima", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT id_material, nombre, cantidad, stock_minimo, unidad
      FROM materia_prima
    `);
    res.json(rows);
  } catch (error) {
    console.error("❌ Error obteniendo materia prima:", error);
    res.status(500).json({ error: "Error al obtener materia prima" });
  }
});

/* ------------------------------------------------------------------
   🔄 INVENTARIO COMPLETO (PINES + MATERIA PRIMA)
------------------------------------------------------------------ */
router.get("/", async (req, res) => {
  try {
    const [pines] = await db.query(`
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
    `);

    const [materiaPrima] = await db.query(`
      SELECT id_material, nombre, cantidad, stock_minimo, unidad
      FROM materia_prima
    `);

    res.json({ inventario: pines, materiaPrima });
  } catch (error) {
    console.error("❌ Error obteniendo inventario completo:", error);
    res.status(500).json({ error: "Error al obtener inventario completo" });
  }
});

/* ------------------------------------------------------------------
   🧾 REGISTRAR MOVIMIENTOS DE INVENTARIO
------------------------------------------------------------------ */
/**
 * POST /api/inventario/movimientos
 * Registra una entrada o salida del inventario de pines
 * Body esperado:
 * {
 *   "id_pin": 1,
 *   "tipo": "entrada" | "salida",
 *   "cantidad": 10,
 *   "motivo": "producción" | "venta" | "ajuste",
 *   "id_usuario": 1
 * }
 */
router.post("/movimientos", async (req, res) => {
  try {
    const { id_pin, tipo, cantidad, motivo, id_usuario } = req.body;

    if (!id_pin || !tipo || !cantidad) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // 1️⃣ Registrar el movimiento
      const [result] = await connection.query(
        "INSERT INTO movimientos_inventario (id_pin, tipo, cantidad, motivo, id_usuario) VALUES (?, ?, ?, ?, ?)",
        [id_pin, tipo, cantidad, motivo || "", id_usuario || null]
      );

      // 2️⃣ Actualizar inventario según tipo
      if (tipo === "entrada") {
        await connection.query(
          "UPDATE inventario_pines SET cantidad = cantidad + ? WHERE id_pin = ?",
          [cantidad, id_pin]
        );
      } else if (tipo === "salida") {
        await connection.query(
          "UPDATE inventario_pines SET cantidad = cantidad - ? WHERE id_pin = ?",
          [cantidad, id_pin]
        );
      }

      await connection.commit();

      res.json({
        mensaje: "Movimiento registrado con éxito",
        id_movimiento: result.insertId,
      });
    } catch (error) {
      await connection.rollback();
      console.error("❌ Error registrando movimiento:", error.message);
      res.status(500).json({ error: "Error registrando movimiento" });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("❌ Error general en /movimientos:", error.message);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

/* ------------------------------------------------------------------
   📜 HISTORIAL DE MOVIMIENTOS
------------------------------------------------------------------ */
/**
 * GET /api/inventario/movimientos
 * Devuelve todos los movimientos realizados
 */
router.get("/movimientos", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        m.id_movimiento, 
        m.id_pin, 
        p.url_imagen, 
        p.tamano,
        m.tipo, 
        m.cantidad, 
        m.motivo, 
        m.fecha_movimiento, 
        m.id_usuario
      FROM movimientos_inventario m
      JOIN pines p ON m.id_pin = p.id_pin
      ORDER BY m.fecha_movimiento DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error("❌ Error obteniendo movimientos:", error.message);
    res.status(500).json({ error: "Error al obtener movimientos" });
  }
});

// Registrar venta de un pin
router.post("/venta", async (req, res) => {
  const { id_pin, cantidad, descripcion } = req.body;

  if (!id_pin || !cantidad) {
    return res.status(400).json({ error: "Datos incompletos" });
  }

  try {
    const conn = await pool.getConnection();

    // 1. Obtener stock actual
    const [pinRows] = await conn.query(
      "SELECT stock_actual FROM inventario_pines WHERE id_pin = ?",
      [id_pin]
    );

    if (pinRows.length === 0) {
      conn.release();
      return res.status(404).json({ error: "Pin no encontrado" });
    }

    const stockActual = pinRows[0].stock_actual;

    if (cantidad > stockActual) {
      conn.release();
      return res
        .status(400)
        .json({ error: "La cantidad supera el stock disponible" });
    }

    // 2. Restar stock
    await conn.query(
      "UPDATE inventario_pines SET stock_actual = stock_actual - ? WHERE id_pin = ?",
      [cantidad, id_pin]
    );

    // 3. Insertar movimiento
    await conn.query(
      `INSERT INTO movimientos_inventario 
       (id_pin, tipo_movimiento, cantidad, motivo, fecha) 
       VALUES (?, "venta", ?, ?, NOW())`,
      [id_pin, cantidad, descripcion || "Venta registrada"]
    );

    conn.release();
    res.json({ success: true, message: "Venta registrada correctamente" });
  } catch (error) {
    console.error("Error registrando venta:", error);
    res.status(500).json({ error: "Error interno al registrar venta" });
  }
});

export default router;