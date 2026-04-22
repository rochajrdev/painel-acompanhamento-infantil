import type { ChildRecord } from "../types/child.types.js";
import { pool } from "../db/database.js";

type ChildRow = ChildRecord;

export interface ChildrenFilters {
  q?: string;
  bairro?: string;
  revisado?: boolean;
  incompleto?: boolean;
}

export interface PaginationOptions {
  page: number;
  pageSize: number;
}

export interface PaginatedChildrenResult {
  items: ChildRecord[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

function normalizeAlertas(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

function normalizeSaude(value: ChildRecord["saude"]): ChildRecord["saude"] {
  if (!value) {
    return null;
  }

  return {
    ultima_consulta: value.ultima_consulta ?? null,
    vacinas_em_dia: value.vacinas_em_dia ?? null,
    alertas: normalizeAlertas(value.alertas)
  };
}

function normalizeEducacao(value: ChildRecord["educacao"]): ChildRecord["educacao"] {
  if (!value) {
    return null;
  }

  return {
    escola: value.escola ?? null,
    frequencia_percent: value.frequencia_percent ?? null,
    alertas: normalizeAlertas(value.alertas)
  };
}

function normalizeAssistenciaSocial(
  value: ChildRecord["assistencia_social"]
): ChildRecord["assistencia_social"] {
  if (!value) {
    return null;
  }

  return {
    cad_unico: value.cad_unico ?? null,
    beneficio_ativo: value.beneficio_ativo ?? null,
    alertas: normalizeAlertas(value.alertas)
  };
}

function mapRow(row: ChildRow): ChildRecord {
  return {
    ...row,
    saude: normalizeSaude(row.saude),
    educacao: normalizeEducacao(row.educacao),
    assistencia_social: normalizeAssistenciaSocial(row.assistencia_social)
  };
}

function buildWhereClause(filters: ChildrenFilters): {
  whereSql: string;
  values: Array<string | boolean>;
} {
  const conditions: string[] = [];
  const values: Array<string | boolean> = [];

  if (filters.q) {
    values.push(`%${filters.q}%`);
    const param = `$${values.length}`;
    conditions.push(`(nome ILIKE ${param} OR responsavel ILIKE ${param} OR id ILIKE ${param})`);
  }

  if (filters.bairro) {
    values.push(`%${filters.bairro}%`);
    conditions.push(`bairro ILIKE $${values.length}`);
  }

  if (typeof filters.revisado === "boolean") {
    values.push(filters.revisado);
    conditions.push(`revisado = $${values.length}`);
  }

  if (typeof filters.incompleto === "boolean") {
    if (filters.incompleto) {
      conditions.push("(saude IS NULL OR educacao IS NULL OR assistencia_social IS NULL)");
    } else {
      conditions.push("(saude IS NOT NULL AND educacao IS NOT NULL AND assistencia_social IS NOT NULL)");
    }
  }

  const whereSql = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  return { whereSql, values };
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

  async findAllPaginated(
    filters: ChildrenFilters,
    pagination: PaginationOptions
  ): Promise<PaginatedChildrenResult> {
    const { whereSql, values } = buildWhereClause(filters);
    const { page, pageSize } = pagination;
    const offset = (page - 1) * pageSize;

    const countResult = await pool.query<{ total: string }>(
      `
        SELECT count(*)::text AS total
        FROM children
        ${whereSql}
      `,
      values
    );

    const total = Number(countResult.rows[0]?.total ?? 0);
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

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
        ${whereSql}
        ORDER BY nome ASC
        LIMIT $${values.length + 1}
        OFFSET $${values.length + 2}
      `
      ,
      [...values, String(pageSize), String(offset)]
    );

    return {
      items: result.rows.map(mapRow),
      total,
      page,
      pageSize,
      totalPages
    };
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

  async markAsReviewed(
    id: string,
    reviewedBy: string
  ): Promise<ChildRecord | null> {
    const result = await pool.query<ChildRow>(
      `
        UPDATE children
        SET
          revisado = true,
          revisado_por = $2,
          revisado_em = now(),
          updated_at = now()
        WHERE id = $1
        RETURNING
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
      `,
      [id, reviewedBy]
    );

    return result.rows[0] ? mapRow(result.rows[0]) : null;
  }
}

export const childrenRepository = new ChildrenRepository();