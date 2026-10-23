import { Router } from "express";
import { db } from "../config/database";

const router = Router();

const VALID_STATUSES = [
  "DRAFT",
  "OPEN",
  "IN_PROGRESS",
  "COMPLETED",
  "CLOSED",
  "CANCELLED",
];

// LISTA PRATICHE
router.get("/", async (_req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        id,
        code,
        title,
        customer,
        producer,
        transporter,
        disposal_company AS disposalCompany,
        waste_code AS wasteCode,
        waste_description AS wasteDescription,
        status,
        notes,
        created_by AS createdBy,
        updated_by AS updatedBy,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM practices
      ORDER BY updated_at DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error("Error loading practices:", error);

    res.status(500).json({
      message: "Errore durante il recupero delle pratiche",
    });
  }
});

// DETTAGLIO PRATICA
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `
      SELECT
        id,
        code,
        title,
        customer,
        producer,
        transporter,
        disposal_company AS disposalCompany,
        waste_code AS wasteCode,
        waste_description AS wasteDescription,
        status,
        notes,
        created_by AS createdBy,
        updated_by AS updatedBy,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM practices
      WHERE id = ?
      `,
      [id]
    );

    const practices = rows as any[];

    if (practices.length === 0) {
      res.status(404).json({
        message: "Pratica non trovata",
      });
      return;
    }

    res.json(practices[0]);
  } catch (error) {
    console.error("Error loading practice:", error);

    res.status(500).json({
      message: "Errore durante il recupero della pratica",
    });
  }
});

// CREA PRATICA
router.post("/", async (req, res) => {
  try {
    const {
      code,
      title,
      customer,
      producer,
      transporter,
      disposalCompany,
      wasteCode,
      wasteDescription,
      notes,
      createdBy,
    } = req.body;

    if (!code || !title || !customer) {
      res.status(400).json({
        message: "Codice, titolo e cliente sono obbligatori",
      });
      return;
    }

    const [result] = await db.execute(
      `
      INSERT INTO practices (
        code,
        title,
        customer,
        producer,
        transporter,
        disposal_company,
        waste_code,
        waste_description,
        status,
        notes,
        created_by,
        updated_by
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'DRAFT', ?, ?, ?)
      `,
      [
        code,
        title,
        customer,
        producer || null,
        transporter || null,
        disposalCompany || null,
        wasteCode || null,
        wasteDescription || null,
        notes || null,
        createdBy || null,
        createdBy || null,
      ]
    );

    const insertResult = result as {
      insertId: number;
    };

    res.status(201).json({
      id: insertResult.insertId,
      code,
      title,
      customer,
      status: "DRAFT",
    });
  } catch (error: any) {
    console.error("Error creating practice:", error);

    if (error?.code === "ER_DUP_ENTRY") {
      res.status(409).json({
        message: "Esiste già una pratica con questo codice",
      });
      return;
    }

    res.status(500).json({
      message: "Errore durante la creazione della pratica",
    });
  }
});

// MODIFICA PRATICA
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const {
      code,
      title,
      customer,
      producer,
      transporter,
      disposalCompany,
      wasteCode,
      wasteDescription,
      notes,
      updatedBy,
    } = req.body;

    if (!code || !title || !customer) {
      res.status(400).json({
        message: "Codice, titolo e cliente sono obbligatori",
      });
      return;
    }

    const [result] = await db.execute(
      `
      UPDATE practices
      SET
        code = ?,
        title = ?,
        customer = ?,
        producer = ?,
        transporter = ?,
        disposal_company = ?,
        waste_code = ?,
        waste_description = ?,
        notes = ?,
        updated_by = ?
      WHERE id = ?
      `,
      [
        code,
        title,
        customer,
        producer || null,
        transporter || null,
        disposalCompany || null,
        wasteCode || null,
        wasteDescription || null,
        notes || null,
        updatedBy || null,
        id,
      ]
    );

    const updateResult = result as {
      affectedRows: number;
    };

    if (updateResult.affectedRows === 0) {
      res.status(404).json({
        message: "Pratica non trovata",
      });
      return;
    }

    res.json({
      message: "Pratica aggiornata correttamente",
    });
  } catch (error: any) {
    console.error("Error updating practice:", error);

    if (error?.code === "ER_DUP_ENTRY") {
      res.status(409).json({
        message: "Esiste già una pratica con questo codice",
      });
      return;
    }

    res.status(500).json({
      message: "Errore durante la modifica della pratica",
    });
  }
});

// CAMBIO STATO
router.patch("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, updatedBy } = req.body;

    if (!VALID_STATUSES.includes(status)) {
      res.status(400).json({
        message: "Stato non valido",
      });
      return;
    }

    const [result] = await db.execute(
      `
      UPDATE practices
      SET
        status = ?,
        updated_by = ?
      WHERE id = ?
      `,
      [
        status,
        updatedBy || null,
        id,
      ]
    );

    const updateResult = result as {
      affectedRows: number;
    };

    if (updateResult.affectedRows === 0) {
      res.status(404).json({
        message: "Pratica non trovata",
      });
      return;
    }

    res.json({
      id: Number(id),
      status,
      message: "Stato aggiornato correttamente",
    });
  } catch (error) {
    console.error("Error changing practice status:", error);

    res.status(500).json({
      message: "Errore durante il cambio stato",
    });
  }
});

// ELIMINA PRATICA
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.execute(
      `
      DELETE FROM practices
      WHERE id = ?
      `,
      [id]
    );

    const deleteResult = result as {
      affectedRows: number;
    };

    if (deleteResult.affectedRows === 0) {
      res.status(404).json({
        message: "Pratica non trovata",
      });
      return;
    }

    res.json({
      message: "Pratica eliminata correttamente",
    });
  } catch (error) {
    console.error("Error deleting practice:", error);

    res.status(500).json({
      message: "Errore durante l'eliminazione della pratica",
    });
  }
});

export default router;