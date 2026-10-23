import "dotenv/config";
import fs from "fs";
import path from "path";
import { db } from "../config/database";

async function runMigration() {
  try {
    const migrationsDirectory = path.resolve(
      process.cwd(),
      "sql"
    );

    const migrationFiles = fs
      .readdirSync(migrationsDirectory)
      .filter((file) => file.endsWith(".sql"))
      .sort();

    console.log(
      `Found ${migrationFiles.length} migration files.`
    );

    for (const file of migrationFiles) {
      console.log(`Running migration: ${file}`);

      const migrationPath = path.join(
        migrationsDirectory,
        file
      );

      const sql = fs.readFileSync(
        migrationPath,
        "utf8"
      );

      const statements = sql
        .split(";")
        .map((statement) => statement.trim())
        .filter(Boolean);

      for (const statement of statements) {
        await db.query(statement);
      }

      console.log(`Migration completed: ${file}`);
    }

    console.log(
      "All migrations completed successfully."
    );
  } catch (error) {
    console.error("Migration failed:", error);
    process.exitCode = 1;
  } finally {
    await db.end();
  }
}

runMigration();