import express from "express";
import db from "../config/db.js";

const router = express.Router();

router.get("/", async(req, res) => {
    try {
        const[rows] = await db.query("SELECT * FROM plantilla ORDER BY fecha_guardado DESC");
        res.json(rows);
    } catch(error) {
        console.error("❌ Error al obtener catálogo:", error);
        res.status(500).json({ error: "Error al obtener el catálogo" })
    }
});

export default router;
