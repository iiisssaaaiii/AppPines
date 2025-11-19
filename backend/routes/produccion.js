// backend/routes/produccion.js
import express from "express";
import db from "../config/db.js";
import multer from "multer";
import path from "path";

const router = express.Router();

// Configuración de multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// POST /api/produccion/upload
router.post("/upload", upload.single("imagen"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No se subió ninguna imagen" });
    }

    const archivo = req.file.filename;
    const ruta = "/uploads/";
    const nombre = req.file.originalname || archivo;
    const mime = req.file.mimetype || null;
    const size = req.file.size || null;

    const [result] = await db.query(
      `INSERT INTO imagenes (nombre, archivo, ruta, mime_type, tamano_bytes)
       VALUES (?, ?, ?, ?, ?)`,
      [nombre, archivo, ruta, mime, size]
    );

    const id_imagen = result.insertId;
    const url = `http://localhost:4000${ruta}${archivo}`;

    return res.json({ id_imagen, url });
  } catch (error) {
    console.error("Error subiendo imagen:", error);
    return res.status(500).json({ error: "Error al subir la imagen" });
  }
});

// POST /api/produccion/procesar
// Body: { tamano, slots: [{ id_imagen, posicion }], id_usuario }
router.post("/procesar", async (req, res) => {
  const { tamano, slots, id_usuario } = req.body;

  if (!tamano || !["pequeno", "grande"].includes(tamano)) {
    return res.status(400).json({ error: "Tamaño inválido" });
  }

  if (!Array.isArray(slots) || slots.length === 0) {
    return res
      .status(400)
      .json({ error: "No se recibieron slots de producción" });
  }

  for (const slot of slots) {
    if (!slot.id_imagen) {
      return res
        .status(400)
        .json({ error: "Todos los slots deben tener id_imagen" });
    }
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const cantidadPines = slots.length;

    // precio por defecto según tamaño
    const precioPorDefecto = tamano === "grande" ? 20 : 10;

    // plantilla
    const [resultPlantilla] = await connection.query(
      `INSERT INTO plantilla (tamano, cantidad, id_usuario)
       VALUES (?, ?, ?)`,
      [tamano, cantidadPines, id_usuario || null]
    );
    const idPlantilla = resultPlantilla.insertId;

    // plantilla_detalle
    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
      const posicion = slot.posicion ?? i;

      await connection.query(
        `INSERT INTO plantilla_detalle (id_plantilla, id_imagen, posicion)
         VALUES (?, ?, ?)`,
        [idPlantilla, slot.id_imagen, posicion]
      );
    }

    // agrupar por imagen y asegurar pines
    const produccionPorImagen = new Map();
    for (const slot of slots) {
      const actual = produccionPorImagen.get(slot.id_imagen) || 0;
      produccionPorImagen.set(slot.id_imagen, actual + 1);
    }

    const imagenToPinId = new Map();

    for (const [idImagen] of produccionPorImagen.entries()) {
      const [rowsPin] = await connection.query(
        `SELECT id_pin, precio
         FROM pines
         WHERE id_imagen = ? AND tamano = ?`,
        [idImagen, tamano]
      );

      let idPin;

      if (rowsPin.length > 0) {
        idPin = rowsPin[0].id_pin;

        // si el pin ya existe pero tiene precio 0 o NULL, lo actualizamos
        await connection.query(
          `UPDATE pines
           SET precio = CASE
             WHEN precio IS NULL OR precio = 0 THEN ?
             ELSE precio
           END
           WHERE id_pin = ?`,
          [precioPorDefecto, idPin]
        );
      } else {
        const [resultPin] = await connection.query(
          `INSERT INTO pines (id_imagen, tamano, precio)
           VALUES (?, ?, ?)`,
          [idImagen, tamano, precioPorDefecto]
        );
        idPin = resultPin.insertId;
      }

      imagenToPinId.set(idImagen, idPin);
    }

    // actualizar inventario_pines + movimientos_inventario
    const produccionPorPin = new Map();
    for (const slot of slots) {
      const idImagen = slot.id_imagen;
      const idPin = imagenToPinId.get(idImagen);
      const actual = produccionPorPin.get(idPin) || 0;
      produccionPorPin.set(idPin, actual + 1);
    }

    const resumenPines = [];

    for (const [idPin, cantidad] of produccionPorPin.entries()) {
      const [rowsInv] = await connection.query(
        `SELECT id_inventario, cantidad
         FROM inventario_pines
         WHERE id_pin = ?`,
        [idPin]
      );

      if (rowsInv.length > 0) {
        await connection.query(
          `UPDATE inventario_pines
           SET cantidad = cantidad + ?
           WHERE id_inventario = ?`,
          [cantidad, rowsInv[0].id_inventario]
        );
      } else {
        await connection.query(
          `INSERT INTO inventario_pines (id_pin, cantidad)
           VALUES (?, ?)`,
          [idPin, cantidad]
        );
      }

      await connection.query(
        `INSERT INTO movimientos_inventario
         (id_pin, tipo, cantidad, motivo, id_usuario)
         VALUES (?, 'entrada', ?, 'produccion plantilla', ?)`,
        [idPin, cantidad, id_usuario || null]
      );

      resumenPines.push({ id_pin: idPin, cantidad_producida: cantidad });
    }

    // consumo materia prima
    const totalPines = cantidadPines;

    const [consumos] = await connection.query(
      `SELECT id_material, cantidad_por_pin
       FROM consumo_materia
       WHERE tamano = ?`,
      [tamano]
    );

    const resumenMateria = [];

    for (const consumo of consumos) {
      const totalUso =
        Number(consumo.cantidad_por_pin) * Number(totalPines || 0);

      await connection.query(
        `UPDATE materia_prima
         SET cantidad = cantidad - ?
         WHERE id_material = ?`,
        [totalUso, consumo.id_material]
      );

      resumenMateria.push({
        id_material: consumo.id_material,
        cantidad_usada: totalUso,
      });
    }

    await connection.commit();
    connection.release();

    return res.json({
      ok: true,
      mensaje: "Producción registrada correctamente",
      id_plantilla: idPlantilla,
      total_pines: totalPines,
      pines_producidos: resumenPines,
      materia_consumida: resumenMateria,
    });
  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error("Error procesando producción:", error);
    return res
      .status(500)
      .json({ error: "Error procesando producción", detalle: error.message });
  }
});

export default router;