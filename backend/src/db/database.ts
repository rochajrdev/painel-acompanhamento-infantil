import { Pool } from "pg";
import { env } from "../config/env.js";
import { databaseSchemaSql } from "./schema.js";

export const pool = new Pool({
  connectionString: env.DATABASE_URL
});

pool.on("error", (error) => {
  console.error(error);
});

export async function initializeDatabase() {
  await pool.query(databaseSchemaSql);
}

export async function closeDatabase() {
  await pool.end();
}