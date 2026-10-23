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
        m.practice_id AS practiceId,
        m.name,
        m.location,
        m.customer,
        m.responsible,
        m.status,
        m.notes,
        m.created_by AS createdBy,
        m.created_at AS createdAt,
        m.updated_at AS updatedAt,
        p.code AS practiceCode,
        p.title AS practiceTitle,
        COUNT(mb.id) AS bagsCount
      FROM maps m
      LEFT JOIN practices p
        ON p.id = m.practice_id
      LEFT JOIN map_bags mb
        ON mb.map_id = m.id
      GROUP BY
        m.id,
        m.practice_id,
        m.name,
        m.location,
        m.customer,
        m.responsible,
        m.status,
        m.notes,
        m.created_by,
        m.created_at,
        m.updated_at,
        p.code,
        p.title
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
 * GET /api/maps/practice/:practiceId
 * Recupera la mappa associata a una pratica.
 */
router.get("/practice/:practiceId", async (req, res) => {
  try {
    const { practiceId } = req.params;

    const [rows] = await db.query(
      `
        SELECT
          m.id,
          m.practice_id AS practiceId,
          m.name,
          m.location,
          m.customer,
          m.responsible,
          m.status,
          m.notes,
          m.created_by AS createdBy,
          m.created_at AS createdAt,
          m.updated_at AS updatedAt,
          p.code AS practiceCode,
          p.title AS practiceTitle
        FROM maps m
        INNER JOIN practices p
          ON p.id = m.practice_id
        WHERE m.practice_id = ?
      `,
      [practiceId]
    );

    const maps = rows as any[];

    if (maps.length === 0) {
      res.status(404).json({
        message: "Nessuna mappa associata alla pratica",
      });
      return;
    }

    const map = maps[0];

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
      [map.id]
    );

    res.json({
      ...map,
      bags,
    });
  } catch (error) {
    console.error("Error loading practice map:", error);

    res.status(500).json({
      message:
        "Errore durante il recupero della mappa della pratica",
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
          m.id,
          m.practice_id AS practiceId,
          m.name,
          m.location,
          m.customer,
          m.responsible,
          m.status,
          m.notes,
          m.created_by AS createdBy,
          m.created_at AS createdAt,
          m.updated_at AS updatedAt,
          p.code AS practiceCode,
          p.title AS practiceTitle
        FROM maps m
        LEFT JOIN practices p
          ON p.id = m.practice_id
        WHERE m.id = ?
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
 * Crea la mappa associata a una pratica.
 *
 * Una pratica può avere una sola mappa.
 */
router.post("/", async (req, res) => {
  try {
    const {
      practiceId,
      name,
      location,
      responsible,
      notes,
      createdBy,
    } = req.body;

    if (
      !practiceId ||
      !name ||
      !location ||
      !responsible
    ) {
      res.status(400).json({
        message:
          "Pratica, nome, luogo e responsabile sono obbligatori",
      });
      return;
    }

    /*
     * Recuperiamo la pratica.
     * Il cliente della mappa deriva direttamente
     * dalla pratica e non viene inserito manualmente.
     */
    const [practiceRows] = await db.query(
      `
        SELECT
          id,
          code,
          title,
          customer
        FROM practices
        WHERE id = ?
      `,
      [practiceId]
    );

    const practices = practiceRows as any[];

    if (practices.length === 0) {
      res.status(404).json({
        message: "Pratica non trovata",
      });
      return;
    }

    const practice = practices[0];

    /*
     * Verifica applicativa 1 pratica = 1 mappa.
     * Il database protegge comunque il vincolo
     * tramite UNIQUE(practice_id).
     */
    const [existingRows] = await db.query(
      `
        SELECT id
        FROM maps
        WHERE practice_id = ?
        LIMIT 1
      `,
      [practiceId]
    );

    const existingMaps = existingRows as any[];

    if (existingMaps.length > 0) {
      res.status(409).json({
        message:
          "Questa pratica ha già una mappa associata",
        mapId: existingMaps[0].id,
      });
      return;
    }

    const [result] = await db.execute(
      `
        INSERT INTO maps (
          practice_id,
          name,
          location,
          customer,
          responsible,
          status,
          notes,
          created_by
        )
        VALUES (?, ?, ?, ?, ?, 'DRAFT', ?, ?)
      `,
      [
        practiceId,
        name,
        location,
        practice.customer,
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
      practiceId: Number(practiceId),
      practiceCode: practice.code,
      practiceTitle: practice.title,
      name,
      location,
      customer: practice.customer,
      responsible,
      status: "DRAFT",
      notes: notes || null,
      createdBy: createdBy || null,
      bags: [],
    });
  } catch (error: any) {
    console.error("Error creating map:", error);

    if (error?.code === "ER_DUP_ENTRY") {
      res.status(409).json({
        message:
          "Questa pratica ha già una mappa associata",
      });
      return;
    }

    res.status(500).json({
      message: "Errore durante la creazione della mappa",
    });
  }
});

export default router;