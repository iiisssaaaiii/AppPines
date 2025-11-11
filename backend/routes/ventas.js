import express from 'express';
import db from '../config/db.js';

const router = express.Router();

/**
 * ✅ POST /api/ventas/crear
 * Crea una nueva venta y asocia las etiquetas de los pines vendidos a la venta.
 * Body esperado: { clienteId, pines: [{ id_pin, cantidad, precio }] }
 */
router.post("/crear", async (req, res) => {
  const { clienteId, pines } = req.body;  // pines es un array de objetos con id_pin, cantidad, y precio

  try {
    const conn = await db.getConnection();
    await conn.beginTransaction();

    // Validación de los datos recibidos
    for (let pin of pines) {
      const { cantidad, precio } = pin;
      
      // Validar que la cantidad y el precio sean números positivos
      if (cantidad <= 0 || precio <= 0) {
        return res.status(400).json({ error: "La cantidad y el precio deben ser mayores a 0" });
      }

      // Verificar que el pin existe antes de procesar
      const [pinExist] = await conn.query("SELECT id_pin FROM pines WHERE id_pin = ?", [pin.id_pin]);
      if (pinExist.length === 0) {
        return res.status(404).json({ error: `Pin con id ${pin.id_pin} no encontrado` });
      }
    }

    // Crear la venta
    const [ventaResult] = await conn.query(
      "INSERT INTO ventas (cliente_id, fecha) VALUES (?, ?)",
      [clienteId, new Date()]
    );

    const ventaId = ventaResult.insertId;

    // Crear detalle de la venta (los pines comprados)
    for (let pin of pines) {
      const { id_pin, cantidad, precio } = pin;  // Desestructuramos los valores de cada pin

      // Insertar el detalle de la venta (incluyendo el precio)
      const [detalleResult] = await conn.query(
        "INSERT INTO venta_detalle (venta_id, pin_id, cantidad, precio) VALUES (?, ?, ?, ?)",
        [ventaId, id_pin, cantidad, precio]
      );

      // Obtener etiquetas del pin
      const [tags] = await conn.query(
        "SELECT t.id_tag FROM tags t JOIN pin_tags pt ON t.id_tag = pt.id_tag WHERE pt.id_pin = ?",
        [id_pin]
      );

      // Asociar las etiquetas a la venta
      for (let tag of tags) {
        await conn.query(
          "INSERT INTO venta_tags (id_venta, id_tag) VALUES (?, ?)",
          [ventaId, tag.id_tag]
        );
      }
    }

    await conn.commit();
    res.json({ mensaje: "Venta creada con éxito", venta_id: ventaId });
  } catch (err) {
    await conn.rollback();
    console.error("❌ Error al crear la venta:", err.message);
    res.status(500).json({ error: "Error creando la venta" });
  } finally {
    conn.release();
  }
});

export default router;
