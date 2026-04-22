import type { ChildRecord } from "../types/child.types.js";
import { pool } from "../db/database.js";

type ChildRow = ChildRecord;

function mapRow(row: ChildRow): ChildRecord {
  return row;
}

export class ChildrenRepository {
  async count(): Promise<number> {
    const result = await pool.query<{ total: string }>(
      "SELECT count(*)::text AS total FROM children"
    );

    return Number(result.rows[0]?.total ?? 0);
  }

  async upsertMany(children: ChildRecord[]): Promise<void> {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      for (const child of children) {
        await client.query(
          `
            INSERT INTO children (
              id,
              nome,
              data_nascimento,
              bairro,
              responsavel,
              saude,
              educacao,
              assistencia_social,
              revisado,
              revisado_por,
              revisado_em,
              updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, $8::jsonb, $9, $10, $11, now())
            ON CONFLICT (id) DO UPDATE SET
              nome = EXCLUDED.nome,
              data_nascimento = EXCLUDED.data_nascimento,
              bairro = EXCLUDED.bairro,
              responsavel = EXCLUDED.responsavel,
              saude = EXCLUDED.saude,
              educacao = EXCLUDED.educacao,
              assistencia_social = EXCLUDED.assistencia_social,
              revisado = EXCLUDED.revisado,
              revisado_por = EXCLUDED.revisado_por,
              revisado_em = EXCLUDED.revisado_em,
              updated_at = now()
          `,
          [
            child.id,
            child.nome,
            child.data_nascimento,
            child.bairro,
            child.responsavel,
            child.saude ? JSON.stringify(child.saude) : null,
            child.educacao ? JSON.stringify(child.educacao) : null,
            child.assistencia_social ? JSON.stringify(child.assistencia_social) : null,
            child.revisado,
            child.revisado_por,
            child.revisado_em
          ]
        );
      }

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async findAll(): Promise<ChildRecord[]> {
    const result = await pool.query<ChildRow>(
      `
        SELECT
          id,
          nome,
          data_nascimento::text AS data_nascimento,
          bairro,
          responsavel,
          saude,
          educacao,
          assistencia_social,
          revisado,
          revisado_por,
          revisado_em::text AS revisado_em
        FROM children
        ORDER BY nome ASC
      `
    );

    return result.rows.map(mapRow);
  }

  async findById(id: string): Promise<ChildRecord | null> {
    const result = await pool.query<ChildRow>(
      `
        SELECT
          id,
          nome,
          data_nascimento::text AS data_nascimento,
          bairro,
          responsavel,
          saude,
          educacao,
          assistencia_social,
          revisado,
          revisado_por,
          revisado_em::text AS revisado_em
        FROM children
        WHERE id = $1
        LIMIT 1
      `,
      [id]
    );

    return result.rows[0] ? mapRow(result.rows[0]) : null;
  }
}

export const childrenRepository = new ChildrenRepository();