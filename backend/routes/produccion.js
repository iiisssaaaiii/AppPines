// backend/routes/produccion.js
import express from "express";
import db from "../config/db.js";
import multer from "multer";
import path from "path";

const router = express.Router();

// ⚙️ Configuración de multer para guardar imágenes en /uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Carpeta donde se guardan las imágenes
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Nombre único
  },
});

const upload = multer({ storage });

/**
 * 📌 POST /api/produccion/upload
 * Sube solo la imagen y devuelve la URL pública
 */
router.post("/upload", upload.single("imagen"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No se subió ninguna imagen" });
  }

  const url = `http://localhost:4000/uploads/${req.file.filename}`;
  res.json({ url });
});

/**
 * 📌 POST /api/produccion
 * Registra la producción de pines
 * Body esperado (form-data o JSON):
 *  - imagen (archivo) o url_imagen (string)
 *  - etiquetas (texto)
 *  - tamano (texto: 'pequeno' | 'grande')
 *  - cantidad (número)
 *  - id_usuario (número)
 */
router.post("/", upload.single("imagen"), async (req, res) => {
  console.log("📦 Producción recibida:", req.body);

  const { etiquetas, tamano, cantidad, id_usuario } = req.body;
  const url_imagen = req.file
    ? `/uploads/${req.file.filename}`
    : req.body.url_imagen;

  if (!url_imagen || !tamano || !cantidad) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }

  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    // 1. Buscar si ya existe el pin con misma url + tamaño
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

    // 2. Actualizar inventario
    await connection.query(
      `INSERT INTO inventario_pines (id_pin, cantidad)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE cantidad = cantidad + VALUES(cantidad)`,
      [pinId, cantidad]
    );

    // 3. Descontar materia prima
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

    // 4. Registrar movimiento interno (en ventas)
    await connection.query(
      "INSERT INTO ventas (id_usuario, total) VALUES (?, ?)",
      [id_usuario || 1, 0]
    );

    await connection.commit();
    res.json({
      mensaje: "Producción registrada con éxito",
      id_pin: pinId,
      imagen: url_imagen,
    });
  } catch (error) {
    await connection.rollback();
    console.error("❌ Error registrando producción:", error.message);
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
});

  /**
 * 📌 POST /api/produccion/guardarPlantilla
 * Guarda los pines actuales en la tabla Plantilla
 */
router.post("/guardarPlantilla", async (req, res) => {
  console.log("📩 Solicitud recibida en /api/produccion/guardarPlantilla");
  console.log("Body recibido:", req.body);

  try {
    const { etiquetas, tamano, cantidad, url_imagen, id_usuario } = req.body;

    if (!etiquetas || !tamano || !cantidad || !url_imagen) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    const connection = await db.getConnection();
    const query = `
      INSERT INTO Plantilla (etiquetas, tamano, cantidad, url_imagen, id_usuario)
      VALUES (?, ?, ?, ?, ?)
    `;
    await connection.query(query, [etiquetas, tamano, cantidad, url_imagen, id_usuario]);
    connection.release();

    res.json({ mensaje: "Plantilla guardada correctamente" });
  } catch (error) {
    console.error("❌ Error al guardar en Plantilla:", error);
    res.status(500).json({ error: "Error al guardar la plantilla" });
  }
});

export default router;
