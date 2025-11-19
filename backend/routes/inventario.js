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
        img.nombre AS nombre_pin,
        CONCAT(img.ruta, img.archivo) AS url_imagen,
        IFNULL(
          GROUP_CONCAT(DISTINCT t.nombre ORDER BY t.nombre SEPARATOR ', '),
          ''
        ) AS etiquetas,
        p.tamano,
        IFNULL(i.cantidad, 0) AS stock_actual,
        p.precio,
        p.fecha_creacion,
        DATEDIFF(CURDATE(), DATE(p.fecha_creacion)) AS tiempo_en_stock
      FROM pines p
      JOIN imagenes img ON p.id_imagen = img.id_imagen
      LEFT JOIN inventario_pines i ON i.id_pin = p.id_pin
      LEFT JOIN pin_tags pt ON pt.id_imagen = img.id_imagen
      LEFT JOIN tags t ON t.id_tag = pt.id_tag
      GROUP BY
        p.id_pin,
        img.nombre,
        img.ruta,
        img.archivo,
        p.tamano,
        i.cantidad,
        p.precio,
        p.fecha_creacion
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
      SELECT
        id_material AS id_materia_prima,
        nombre,
        descripcion,
        cantidad AS stock_actual,
        stock_minimo,
        unidad
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
        img.nombre AS nombre_pin,
        CONCAT(img.ruta, img.archivo) AS url_imagen,
        IFNULL(
          GROUP_CONCAT(DISTINCT t.nombre ORDER BY t.nombre SEPARATOR ', '),
          ''
        ) AS etiquetas,
        p.tamano,
        IFNULL(i.cantidad, 0) AS stock_actual,
        p.precio,
        p.fecha_creacion,
        DATEDIFF(CURDATE(), DATE(p.fecha_creacion)) AS tiempo_en_stock
      FROM pines p
      JOIN imagenes img ON p.id_imagen = img.id_imagen
      LEFT JOIN inventario_pines i ON i.id_pin = p.id_pin
      LEFT JOIN pin_tags pt ON pt.id_imagen = img.id_imagen
      LEFT JOIN tags t ON t.id_tag = pt.id_tag
      GROUP BY
        p.id_pin,
        img.nombre,
        img.ruta,
        img.archivo,
        p.tamano,
        i.cantidad,
        p.precio,
        p.fecha_creacion
    `);

    const [materiaPrima] = await db.query(`
      SELECT
        id_material AS id_materia_prima,
        nombre,
        descripcion,
        cantidad AS stock_actual,
        stock_minimo,
        unidad
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
router.post("/movimientos", async (req, res) => {
  try {
    const { id_pin, tipo, cantidad, motivo, id_usuario } = req.body;

    if (!id_pin || !tipo || !cantidad) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      const [result] = await connection.query(
        `INSERT INTO movimientos_inventario
         (id_pin, tipo, cantidad, motivo, id_usuario)
         VALUES (?, ?, ?, ?, ?)`,
        [id_pin, tipo, cantidad, motivo || "", id_usuario || null]
      );

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
router.get("/movimientos", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        m.id_movimiento, 
        m.id_pin, 
        p.tamano,
        m.tipo, 
        m.cantidad, 
        m.motivo, 
        m.fecha_movimiento, 
        m.id_usuario,
        CONCAT(img.ruta, img.archivo) AS url_imagen
      FROM movimientos_inventario m
      JOIN pines p ON m.id_pin = p.id_pin
      JOIN imagenes img ON p.id_imagen = img.id_imagen
      ORDER BY m.fecha_movimiento DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error("❌ Error obteniendo movimientos:", error.message);
    res.status(500).json({ error: "Error al obtener movimientos" });
  }
});

/* ------------------------------------------------------------------
   🧾 REGISTRAR VENTA DE UN PIN
------------------------------------------------------------------ */
// Body esperado: { id_pin, cantidad, descripcion }
router.post("/venta", async (req, res) => {
  const { id_pin, cantidad, descripcion } = req.body;

  if (!id_pin || !cantidad) {
    return res.status(400).json({ error: "Datos incompletos" });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1️⃣ Verificar stock
    const [invRows] = await connection.query(
      `SELECT cantidad
       FROM inventario_pines
       WHERE id_pin = ?
       FOR UPDATE`,
      [id_pin]
    );

    if (invRows.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({ error: "Pin no encontrado en inventario" });
    }

    const stockActual = invRows[0].cantidad;
    if (cantidad > stockActual) {
      await connection.rollback();
      connection.release();
      return res
        .status(400)
        .json({ error: "La cantidad supera el stock disponible" });
    }

    // 2️⃣ Obtener info del pin
    const [pinRows] = await connection.query(
      `SELECT id_pin, precio, id_imagen
       FROM pines
       WHERE id_pin = ?`,
      [id_pin]
    );

    if (pinRows.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({ error: "Pin no encontrado" });
    }

    const pin = pinRows[0];
    const subtotal = Number(pin.precio) * Number(cantidad);
    const idUsuario = 1; // luego puedes leerlo del usuario logueado

    // 3️⃣ Crear venta
    const [ventaRes] = await connection.query(
      `INSERT INTO ventas (id_usuario, total)
       VALUES (?, ?)`,
      [idUsuario, subtotal]
    );
    const idVenta = ventaRes.insertId;

    // 4️⃣ Detalle de venta
    await connection.query(
      `INSERT INTO venta_detalle
       (id_venta, id_pin, cantidad, precio, subtotal)
       VALUES (?, ?, ?, ?, ?)`,
      [idVenta, id_pin, cantidad, pin.precio, subtotal]
    );

    // 5️⃣ Descontar inventario
    await connection.query(
      `UPDATE inventario_pines
       SET cantidad = cantidad - ?
       WHERE id_pin = ?`,
      [cantidad, id_pin]
    );

    // 6️⃣ Registrar movimiento de inventario (salida por venta)
    await connection.query(
      `INSERT INTO movimientos_inventario
       (id_pin, tipo, cantidad, motivo, id_usuario)
       VALUES (?, 'salida', ?, ?, ?)`,
      [id_pin, cantidad, descripcion || "Venta registrada", idUsuario]
    );

    // 7️⃣ Registrar tags en venta_tags
    const [tagsRows] = await connection.query(
      `SELECT pt.id_tag
       FROM pines p
       JOIN pin_tags pt ON pt.id_imagen = p.id_imagen
       WHERE p.id_pin = ?`,
      [id_pin]
    );

    for (const row of tagsRows) {
      await connection.query(
        `INSERT INTO venta_tags (id_venta, id_tag, cantidad)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE
           cantidad = cantidad + VALUES(cantidad)`,
        [idVenta, row.id_tag, cantidad]
      );
    }

    await connection.commit();
    connection.release();

    return res.json({
      ok: true,
      mensaje: "Venta registrada correctamente",
      id_venta: idVenta,
      stock_restante: stockActual - cantidad,
    });
  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error("Error registrando venta:", error);
    return res
      .status(500)
      .json({ error: "Error interno al registrar venta" });
  }
});

export default router;
