import { pool } from "../db/database.js";

export interface TechnicianRecord {
  id: number;
  email: string;
  password_hash: string;
}

export class TechniciansRepository {
  async findByEmail(email: string): Promise<TechnicianRecord | null> {
    const result = await pool.query<TechnicianRecord>(
      `
        SELECT id, email, password_hash
        FROM technicians
        WHERE email = $1
        LIMIT 1
      `,
      [email]
    );

    return result.rows[0] ?? null;
  }

  async count(): Promise<number> {
    const result = await pool.query<{ total: string }>(
      "SELECT count(*)::text AS total FROM technicians"
    );

    return Number(result.rows[0]?.total ?? 0);
  }

  async create(email: string, passwordHash: string): Promise<void> {
    await pool.query(
      `
        INSERT INTO technicians (email, password_hash, updated_at)
        VALUES ($1, $2, now())
      `,
      [email, passwordHash]
    );
  }
}

export const techniciansRepository = new TechniciansRepository();