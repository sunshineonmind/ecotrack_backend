import { Router } from "express";
import { db } from "../config/database";

const router = Router();

/**
 * GET /api/maps
 * Recupera tutte le mappe.
 */
router.get("/", async (_req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        m.id,
        m.name,
        m.location,
        m.customer,
        m.responsible,
        m.status,
        m.notes,
        m.created_by AS createdBy,
        m.created_at AS createdAt,
        m.updated_at AS updatedAt,
        COUNT(mb.id) AS bagsCount
      FROM maps m
      LEFT JOIN map_bags mb
        ON mb.map_id = m.id
      GROUP BY m.id
      ORDER BY m.updated_at DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error("Error loading maps:", error);

    res.status(500).json({
      message: "Errore durante il recupero delle mappe",
    });
  }
});

/**
 * GET /api/maps/:id
 * Recupera una singola mappa.
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `
        SELECT
          id,
          name,
          location,
          customer,
          responsible,
          status,
          notes,
          created_by AS createdBy,
          created_at AS createdAt,
          updated_at AS updatedAt
        FROM maps
        WHERE id = ?
      `,
      [id]
    );

    const maps = rows as any[];

    if (maps.length === 0) {
      res.status(404).json({
        message: "Mappa non trovata",
      });
      return;
    }

    const [bags] = await db.query(
      `
        SELECT
          id,
          code,
          description,
          eer_code AS eerCode,
          color,
          quantity,
          unit,
          packaging_date AS packagingDate,
          operator_name AS operatorName,
          position_x AS positionX,
          position_y AS positionY,
          position_z AS positionZ,
          notes,
          created_at AS createdAt,
          updated_at AS updatedAt
        FROM map_bags
        WHERE map_id = ?
        ORDER BY position_y, position_x, position_z
      `,
      [id]
    );

    res.json({
      ...maps[0],
      bags,
    });
  } catch (error) {
    console.error("Error loading map:", error);

    res.status(500).json({
      message: "Errore durante il recupero della mappa",
    });
  }
});

/**
 * POST /api/maps
 * Crea una nuova mappa.
 */
router.post("/", async (req, res) => {
  try {
    const {
      name,
      location,
      customer,
      responsible,
      notes,
      createdBy,
    } = req.body;

    if (!name || !location || !customer || !responsible) {
      res.status(400).json({
        message:
          "Nome, luogo, cliente e responsabile sono obbligatori",
      });
      return;
    }

    const [result] = await db.execute(
      `
        INSERT INTO maps (
          name,
          location,
          customer,
          responsible,
          status,
          notes,
          created_by
        )
        VALUES (?, ?, ?, ?, 'DRAFT', ?, ?)
      `,
      [
        name,
        location,
        customer,
        responsible,
        notes || null,
        createdBy || null,
      ]
    );

    const insertResult = result as {
      insertId: number;
    };

    res.status(201).json({
      id: insertResult.insertId,
      name,
      location,
      customer,
      responsible,
      status: "DRAFT",
      notes: notes || null,
      createdBy: createdBy || null,
    });
  } catch (error) {
    console.error("Error creating map:", error);

    res.status(500).json({
      message: "Errore durante la creazione della mappa",
    });
  }
});

export default router;