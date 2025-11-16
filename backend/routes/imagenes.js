import express from "express";
import multer from "multer";
import path from "path";
import pool from "../config/db.js";

const router = express.Router();

/* ------------------------------------------------------
   1. CONFIGURACIÓN DE MULTER (Renombrado Dinámico)
--------------------------------------------------------- */

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads");
  },
  filename(req, file, cb) {
    const nombreUsuario = req.body.nombre || "imagen";
    const extension = path.extname(file.originalname) || ".png";

    const nombreFinal = `${nombreUsuario}${extension}`
      .toLowerCase()
      .replace(/\s+/g, "_");

    cb(null, nombreFinal);
  },
});

const upload = multer({ storage });

/* ------------------------------------------------------
   2. Función asignarTags(idImagen, tags)
--------------------------------------------------------- */

async function asignarTags(idImagen, tags) {
  await pool.query("DELETE FROM pin_tags WHERE id_imagen = ?", [idImagen]);

  for (const tag of tags) {
    const [t] = await pool.query(
      "SELECT id_tag, color FROM tags WHERE nombre = ?",
      [tag.label]
    );

    let id_tag;

    if (t.length === 0) {
      const [result] = await pool.query(
        "INSERT INTO tags (nombre, color) VALUES (?, ?)",
        [tag.label, tag.color]
      );
      id_tag = result.insertId;
    } else {
      id_tag = t[0].id_tag;

      if (t[0].color !== tag.color) {
        await pool.query(
          "UPDATE tags SET color = ? WHERE id_tag = ?",
          [tag.color, id_tag]
        );
      }
    }

    await pool.query(
      "INSERT INTO pin_tags (id_imagen, id_tag) VALUES (?, ?)",
      [idImagen, id_tag]
    );
  }
}

/* ------------------------------------------------------
   3. GET /api/imagenes — Lista con tags
--------------------------------------------------------- */

router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        i.id_imagen,
        i.nombre,
        i.archivo,
        i.ruta,
        COALESCE(
          JSON_ARRAYAGG(
            JSON_OBJECT(
              'label', t.nombre,
              'color', t.color
            )
          ),
          JSON_ARRAY()
        ) AS tags_json
      FROM imagenes i
      LEFT JOIN pin_tags pt ON pt.id_imagen = i.id_imagen
      LEFT JOIN tags t ON t.id_tag = pt.id_tag
      GROUP BY i.id_imagen
      ORDER BY i.fecha_subida DESC;
    `);

    const resultado = rows.map((r) => ({
      id_imagen: r.id_imagen,
      nombre: r.nombre,
      archivo: r.archivo,
      ruta: r.ruta,
      url: `${r.ruta}${r.archivo}`,
      tags: Array.isArray(r.tags_json) ? r.tags_json : [],   // ← AQUÍ ESTÁ LA CLAVE
    }));

    res.json(resultado);

  } catch (error) {
    console.error("Error al obtener imágenes:", error);
    res.status(500).json({ error: "Error al obtener imágenes" });
  }
});

/* ------------------------------------------------------
   4. POST /api/imagenes — Subir imagen nueva
--------------------------------------------------------- */

router.post("/", upload.single("archivo"), async (req, res) => {
  try {
    const { nombre } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "No se recibió ninguna imagen" });
    }

    const archivo = req.file.filename;
    const ruta = "/uploads/";

    let tags = [];
    if (req.body.tags) {
      try {
        tags = JSON.parse(req.body.tags);
      } catch {
        tags = [];
      }
    }

    const [result] = await pool.query(
      "INSERT INTO imagenes (nombre, archivo, ruta) VALUES (?, ?, ?)",
      [nombre, archivo, ruta]
    );

    const id_imagen = result.insertId;

    await asignarTags(id_imagen, tags);

    res.json({ success: true, id_imagen });
  } catch (error) {
    console.error("Error al subir imagen:", error);
    res.status(500).json({ error: "Error al subir imagen" });
  }
});

/* ------------------------------------------------------
   5. PUT /api/imagenes/:id — Editar imagen
--------------------------------------------------------- */

router.put("/:id", upload.single("archivo"), async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;

    let updateQuery = "UPDATE imagenes SET nombre = ?";
    const updateValues = [nombre];

    if (req.file) {
      updateQuery += ", archivo = ?";
      updateValues.push(req.file.filename);
    }

    updateQuery += " WHERE id_imagen = ?";
    updateValues.push(id);

    await pool.query(updateQuery, updateValues);

    let tags = [];
    if (req.body.tags) {
      try {
        tags = JSON.parse(req.body.tags);
      } catch {
        tags = [];
      }
    }

    await asignarTags(id, tags);

    res.json({ success: true });
  } catch (error) {
    console.error("Error al editar imagen:", error);
    res.status(500).json({ error: "Error al editar imagen" });
  }
});

/* ------------------------------------------------------
   6. DELETE /api/imagenes/:id — Eliminar imagen
--------------------------------------------------------- */

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query("DELETE FROM imagenes WHERE id_imagen = ?", [id]);

    res.json({ success: true });
  } catch (error) {
    console.error("Error al eliminar imagen:", error);
    res.status(500).json({ error: "Error al eliminar imagen" });
  }
});

/* ------------------------------------------------------
   7. TAGS — GET Y POST
--------------------------------------------------------- */

router.get("/tags/lista", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id_tag, nombre AS label, color FROM tags ORDER BY nombre ASC"
    );
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener tags:", error);
    res.status(500).json({ error: "Error al obtener tags" });
  }
});

router.post("/tags", async (req, res) => {
  try {
    const { nombre, color } = req.body;

    const [result] = await pool.query(
      "INSERT INTO tags (nombre, color) VALUES (?, ?)",
      [nombre, color || "#243b53"]
    );

    res.json({ success: true, id_tag: result.insertId });
  } catch (error) {
    console.error("Error al crear tag:", error);
    res.status(500).json({ error: "Error al crear tag" });
  }
});

/* ------------------------------------------------------ */

export default router;
