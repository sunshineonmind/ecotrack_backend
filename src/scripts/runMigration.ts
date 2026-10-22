import "dotenv/config";
import fs from "fs";
import path from "path";
import { db } from "../config/database";

async function runMigration() {
  try {
    const migrationPath = path.resolve(
      process.cwd(),
      "sql/001_create_maps.sql"
    );

    const sql = fs.readFileSync(migrationPath, "utf8");

    const statements = sql
      .split(";")
      .map((statement) => statement.trim())
      .filter(Boolean);

    console.log(`Running ${statements.length} SQL statements...`);

    for (const statement of statements) {
      await db.query(statement);
    }

    console.log("Migration completed successfully.");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exitCode = 1;
  } finally {
    await db.end();
  }
}

runMigration();